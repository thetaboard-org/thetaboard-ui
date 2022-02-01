import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import fetch from 'fetch';

export default class NFTRoute extends Route {
  @service('theta-sdk') thetaSdk;
  @service('store') store;
  @service metamask;
  @service abi;

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
      const total = {totalCount: 0, NFTs: [], wallets: this.wallets};
      await Promise.all(this.wallets.map(async (wallet) => {
        const fetched = await fetch(`/explorer/wallet-nft/${wallet}`);
        const fetchedJSON = await fetched.json();
        total.totalCount += fetchedJSON.totalCount;
        total.NFTs.push(...fetchedJSON.NFTs);
      }));
      return total;
    }
  }
}
