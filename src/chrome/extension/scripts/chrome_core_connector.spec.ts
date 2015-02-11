/// <reference path='chrome_core_connector.ts' />
/// <reference path='../../../generic_ui/scripts/core_connector.ts' />
/// <reference path='../../../generic_ui/scripts/ui.ts' />
/// <reference path='../../../third_party/typings/jasmine/jasmine.d.ts' />


// Mock for the Chrome App's port as if the App actually exists.
var mockAppPort = () => {
  return {
    name: 'mock-port',
    postMessage: (msg :string) => {},
    disconnect: () => {},
    onMessage: {
      addListener: () => {},
      removeListener: () => {}
    },
    onDisconnect: {
      addListener: () => {},
      removeListener: () => {}
    }
  };
};

// Mock UI.
var ui :UI.UserInterface;
var chromeBrowserApi :ChromeBrowserApi;

// The ordering of the specs matter, as they provide a connect / disconnect
// sequence on the chromeCoreConnector object.
describe('core-connector', () => {

  ui = jasmine.createSpyObj('UI.UserInterface',
    ['stopGettingInUiAndConfig',
    'sync',
    'update',
    'syncUser',
    'showNotification']);
  chromeBrowserApi = jasmine.createSpyObj('ChromeBrowserApi',
    ['updatePopupUrl',
     'bringUproxyToFront']);

  var chromeCoreConnector :ChromeCoreConnector;
  chromeCoreConnector = new ChromeCoreConnector();

  var core = new CoreConnector(chromeCoreConnector);

  var connectPromise :Promise<void>;

  beforeEach(() => {
    spyOn(console, 'log');
  });

  it('attempts chrome.runtime.connect().', () => {
    spyOn(chromeCoreConnector, 'connect').and.callThrough()
    // Get chrome.runtime.connect to return null as if there were no App to
    // connect to.
    // chrome.runtime and chrome.browserAction are mocks found in
    // chrome_mocks.ts.
    spyOn(chrome.runtime, 'connect').and.returnValue(null);
    connectPromise = chromeCoreConnector.connect();
    expect(chrome.runtime.connect).toHaveBeenCalled();
  });

  it('fails to connect with no App present.', (done) => {
    connectPromise.catch((e) => {
      expect(chromeCoreConnector.status.connected).toEqual(false);
      expect(chromeCoreConnector['appPort_']).toEqual(null);
    }).then(done);
  });

  it('continues polling while disconnected.', (done) => {
    // Spying with a fake will prevent the actual implementations polling
    // behavior after its caught. This allows the next spec to start fresh.
    spyOn(chromeCoreConnector, 'connect').and.callFake(() => {
      console.log('caught connection retry.');
      connectPromise = null;
      done();
    });
  });

  var port = mockAppPort();
  var disconnect :Function = null;

  it('connects to App when present.', (done) => {
    var acker = null;
    // A 'valid' chrome.runtime.Port indicates successful connection.
    spyOn(chrome.runtime, 'connect').and.returnValue(port);
    spyOn(port.onMessage, 'addListener').and.callFake((handler) => {
      if (null !== acker) {
        expect(handler).toEqual(chromeCoreConnector['receive_']);
        return;
      }
      spyOn(port.onMessage, 'removeListener');
      // Extract ack function from the depths of chromeCoreConnector.
      acker = handler;
    });
    // Short-circuit postMessage to pretend Chrome App ACKS correctly.
    spyOn(port, 'postMessage').and.callFake((msg) => {
      expect(port.postMessage).toHaveBeenCalledWith(ChromeMessage.CONNECT);
      expect(acker).not.toBeNull();
      acker(ChromeMessage.ACK);
    });

    // Capture the disconnection fulfillment or next spec.
    spyOn(port.onDisconnect, 'addListener').and.callFake((f) => {
      disconnect = f;
    });

    // Begin successful connection attempt to App.
    spyOn(chromeCoreConnector, 'send').and.callFake(() => {});
    spyOn(chrome.browserAction, 'setIcon');
    expect(chromeCoreConnector.status.connected).toEqual(false);
    chromeCoreConnector.connect().then(() => {
      expect(chromeCoreConnector['appPort_']).not.toBeNull();
      expect(port.onMessage.removeListener).toHaveBeenCalled();
      expect(chromeCoreConnector.status.connected).toEqual(true);
      // Check that onUpdate callbacks were successfully sent to app.
      expect(chromeCoreConnector['send']).toHaveBeenCalledWith({
        cmd: 'on', type: uProxy.Update.COMMAND_FULFILLED
      });
      expect(chromeCoreConnector['send']).toHaveBeenCalledWith({
        cmd: 'on', type: uProxy.Update.COMMAND_REJECTED
      });
      expect(chrome.browserAction['setIcon']).toHaveBeenCalledWith(
        {path: "icons/" + UI.LOGGED_OUT_ICON});
    }).then(done);
  });

  var resumedPolling = false;

  it('disconnection cleans up state and retries connect.', (done) => {
    // This test may take seconds (SYNC_TIMEOUT) before completion
    // due to setTimeout call in disconnect().  If we need to speed up this
    // test we could instead mock out window.setTimeout and verify that it
    // is called with the expected params.
    expect(disconnect).not.toBeNull();
    spyOn(chromeCoreConnector, 'connect').and.callFake(() => { done(); })
    disconnect();
    expect(chromeCoreConnector.status.connected).toEqual(false);
    expect(chromeCoreConnector['appPort_']).toBeNull();
    expect(ui.stopGettingInUiAndConfig).toHaveBeenCalled();
  });

  it('send queues message while disconnected.', () => {
    var payload = { cmd: 'test1', type: 1 };
    chromeCoreConnector['send'](payload);
    expect(chromeCoreConnector['queue_']).toEqual([
        { cmd: 'test1', type: 1 }
    ]);
  });

  it('queues messages in the right order.', () => {
    var payload = { cmd: 'test2', type: 2 };
    chromeCoreConnector['send'](payload);
    expect(chromeCoreConnector['queue_']).toEqual([
        { cmd: 'test1', type: 1 },
        { cmd: 'test2', type: 2 }
    ]);
  });

  var flushed = false;

  // This is a stripped down version of a previous spec, to get the
  // ChromeAppConnector into a consistent state for testing the communications
  // specs.
  it('reconnects to App when it returns.', (done) => {
    var port = mockAppPort();
    var acker = null;
    spyOn(chrome.runtime, 'connect').and.returnValue(port);
    spyOn(port.onMessage, 'addListener').and.callFake((handler) => {
      if (null !== acker) { return; }
      acker = handler;
    });
    spyOn(port, 'postMessage').and.callFake((msg) => {
      acker(ChromeMessage.ACK);
    });
    // Spy the queue flusher for the next spec.
    spyOn(chromeCoreConnector, 'flushQueue').and.callFake(() => {
      flushed = true;
    });
    // Begin successful connection attempt to App.
    expect(chromeCoreConnector.status.connected).toEqual(false);
    chromeCoreConnector.connect().then(() => {
      expect(chromeCoreConnector.status.connected).toEqual(true);
    }).then(done);
  });

  it('flushes queue upon connection.', () => {
    expect(flushed).toEqual(true);
  });

  it('flushes the queue correctly.', () => {
    var flushed = [];
    spyOn(chromeCoreConnector, 'send').and.callFake((payload) => {
      flushed.push(payload);
    });
    chromeCoreConnector.flushQueue();
    expect(chromeCoreConnector['queue_']).toEqual([]);
    expect(flushed).toEqual([
        { cmd: 'test1', type: 1 },
        { cmd: 'test2', type: 2 }
    ]);
  });

  it('onUpdate calls send.', () => {
    spyOn(chromeCoreConnector, 'send');
    // TODO: Cannot use the uProxy.Update enum until the 'common' communications
    // chromeCoreConnector.onUpdate(uProxy.Update.ALL, () => {});
    // typescript file is ready.
    // expect(chromeCoreConnector['send']).toHaveBeenCalledWith({
      // cmd: 'on',
      // type: uProxy.Update.ALL
    // });
  });

  // TODO: Test the rest of the Update and Command functionality.

});
