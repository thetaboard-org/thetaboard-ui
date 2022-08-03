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
    const model = {totalCount: 0, NFTs: [], wallets: this.wallets, facets: {artists: [], drops: [], category: []}};

    if (!this.wallets) {
      return model;
    } else {
      await Promise.all(this.wallets.map(async (wallet) => {
        const [nftsAPI, facetsAPI] = await Promise.all([
          fetch(`/api/explorer/wallet-nft/${wallet}`),
          fetch(`/api/explorer/wallet-nft-facets/${wallet}`)]);
        const nfts = await nftsAPI.json();
        const facets = await facetsAPI.json();
        model.totalCount += nfts.totalCount;
        model.NFTs.push(...nfts.NFTs);
        model.facets.artists.push(...facets.artists);
        model.facets.drops.push(...facets.drops);
        model.facets.categories = facets.categories; // categories are the same for all, so we don't push
      }));
      return model;
    }
  }

  resetController(controller, isExiting, transition) {
    if (isExiting && transition.targetName !== 'error') {
      controller.resetFilters();
    }
  }
}
