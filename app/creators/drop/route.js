import Route from '@ember/routing/route';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';

export default class MyWalletsRoute extends Route {
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params) {
    const drop = this.store.find("drop", params.dropId);
    const NFTs = this.store.query('NFT', {dropId: params.dropId});
    const assets = await this.store.query('NFT-Asset', {nftId: 11});
    debugger
    return {drop: drop, nfts: NFTs};
  }

  @action
  refreshModel() {
    this.refresh();
  }

}
