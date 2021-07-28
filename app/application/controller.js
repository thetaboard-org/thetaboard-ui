import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class ApplicationController extends Controller {
  queryParams = ['wa', 'group'];

  @tracked wa;
  @tracked group;

  @service router;
  @service session;
  @service currentUser;

  get isShowMenu() {
    return (
      this.isLogin ||
      this.isSignup ||
      this.isRegistered ||
      this.isVerify ||
      this.isResetPassword
    );
  }

  get isLogin() {
    return this.routeName == 'login';
  }

  get isSignup() {
    return this.routeName == 'signup';
  }

  get isRegistered() {
    return this.routeName == 'registered';
  }

  get isVerify() {
    return this.routeName == 'verify';
  }

  get isResetPassword() {
    return (
      this.routeName == 'resetpassword' || this.routeName == 'passwordreset'
    );
  }

  get routeName() {
    if (this.router && this.router.currentRoute) {
      return this.router.currentRoute.name;
    }
    return '';
  }

  @action
  setQueryParam(value, type) {
    if (type == 'group') {
      this.group = value;
      this.wa = null;
    } else {
      this.wa = value;
      this.group = null;
    }
  }
}
