import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class ApplicationController extends Controller {
  queryParams = ['wa'];

  @tracked wa;

  @service router;

  get isLogin() {
    return this.routeName == 'login';
  }

  get isSignup() {
    return this.routeName == 'signup';
  }

  get routeName() {
    return this.router.currentRoute.name;
  }

  @action
  setQueryParam(walletAddress) {
    this.wa = walletAddress;
  }
}
