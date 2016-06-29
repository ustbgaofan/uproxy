/// <reference path='./context.d.ts' />
/// <reference path='../../../../third_party/typings/browser.d.ts' />
/// <reference path='../../../../third_party/polymer/polymer.d.ts' />
'use strict';
var translator = require('../scripts/translator');
var uproxy_core_api = require('../../interfaces/uproxy_core_api');
var ui = ui_context.ui;
var DEFAULT_PROVIDER = 'digitalocean';
//TODO(polyup): Need to add an observer of ui.model.globalSettings.activePromoId, calling promoIdChanged.
//Note that the semantics for observing properties and arrays has changed.
Polymer({
  is: 'uproxy-cloud-install',
  properties: {
    havePromo: { observer: 'havePromoChanged' },
    promoId: { observer: 'promoIdChanged' }
  },
  open: function () {
    // Set translated HTML content - need to use injectBoundHTML
    // in order to enable <uproxy-faq-link>, etc tags in the text.
    this.injectBoundHTML(ui.i18nSanitizeHtml(ui.i18n_t('CLOUD_INSTALL_GET_STARTED_MESSAGE')), this.$.getStartedMessage);
    this.injectBoundHTML(ui.i18nSanitizeHtml(ui.i18n_t('CLOUD_INSTALL_EXISTING_SERVER_MESSAGE')), this.$.existingServerMessage);
    this.injectBoundHTML(ui.i18nSanitizeHtml(ui.i18n_t('CLOUD_INSTALL_CREATE_ACCOUNT_MESSAGE')), this.$.createAccountMessage);
    this.injectBoundHTML(ui.i18nSanitizeHtml(ui.i18n_t('CLOUD_INSTALL_LOGIN_MESSAGE')), this.$.loginMessage);
    this.$.getStartedOverlay.open();
  },
  showLoginOverlay: function () {
    this.closeOverlays();
    this.$.loginOverlay.open();
  },
  launchDigitalOceanSignup: function () {
    // DigitalOcean referral codes trump promo codes,
    // so only add our refcode to the url if the user has no promo code.
    var havePromo = this.$.havePromoCode.checked;
    var registerUrl = 'https://cloud.digitalocean.com/registrations/new';
    var registerUrlWithRefcode = registerUrl + '?refcode=5ddb4219b716';
    ui.openTab(havePromo ? registerUrl : registerUrlWithRefcode);
  },
  launchDigitalOceanSettings: function () {
    ui.openTab('https://cloud.digitalocean.com/droplets');
  },
  back: function () {
    if (this.$.loginOverlay.opened || this.$.failureOverlay.opened) {
      this.closeOverlays();
      this.$.getStartedOverlay.open();
    } else {
      this.closeOverlays();
    }
  },
  closeOverlays: function () {
    this.$.getStartedOverlay.close();
    this.$.loginOverlay.close();
    this.$.installingOverlay.close();
    this.$.successOverlay.close();
    this.$.failureOverlay.close();
    this.$.serverExistsOverlay.close();
    this.$.cancelingOverlay.close();
  },
  loginTapped: function () {
    var _this = this;
    var createId = Math.floor(Math.random() * 1000000) + 1;
    this.mostRecentCreateId = createId;
    if (!this.$.installingOverlay.opened) {
      this.closeOverlays();
      ui.cloudInstallStatus = '';
      this.$.installingOverlay.open();
    }
    ui.cloudUpdate({
      operation: uproxy_core_api.CloudOperationType.CLOUD_INSTALL,
      providerName: DEFAULT_PROVIDER,
      region: this.$.regionMenu.selected
    }).then(function () {
      _this.closeOverlays();
      _this.$.successOverlay.open();
      ui.model.globalSettings.shouldHijackDO = false;
      ui.core.updateGlobalSettings(ui.model.globalSettings);
    }).catch(function (e) {
      // TODO: Figure out why e.message is not set
      if (e === 'Error: server already exists') {
        _this.closeOverlays();
        _this.$.serverExistsOverlay.open();
      } else if (_this.mostRecentCreateId === createId) {
        // The user did not cancel: clean up the now-useless droplet
        // and show a sad-face, rainy day dialog.
        ui.cloudUpdate({
          operation: uproxy_core_api.CloudOperationType.CLOUD_DESTROY,
          providerName: DEFAULT_PROVIDER
        });
        _this.closeOverlays();
        _this.$.failureOverlay.open();
      }
    });
  },
  removeServerAndInstallAgain: function () {
    var _this = this;
    this.mostRecentCreateId = 0;
    this.closeOverlays();
    ui.cloudInstallStatus = ui.i18n_t('REMOVING_UPROXY_CLOUD_STATUS');
    this.$.installingOverlay.open();
    // Destroy uProxy cloud server
    return ui.cloudUpdate({
      operation: uproxy_core_api.CloudOperationType.CLOUD_DESTROY,
      providerName: DEFAULT_PROVIDER
    }).then(function () {
      // Get locally created cloud contact if there is one
      return ui.getCloudUserCreatedByLocal().then(function (user) {
        return ui_context.core.removeContact({
          networkName: user.network.name,
          userId: user.userId
        });
      }).catch(function (e) {
        // Locally created cloud server does not exist
        // so no need to remove contact
        return Promise.resolve();
      });
    }).then(function () {
      return _this.loginTapped();
    });
  },
  cancelCloudInstall: function () {
    var _this = this;
    this.mostRecentCreateId = 0;
    this.$.cancelingOverlay.open();
    return ui.cloudUpdate({
      operation: uproxy_core_api.CloudOperationType.CLOUD_DESTROY,
      providerName: DEFAULT_PROVIDER
    }).then(function () {
      _this.closeOverlays();
      _this.fire('core-signal', {
        name: 'show-toast',
        data: { toastMessage: translator.i18n_t('CLOUD_INSTALL_CANCEL_SUCCESS') }
      });
    }).catch(function (e) {
      _this.$.cancelingOverlay.close();
      _this.fire('core-signal', {
        name: 'show-toast',
        data: { toastMessage: translator.i18n_t('CLOUD_INSTALL_CANCEL_FAILURE') }
      });
    });
  },
  select: function (e, d, input) {
    input.focus();
    input.select();
  },
  ready: function () {
    this.ui = ui;
    // ID of the latest attempt to create a server, used to distinguish
    // between install failures that should be flagged to the user and
    // failures owing to cancellation. We use a random number rather
    // than a simple boolean because, in the event of cancellation, it
    // can take *several* seconds for the installer to fail by which time
    // the user could have initiated a whole new install.
    this.mostRecentCreateId = 0;
  },
  promoIdChanged: function () {
    // do not uncheck the box if we no longer have the promo id set
    if (ui.model.globalSettings.activePromoId) {
      this.set('$.havePromoCode.checked', true);
    }
  },
  havePromoChanged: function () {
    ui.model.globalSettings.activePromoId = this.$.havePromoCode.checked;
  },
  _computeLabel: function () {
    return this.$$('HAVE_PROMO_CODE');
  },
  _computeLabel2: function () {
    return this.$$('ASIA_SINGAPORE');
  },
  _computeLabel3: function () {
    return this.$$('ASIA_BANGALORE');
  },
  _computeLabel4: function () {
    return this.$$('EUROPE_AMSTERDAM');
  },
  _computeLabel5: function () {
    return this.$$('NORTH_AMERICA_NEW_YORK');
  },
  _computeExpression29: function () {
    return this.$$('CREATE_A_CLOUD_SERVER');
  },
  _computeExpression2: function () {
    return this.$$('CLOUD_INSTALL_GET_STARTED_TITLE');
  },
  _computeExpression3: function () {
    return this.$$('CREATE_A_NEW_ACCOUNT');
  },
  _computeExpression4: function () {
    return this.$$('I_HAVE_AN_ACCOUNT');
  },
  _computeExpression5: function () {
    return this.$$('CLOUD_INSTALL_EXISTING_SERVER_TITLE');
  },
  _computeExpression7: function () {
    return this.$$('CLOUD_INSTALL_LOGIN_TITLE');
  },
  _computeExpression8: function () {
    return this.$$('SIGN_IN_AND_CONNECT');
  },
  _computeExpression10: function () {
    return this.$$('CLOUD_INSTALL_INSTALLING_TITLE');
  },
  _computeExpression11: function () {
    return this.$$('CLOUD_INSTALL_INSTALLING_WARNING');
  },
  _computeExpression12: function () {
    return this.$$('CLOUD_INSTALL_INSTALLING_MESSAGE');
  },
  _computeExpression28: function () {
    return this.$$('CANCEL');
  },
  _computeExpression16: function () {
    return this.$$('CLOUD_INSTALL_SUCCESS_TITLE');
  },
  _computeExpression17: function () {
    return this.$$('CLOUD_INSTALL_SUCCESS_MESSAGE');
  },
  _computeExpression18: function () {
    return this.$$('CONTINUE');
  },
  _computeExpression20: function () {
    return this.$$('CLOUD_INSTALL_ERROR_TITLE');
  },
  _computeExpression21: function () {
    return this.$$('DIGITAL_OCEAN_ERROR_MESSAGE');
  },
  _computeExpression22: function () {
    return this.$$('TRY_AGAIN');
  },
  _computeExpression23: function () {
    return this.$$('LAUNCH_DIGITAL_OCEAN_SETTINGS');
  },
  _computeExpression25: function () {
    return this.$$('CLOUD_INSTALL_ERROR_EXISTING_SERVER_TITLE');
  },
  _computeExpression26: function () {
    return this.$$('CLOUD_INSTALL_ERROR_EXISTING_SERVER_MESSAGE');
  },
  _computeExpression27: function () {
    return this.$$('REMOVE_SERVER_AND_TRY_AGAIN');
  },
  _computeExpression30: function () {
    return this.$$('CLOUD_INSTALL_CANCEL_TITLE');
  },
  _computeExpression31: function () {
    return this.$$('CLOUD_INSTALL_CANCEL_MESSAGE');
  }
});
