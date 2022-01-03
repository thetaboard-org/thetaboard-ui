import Route from '@ember/routing/route';

export default class NftInfoRoute extends Route {

  activate() {
    this._super(...arguments);
    // scroll to the top of the page
    window.scrollTo(0, 0);
  }

  async model(params) {
    const fetched = await fetch(`/explorer/wallet-info/${params.contractAddr}/${params.tokenId}`);
    const nftInfo = await fetched.json();
    return {nft: nftInfo};
  }
}
