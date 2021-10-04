import Route from '@ember/routing/route';

export default class NftRoute extends Route {
  async model(params) {
    const nft = await this.store.findRecord('nft', params.nftId);
    return { nft: nft };
  }
}
