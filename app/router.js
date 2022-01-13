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
  this.route('dashboard', {path: '/'});
  this.route('guardian');
  this.route('wallet', function () {
    this.route('explorer');
    this.route('nft');
    this.route('nft-info', {path: '/nft-info/:contractAddr/:tokenId'});
  });
  this.route('domain', function() {
    this.route('search');
    this.route('my-account');
  });
  this.route('marketplace', function () {
    this.route('drops');
    this.route('drop', {path: '/drop/:dropId'});
    this.route('nft', {path: '/nft/:nftId'});
    this.route('artist', {path: '/artist/:artistId'});
  });
  this.route('policy', function () {
    this.route('terms');
    this.route('privacy');
  });
  this.route('faq');
  this.route('footer');
  this.route('not-found', {path: '/*path'});
  this.route('login');
  this.route('signup');
  this.route('registered');
  //Reset password request
  this.route('resetpassword');
  //Password change
  this.route('passwordreset', {path: '/passwordreset/:token'});
  this.route('verify', {path: '/verify/:token'});
  // all routes that require the session to be authenticated
  this.route('staking', function () {
    this.route('tfuel');
    this.route('theta');
    this.route('tfuelvip');
    this.route('affiliate', {path: '/affiliate/:affiliate'});
  });
  this.route('my-wallets');

  this.route('creators', function () {
    this.route('artists');
    this.route('drops');
    this.route('drop', {path: '/drop/:dropId'});
  });
});
