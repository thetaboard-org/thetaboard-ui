import Route from '@ember/routing/route';

export default class NftRoute extends Route {

  activate() {
    this._super(...arguments);
    // scroll to the top of the page
    window.scrollTo(0, 0);
  }


  async model(params) {
    const nft = await this.store.findRecord('nft', params.nftId);
    return {nft: nft, drop: await nft.drop};
  }
}
