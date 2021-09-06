import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default class NFTController extends Controller {
  @service('theta-sdk') thetaSdk;

  get isWallet() {
    return this.thetaSdk.currentAccount || this.thetaSdk.currentGroup
  }
}
