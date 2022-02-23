import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default class ClaimRoute extends Route {
  @service session;

  async model() {
    const scope = this.session.currentUser.user.scope;
    let artists = [];
    if (scope === "Admin") {
      artists = await this.store.findAll("artist");
    } else if (scope === "Creator") {
      artists = await this.store.query("artist", {
        userId: this.session.currentUser.user.id
      });
    }
    const NFTs = await this.store.query('NFT', {artistId: artists.firstObject.id});

    return {artists: artists, NFTs: NFTs};
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

}
