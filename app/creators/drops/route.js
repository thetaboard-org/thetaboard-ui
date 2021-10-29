import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default class MyWalletsRoute extends Route {
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    const user = this.session.currentUser.user
    const scope = user.scope;
    let artists = [], drops = [];


    if (scope === "Admin") {
      artists = this.store.findAll("artist");
      drops = this.store.findAll("drop");

    } else if (scope === "Creator") {
      artists = await this.store.query("artist", {user_id: user.id});
      if (!artists.firstObject) {
        this.transitionTo('/creators/artists')
      }
      drops = this.store.query("drop", {artists: artists.firstObject.id})
    }
    return {drops: drops, artists: artists};
  }
}
