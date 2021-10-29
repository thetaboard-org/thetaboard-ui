import Route from '@ember/routing/route';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';

export default class MyWalletsRoute extends Route {
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params) {
    const scope = this.session.currentUser.user.scope;
    let drop = null, NFTs = [];
    if (scope === "Admin") {
      drop = this.store.find("drop", params.dropId);
      NFTs = this.store.query('NFT', {dropId: params.dropId});
    } else if (scope === "Creator") {
      //TODO

    }
    return {drop: drop, nfts: await NFTs};
  }

  @action
  refreshModel() {
    this.refresh();
  }

}
