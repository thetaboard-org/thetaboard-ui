import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class WalletWalletNavbarComponent extends Component {
  constructor(...args) {
    super(...args);
  }
  @service session;
  @service wallet;
  @service('theta-sdk') thetaSdk;

  @action
  async selectWallet(wallet) {
    if (wallet.address) {
      await this.thetaSdk.getWalletInfo([wallet.address]);
      this.args.onRouteChange(wallet.address);
    }
  }
}
