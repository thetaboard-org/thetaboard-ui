import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default class MyWalletsRoute extends Route {
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params) {
    const drop = this.store.find("drop", params.dropId);
    const NFTs = await this.store.query('NFT', {dropId: params.dropId});
    return {drop: drop, nfts: NFTs};
  }

}
