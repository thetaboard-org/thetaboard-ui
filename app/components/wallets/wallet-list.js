import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class WalletListComponent extends Component {
  @service('env-manager') envManager;
  @service('theta-sdk') thetaSdk;
  @service('store') store;
  @service('currency') currency;

  get explorerEndpoint() {
    return this.envManager.config.explorerEndpoint;
  }

  get walletList() {
    let walletList = Ember.A();
    const tfuelPrice = this.thetaSdk.prices.tfuel.price;
    const thetaPrice = this.thetaSdk.prices.theta.price;
    this.thetaSdk.wallets.forEach((wallet) => {
      let walletItem = this.store.createRecord('walletItem', wallet);
      if (wallet.currency == 'theta') {
        walletItem.market_price = thetaPrice;
      } else if (wallet.currency == 'tfuel') {
        walletItem.market_price = tfuelPrice;
      }
      walletList.pushObject(walletItem);
    });
    return walletList;
  }

  get walletTotal() {
    let wallets = this.walletList;
    if (wallets.length == 0) return 0;
    return wallets.reduce(function (previousValue, item) {
      return previousValue + item.value;
    }, 0);
  }
}
