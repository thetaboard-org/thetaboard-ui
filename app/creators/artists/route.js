import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default class MyWalletsRoute extends Route {
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    const scope = this.session.currentUser.user.scope;
    let artists = [];
    if (scope === "Admin") {
      artists = await this.store.findAll("artist");
    } else if (scope === "Creator") {
      artists = this.store.query("artist", {
        filter: {
          user_id: this.session.currentUser.user.id
        }
      });
    }
    return {artists: artists};
  }
}
