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
  setupWallet() {
    if (this.wallet.defaultWallet) {
      this.selectWallet(this.wallet.defaultWallet);
    } else {
      if (this.wallet.wallets.length) {
        this.selectWallet(this.wallet.wallets.firstObject);
      }
    }
  }

  @action
  async selectWallet(wallet) {
    if (wallet.address) {
      await this.thetaSdk.getWalletInfo([wallet.address]);
      this.args.onRouteChange(wallet.address);
    }
  }
}
