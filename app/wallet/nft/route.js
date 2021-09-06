import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import fetch from 'fetch';

export default class NFTRoute extends Route {
  @service('theta-sdk') thetaSdk;
  @service('store') store;

  async model() {
    if (this.thetaSdk.currentGroup) {
      let allWallets = this.thetaSdk.walletList.map((x) => x.wallet_address.toLowerCase());
      this.wallets = [...new Set(allWallets)];
    } else {
      this.wallets = this.thetaSdk.currentAccount;
    }
    if (!this.wallets) {
      return [];
    } else {
      return [].concat(...(await Promise.all(this.wallets.map(async (wallet) => {
        const fetched = await fetch(`/explorer/wallet-nft/${wallet}`);
        return await fetched.json();
      })))).filter((x) => x.type === 'image');
    }
  }
}
