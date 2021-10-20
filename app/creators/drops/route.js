import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default class MyWalletsRoute extends Route {
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    const scope = this.session.currentUser.user.scope;
    let artists = [], drops = [];
    if (scope === "Admin") {
      artists = await this.store.findAll("artist");
      drops = await this.store.findAll("drop");

    } else if (scope === "Creator") {
      //TODO

    }
    return {drops: drops, artists: artists};
  }
}
