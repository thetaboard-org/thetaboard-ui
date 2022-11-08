import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default class MyWalletsRoute extends Route {
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params) {
    const user = this.session.currentUser.user
    const scope = user.scope;
    let artists = [], airdrops = [], nfts = [];

    if (scope === "Admin") {
      artists = this.store.findAll("artist");
      airdrops = this.store.query("airdrop", {});
      nfts = this.store.query("nft", {artistId: 1}); // if admin, select nfts from thetaboard
    } else if (scope === "Creator") {
      artists = await this.store.query("artist", {userId: user.id});
      if (!artists.firstObject) {
        this.transitionTo('/creators/artists')
      }
      airdrops = this.store.query("airdrop", {artistId: artists.firstObject.id});
      nfts = this.store.query("nft", {artistId: artists.firstObject.id});
    }

    return {airdrops: airdrops, artists: artists, nfts: nfts};
  }
}
