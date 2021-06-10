import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class VerifyController extends Controller {
  @service session;
  @service currentUser;

  get isUserAuthenticated() {
    if (
      this.session.isAuthenticated &&
      this.currentUser.user &&
      this.model.data.id
    ) {
      if (this.currentUser.user.id == this.model.data.id) {
        return true;
      }
    }
    return false;
  }

  @action
  setQueryParam(walletAddress) {
    this.transitionToRoute({ queryParams: { wa: walletAddress } });
  }
}
