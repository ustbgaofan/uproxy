/// <reference path='../../../third_party/typings/browser.d.ts' />
import kv = require('./key-verify');
import logging = require('../lib/logging/logging');

var log:logging.Log = new logging.Log('KeyVerify-Test');

// Real conversations.  To find out what happens when people stop
// being polite... and start getting real.
var firstConversation :{[name:string]:kv.Messages.Tagged} = JSON.parse(
'{"0":{"type":0,"value":{"type":"Hello1","version":"1.0","h3":"26ClYJV9iMI95iFBEgXNJEXYPeXtXqjzrE4RM4OpIkc=","hk":"9hgE544kKOXLIqfw20Fz0c2+huEKhwnZWEz9Nf9uFNk=","clientVersion":"0.1","mac":"fak="}},"1":{"type":1,"value":{"type":"Hello2","version":"1.0","h3":"8v5/oYXfkoYbhMg+UTbX9ROoYITbgt6UBR9nOnXnGQI=","hk":"c+JM1FgguFqR6qOLL3CH4cB3lL9HK283OjiSpmYXkfk=","clientVersion":"0.1","mac":"Hro="}},"2":{"type":2,"value":{"type":"Commit","h2":"oTv8z5dS+1c3Q2AbJKoOreXmuOvLryjMfUWEUt41yvg=","hk":"9hgE544kKOXLIqfw20Fz0c2+huEKhwnZWEz9Nf9uFNk=","clientVersion":"0.1","hvi":"i1fkdFvPjOOEaK1Q78HxzNcoJDfpF6tvWPeHMm/YIs8=","mac":"UGo="}},"3":{"type":3,"value":{"type":"DHPart1","h1":"w5LREWg/J+ItRKB2pSeYPiTtSkXmOibKxPk3QNNFevc=","pkey":"-----BEGIN PGP PUBLIC KEY BLOCK-----\r\nCharset: UTF-8\r\n\r\nxv8AAABSBAAAAAATCCqGSM49AwEHAgMEnA9gk+UAmucebovPjEOrc35xQXEyWaKk\r\nc+nq3BfTiNuRAQjX+wK+UWOknWqLC3CN3WeqNbxF8m0jvryQoP17As3/AAAACDx1\r\ncHJveHk+wv8AAACOBBATCABA/wAAAAWCVzuMX/8AAAACiwn/AAAACZCs+1MXtAPT\r\nbf8AAAAFlQgJCgv/AAAABJYDAQL/AAAAApsD/wAAAAKeAQAAPi8A/itF8etFcjQB\r\nHvpgi4QQhYSbOgp7kNd8XJLrcffW1Pd7AQDHmdm7JMcVcchveq6vTRwPspsHIPPf\r\n7yVurHnbNCPwXc7/AAAAVgQAAAAAEggqhkjOPQMBBwIDBDyb3fhzVd9BhQk/FL3v\r\nZfUaEe+x41k1bHgAzr5/4oeIdVBRwbLYvLniHNdx3lv1Y1yeGbdvSarHYfiszS7q\r\nlbEDAQgHwv8AAABtBBgTCAAf/wAAAAWCVzuMX/8AAAAJkKz7Uxe0A9Nt/wAAAAKb\r\nDAAA4/wA+wfuGTFzF4KrtvMTwErEAc0a6BrMfGJC4bkKG+2/OLt+AQCzobQq55He\r\nNn13wbNHizZH0JxVJGCjmMEXpcL4VnvuXw==\r\n=0Wib\r\n-----END PGP PUBLIC KEY BLOCK-----\r\n","mac":"Ulg="}},"4":{"type":4,"value":{"type":"DHPart2","h1":"o7I+0Ap12xfe9gP3VWnBfcMwSdE2ABIUv/xLDVv97bs=","pkey":"-----BEGIN PGP PUBLIC KEY BLOCK-----\r\nCharset: UTF-8\r\n\r\nxv8AAABSBAAAAAATCCqGSM49AwEHAgME3hDTVSeLUfVtiD2A6PT0hM7xVkaA3QyI\r\nB/ColtnaZZWma8auxIeZyVVMt1JsTqo0EFax2F89gk/sDvnuKStdls3/AAAACDx1\r\ncHJveHk+wv8AAACOBBATCABA/wAAAAWCV0RtDv8AAAACiwn/AAAACZD5PRaWhUFb\r\np/8AAAAFlQgJCgv/AAAABJYDAQL/AAAAApsD/wAAAAKeAQAA+BcBALKIjwYlBtS3\r\nywXm5aSAN2CmrS+s6CzU+d+q94pUjb2XAQDQuMnmzyLsmTGrh4gD27jpiwi/nhBb\r\nbhaxdekDXPoAfs7/AAAAVgQAAAAAEggqhkjOPQMBBwIDBPCc9PryOnN43I5pz/vM\r\n0lLe/9v1+TWlpPbjx5kZJEnE9hV14SEYzDymVBiwzt25cm8KXGObEmMXYm8qlEtV\r\nHUQDAQgHwv8AAABtBBgTCAAf/wAAAAWCV0RtDv8AAAAJkPk9FpaFQVun/wAAAAKb\r\nDAAA18YBAKrlsXnzNMtnWmX66cZ6YJL4vuV40R3O7g4FAjinWQS5AQDmSQt9ibni\r\nMgI4FqWakK9QcVnxO2L7YPVXQ9wmf8Zosw==\r\n=gDSe\r\n-----END PGP PUBLIC KEY BLOCK-----\r\n","mac":"/nM="}},"5":{"type":5,"value":{"type":"Confirm1","h0":"zmumXmnlHGh2K0dL+dzucvhxdF8xOsV10FJOsSbk2Lw=","mac":"vww="}},"6":{"type":6,"value":{"type":"Confirm2","h0":"HKdTzYXOjfbVG8qPiKahumqsBKhHOJiPzWhgIyyaWUg=","mac":"X+8="}},"7":{"type":7,"value":{"type":"Conf2Ack"}}}'
);
var firstHashes :kv.Hashes = JSON.parse(
  '{"h0":{"bin":{"type":"Buffer","data":[28,167,83,205,133,206,141,246,213,27,202,143,136,166,161,186,106,172,4,168,71,56,152,143,205,104,96,35,44,154,89,72]},"b64":"HKdTzYXOjfbVG8qPiKahumqsBKhHOJiPzWhgIyyaWUg="},"h1":{"bin":{"type":"Buffer","data":[163,178,62,208,10,117,219,23,222,246,3,247,85,105,193,125,195,48,73,209,54,0,18,20,191,252,75,13,91,253,237,187]},"b64":"o7I+0Ap12xfe9gP3VWnBfcMwSdE2ABIUv/xLDVv97bs="},"h2":{"bin":{"type":"Buffer","data":[161,59,252,207,151,82,251,87,55,67,96,27,36,170,14,173,229,230,184,235,203,175,40,204,125,69,132,82,222,53,202,248]},"b64":"oTv8z5dS+1c3Q2AbJKoOreXmuOvLryjMfUWEUt41yvg="},"h3":{"bin":{"type":"Buffer","data":[219,160,165,96,149,125,136,194,61,230,33,65,18,5,205,36,69,216,61,229,237,94,168,243,172,78,17,51,131,169,34,71]},"b64":"26ClYJV9iMI95iFBEgXNJEXYPeXtXqjzrE4RM4OpIkc="}}'
);
var firstPeerPubKey: any = JSON.parse(
  '-----BEGIN PGP PUBLIC KEY BLOCK-----\n' +
    'Charset: UTF-8\n' +
    '\n' +
    'xv8AAABSBAAAAAATCCqGSM49AwEHAgMEnA9gk+UAmucebovPjEOrc35xQXEyWaKk\n' +
    'c+nq3BfTiNuRAQjX+wK+UWOknWqLC3CN3WeqNbxF8m0jvryQoP17As3/AAAACDx1\n' +
    'cHJveHk+wv8AAACOBBATCABA/wAAAAWCVzuMX/8AAAACiwn/AAAACZCs+1MXtAPT\n' +
    'bf8AAAAFlQgJCgv/AAAABJYDAQL/AAAAApsD/wAAAAKeAQAAPi8A/itF8etFcjQB\n' +
    'Hvpgi4QQhYSbOgp7kNd8XJLrcffW1Pd7AQDHmdm7JMcVcchveq6vTRwPspsHIPPf\n' +
    '7yVurHnbNCPwXc7/AAAAVgQAAAAAEggqhkjOPQMBBwIDBDyb3fhzVd9BhQk/FL3v\n' +
    'ZfUaEe+x41k1bHgAzr5/4oeIdVBRwbLYvLniHNdx3lv1Y1yeGbdvSarHYfiszS7q\n' +
    'lbEDAQgHwv8AAABtBBgTCAAf/wAAAAWCVzuMX/8AAAAJkKz7Uxe0A9Nt/wAAAAKb\n' +
    'DAAA4/wA+wfuGTFzF4KrtvMTwErEAc0a6BrMfGJC4bkKG+2/OLt+AQCzobQq55He\n' +
    'Nn13wbNHizZH0JxVJGCjmMEXpcL4VnvuXw==\n' +
    '=0Wib\n' +
    '-----END PGP PUBLIC KEY BLOCK-----\n'
);
var firstPubKey: freedom.PgpProvider.PublicKey = JSON.parse(
  '{"key":"-----BEGIN PGP PUBLIC KEY BLOCK-----\r\nCharset: UTF-8\r\n\r\nxv8AAABSBAAAAAATCCqGSM49AwEHAgME3hDTVSeLUfVtiD2A6PT0hM7xVkaA3QyI\r\nB/ColtnaZZWma8auxIeZyVVMt1JsTqo0EFax2F89gk/sDvnuKStdls3/AAAACDx1\r\ncHJveHk+wv8AAACOBBATCABA/wAAAAWCV0RtDv8AAAACiwn/AAAACZD5PRaWhUFb\r\np/8AAAAFlQgJCgv/AAAABJYDAQL/AAAAApsD/wAAAAKeAQAA+BcBALKIjwYlBtS3\r\nywXm5aSAN2CmrS+s6CzU+d+q94pUjb2XAQDQuMnmzyLsmTGrh4gD27jpiwi/nhBb\r\nbhaxdekDXPoAfs7/AAAAVgQAAAAAEggqhkjOPQMBBwIDBPCc9PryOnN43I5pz/vM\r\n0lLe/9v1+TWlpPbjx5kZJEnE9hV14SEYzDymVBiwzt25cm8KXGObEmMXYm8qlEtV\r\nHUQDAQgHwv8AAABtBBgTCAAf/wAAAAWCV0RtDv8AAAAJkPk9FpaFQVun/wAAAAKb\r\nDAAA18YBAKrlsXnzNMtnWmX66cZ6YJL4vuV40R3O7g4FAjinWQS5AQDmSQt9ibni\r\nMgI4FqWakK9QcVnxO2L7YPVXQ9wmf8Zosw==\r\n=gDSe\r\n-----END PGP PUBLIC KEY BLOCK-----\r\n","fingerprint":"1426 3D6B 882A AE9D 2705  DEBA F93D 1696 8541 5BA7","words":["baboon","caretaker","commence","Hamilton","newborn","chambermaid","robust","Ohio","brackish","almighty","tactics","puberty","waffle","crucifix","backward","monument","music","decadence","erase","paragraph"]}'
);
var secondConversation :{[name:string]:kv.Messages.Tagged} = JSON.parse(
  '{"0":{"type":0,"value":{"type":"Hello1","version":"1.0","h3":"7jOnnonThKoXwBqUQgr48Cw3SKw++xOAaHHbAHxE9E8=","hk":"9hgE544kKOXLIqfw20Fz0c2+huEKhwnZWEz9Nf9uFNk=","clientVersion":"0.1","mac":"TTY="}},"1":{"type":1,"value":{"type":"Hello2","version":"1.0","h3":"3VVxeguwvQr9P1P66XArgWxz4u6WPWmlKcXJEVj59fw=","hk":"c+JM1FgguFqR6qOLL3CH4cB3lL9HK283OjiSpmYXkfk=","clientVersion":"0.1","mac":"edU="}},"2":{"type":2,"value":{"type":"Commit","h2":"FoeK0AI4SqfTyaxy0n1E+BhrzXqhSH691AtjrK1Cebg=","hk":"9hgE544kKOXLIqfw20Fz0c2+huEKhwnZWEz9Nf9uFNk=","clientVersion":"0.1","hvi":"yysWeSm1cy9N24ARxtqPsOELhM9dz3QjcdEzk8yT6Js=","mac":"FgM="}},"3":{"type":3,"value":{"type":"DHPart1","h1":"ntm65A5g/ikQWT6m9Ae5kP2GoOOJR/qlRGOpYd2BfvI=","pkey":"-----BEGIN PGP PUBLIC KEY BLOCK-----\r\nCharset: UTF-8\r\n\r\nxv8AAABSBAAAAAATCCqGSM49AwEHAgMEnA9gk+UAmucebovPjEOrc35xQXEyWaKk\r\nc+nq3BfTiNuRAQjX+wK+UWOknWqLC3CN3WeqNbxF8m0jvryQoP17As3/AAAACDx1\r\ncHJveHk+wv8AAACOBBATCABA/wAAAAWCVzuMX/8AAAACiwn/AAAACZCs+1MXtAPT\r\nbf8AAAAFlQgJCgv/AAAABJYDAQL/AAAAApsD/wAAAAKeAQAAPi8A/itF8etFcjQB\r\nHvpgi4QQhYSbOgp7kNd8XJLrcffW1Pd7AQDHmdm7JMcVcchveq6vTRwPspsHIPPf\r\n7yVurHnbNCPwXc7/AAAAVgQAAAAAEggqhkjOPQMBBwIDBDyb3fhzVd9BhQk/FL3v\r\nZfUaEe+x41k1bHgAzr5/4oeIdVBRwbLYvLniHNdx3lv1Y1yeGbdvSarHYfiszS7q\r\nlbEDAQgHwv8AAABtBBgTCAAf/wAAAAWCVzuMX/8AAAAJkKz7Uxe0A9Nt/wAAAAKb\r\nDAAA4/wA+wfuGTFzF4KrtvMTwErEAc0a6BrMfGJC4bkKG+2/OLt+AQCzobQq55He\r\nNn13wbNHizZH0JxVJGCjmMEXpcL4VnvuXw==\r\n=0Wib\r\n-----END PGP PUBLIC KEY BLOCK-----\r\n","mac":"6wo="}},"4":{"type":4,"value":{"type":"DHPart2","h1":"sYUbnSBt5csDBmZExsDG0yN65C53jngXgUK/4Cepv60=","pkey":"-----BEGIN PGP PUBLIC KEY BLOCK-----\r\nCharset: UTF-8\r\n\r\nxv8AAABSBAAAAAATCCqGSM49AwEHAgME3hDTVSeLUfVtiD2A6PT0hM7xVkaA3QyI\r\nB/ColtnaZZWma8auxIeZyVVMt1JsTqo0EFax2F89gk/sDvnuKStdls3/AAAACDx1\r\ncHJveHk+wv8AAACOBBATCABA/wAAAAWCV0RtDv8AAAACiwn/AAAACZD5PRaWhUFb\r\np/8AAAAFlQgJCgv/AAAABJYDAQL/AAAAApsD/wAAAAKeAQAA+BcBALKIjwYlBtS3\r\nywXm5aSAN2CmrS+s6CzU+d+q94pUjb2XAQDQuMnmzyLsmTGrh4gD27jpiwi/nhBb\r\nbhaxdekDXPoAfs7/AAAAVgQAAAAAEggqhkjOPQMBBwIDBPCc9PryOnN43I5pz/vM\r\n0lLe/9v1+TWlpPbjx5kZJEnE9hV14SEYzDymVBiwzt25cm8KXGObEmMXYm8qlEtV\r\nHUQDAQgHwv8AAABtBBgTCAAf/wAAAAWCV0RtDv8AAAAJkPk9FpaFQVun/wAAAAKb\r\nDAAA18YBAKrlsXnzNMtnWmX66cZ6YJL4vuV40R3O7g4FAjinWQS5AQDmSQt9ibni\r\nMgI4FqWakK9QcVnxO2L7YPVXQ9wmf8Zosw==\r\n=gDSe\r\n-----END PGP PUBLIC KEY BLOCK-----\r\n","mac":"srw="}},"5":{"type":5,"value":{"type":"Confirm1","h0":"nPr6RHNixnKBYvhys7n0ZfI/tCiIu5yq/NtqM2Un4zU=","mac":"rBs="}},"6":{"type":6,"value":{"type":"Confirm2","h0":"5vutgB9+mXk1ADZYeFNek+Qy+fGdlk2XgGB/Kb2cR4A=","mac":"fzU="}},"7":{"type":7,"value":{"type":"Conf2Ack"}}}'
);
var secondHashes :kv.Hashes = JSON.parse(
  '{"h0":{"bin":{"type":"Buffer","data":[230,251,173,128,31,126,153,121,53,0,54,88,120,83,94,147,228,50,249,241,157,150,77,151,128,96,127,41,189,156,71,128]},"b64":"5vutgB9+mXk1ADZYeFNek+Qy+fGdlk2XgGB/Kb2cR4A="},"h1":{"bin":{"type":"Buffer","data":[177,133,27,157,32,109,229,203,3,6,102,68,198,192,198,211,35,122,228,46,119,142,120,23,129,66,191,224,39,169,191,173]},"b64":"sYUbnSBt5csDBmZExsDG0yN65C53jngXgUK/4Cepv60="},"h2":{"bin":{"type":"Buffer","data":[22,135,138,208,2,56,74,167,211,201,172,114,210,125,68,248,24,107,205,122,161,72,126,189,212,11,99,172,173,66,121,184]},"b64":"FoeK0AI4SqfTyaxy0n1E+BhrzXqhSH691AtjrK1Cebg="},"h3":{"bin":{"type":"Buffer","data":[238,51,167,158,137,211,132,170,23,192,26,148,66,10,248,240,44,55,72,172,62,251,19,128,104,113,219,0,124,68,244,79]},"b64":"7jOnnonThKoXwBqUQgr48Cw3SKw++xOAaHHbAHxE9E8="}}'
);
var secondPeerPubKey: any = JSON.parse(
  '-----BEGIN PGP PUBLIC KEY BLOCK-----\n' +
    'Charset: UTF-8\n' +
    '\n' +
    'xv8AAABSBAAAAAATCCqGSM49AwEHAgMEnA9gk+UAmucebovPjEOrc35xQXEyWaKk\n' +
    'c+nq3BfTiNuRAQjX+wK+UWOknWqLC3CN3WeqNbxF8m0jvryQoP17As3/AAAACDx1\n' +
    'cHJveHk+wv8AAACOBBATCABA/wAAAAWCVzuMX/8AAAACiwn/AAAACZCs+1MXtAPT\n' +
    'bf8AAAAFlQgJCgv/AAAABJYDAQL/AAAAApsD/wAAAAKeAQAAPi8A/itF8etFcjQB\n' +
    'Hvpgi4QQhYSbOgp7kNd8XJLrcffW1Pd7AQDHmdm7JMcVcchveq6vTRwPspsHIPPf\n' +
    '7yVurHnbNCPwXc7/AAAAVgQAAAAAEggqhkjOPQMBBwIDBDyb3fhzVd9BhQk/FL3v\n' +
    'ZfUaEe+x41k1bHgAzr5/4oeIdVBRwbLYvLniHNdx3lv1Y1yeGbdvSarHYfiszS7q\n' +
    'lbEDAQgHwv8AAABtBBgTCAAf/wAAAAWCVzuMX/8AAAAJkKz7Uxe0A9Nt/wAAAAKb\n' +
    'DAAA4/wA+wfuGTFzF4KrtvMTwErEAc0a6BrMfGJC4bkKG+2/OLt+AQCzobQq55He\n' +
    'Nn13wbNHizZH0JxVJGCjmMEXpcL4VnvuXw==\n' +
    '=0Wib\n' +
    '-----END PGP PUBLIC KEY BLOCK-----\n'
);
var secondPubKey: freedom.PgpProvider.PublicKey = JSON.parse(
  '{"key":"-----BEGIN PGP PUBLIC KEY BLOCK-----\r\nCharset: UTF-8\r\n\r\nxv8AAABSBAAAAAATCCqGSM49AwEHAgME3hDTVSeLUfVtiD2A6PT0hM7xVkaA3QyI\r\nB/ColtnaZZWma8auxIeZyVVMt1JsTqo0EFax2F89gk/sDvnuKStdls3/AAAACDx1\r\ncHJveHk+wv8AAACOBBATCABA/wAAAAWCV0RtDv8AAAACiwn/AAAACZD5PRaWhUFb\r\np/8AAAAFlQgJCgv/AAAABJYDAQL/AAAAApsD/wAAAAKeAQAA+BcBALKIjwYlBtS3\r\nywXm5aSAN2CmrS+s6CzU+d+q94pUjb2XAQDQuMnmzyLsmTGrh4gD27jpiwi/nhBb\r\nbhaxdekDXPoAfs7/AAAAVgQAAAAAEggqhkjOPQMBBwIDBPCc9PryOnN43I5pz/vM\r\n0lLe/9v1+TWlpPbjx5kZJEnE9hV14SEYzDymVBiwzt25cm8KXGObEmMXYm8qlEtV\r\nHUQDAQgHwv8AAABtBBgTCAAf/wAAAAWCV0RtDv8AAAAJkPk9FpaFQVun/wAAAAKb\r\nDAAA18YBAKrlsXnzNMtnWmX66cZ6YJL4vuV40R3O7g4FAjinWQS5AQDmSQt9ibni\r\nMgI4FqWakK9QcVnxO2L7YPVXQ9wmf8Zosw==\r\n=gDSe\r\n-----END PGP PUBLIC KEY BLOCK-----\r\n","fingerprint":"1426 3D6B 882A AE9D 2705  DEBA F93D 1696 8541 5BA7","words":["baboon","caretaker","commence","Hamilton","newborn","chambermaid","robust","Ohio","brackish","almighty","tactics","puberty","waffle","crucifix","backward","monument","music","decadence","erase","paragraph"]}'
);

class ConversationResponder implements kv.Delegate {
  private lastSent_ :kv.Type;
  private verifier_ :kv.KeyVerify;
  constructor(
    private log_ :{[name:string]:kv.Messages.Tagged}
  ) {}

  public setup(verifier :kv.KeyVerify) {
    this.lastSent_ = null;
    this.verifier_ = verifier;
  }

  public sendMessage(msg:Object) :Promise<void> {
    var msgKey :string = null;
    var msgAny :any = msg;
    var type :string = msgAny.type;
    if (!type) {
      console.log("INVALID MESSAGE");
    } else {
      if (JSON.stringify(this.log_[type]) !== JSON.stringify(msg)) {
        console.log('Message differs from log.');
      }
    }
    switch (type) {
    case 'Hello1':
      msgKey = 'Hello2';
      break;
    case 'Commit':
      msgKey = 'DHPart1';
      break;
    case 'DHPart2':
      msgKey = 'Confirm1';
      break;
    case 'Confirm2':
      msgKey = 'Conf2Ack';
      break;
    }
    setTimeout(() => {
      this.verifier_.readMessage(this.log_[msgKey]);
    }, 0);
    return Promise.resolve<void>();
  }

  public showSAS(sas:string) :Promise<boolean> {
    console.log('SAS is ' + sas);
    return Promise.resolve<boolean>(true);
  }
}


describe('key-verify', () => {
  //
  // Test Plan
  //
  // 1. Re-run an existing transcript, verify that it succeeds.
  // --- The rest should fail ---
  // 2. Clear-mutation tests:
  //    - Delete, clear, and swap fields in individual messages.
  // 3. Swap tests
  //    - Swap messages from two conversations.
  //    - Swap same fields from different messages.
  it ('Succeeds on good conversation.', (done) => {
    var responder = new ConversationResponder(firstConversation);
    var verify = new kv.KeyVerify(
      null, // I need to get this,
      responder,
      {},
      true,
      firstHashes);
    responder.setup(verify);
    verify.start().then( () => {
      expect(true).toBe(true);
      done();
    }).catch((e:any) => {
      expect(e).toBeUndefined();
      done();
    });
  });
});