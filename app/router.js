import EmberRouter from '@ember/routing/router';
import config from 'thetaboard-ui/config/environment';

export default class Router extends EmberRouter {
  constructor(...args) {
    super(...args);
    let pathNames = window.location.pathname.split('/');
    pathNames.shift();
    if (pathNames.length == 2) {
      config.rootURL = `${pathNames[0]}/`;
    }
  }

  location = config.locationType;
  rootURL = config.rootURL;

  init() {
    this._super(...arguments);
    this.on('routeDidChange', transition => {
      if ($('#toggler-navigation.toggled').length) {
        $('.navbar-toggle').click();
      }
    });
  }
}

Router.map(function () {
  this.route('dashboard', { path: '/' });
  this.route('guardian');
  this.route('wallet');
  this.route('domain');
  this.route('faq');
  this.route('not-found', { path: '/*path' });
  this.route('login');
  this.route('signup');
  this.route('registered');
  //Reset password request
  this.route('resetpassword');
  //Password change
  this.route('passwordreset', { path: '/passwordreset/:token' });
  this.route('verify', { path: '/verify/:token' });
  // all routes that require the session to be authenticated
  this.route('staking');
  this.route('my-wallets');
});
