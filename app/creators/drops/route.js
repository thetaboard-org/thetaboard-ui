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
    let artists = [], live = [], ended = [], isComing = [];

    const liveFilter = {
      isLive: 1,
      sortBy: "endDate",
      pageNumber: 1,
    };
    const endedFilter = {
      isEnded: 1,

      sortBy: "endDate",
      pageNumber: 1
    };
    const isComingFilter = {
      isComing: 1,

      sortBy: "startDate",
      pageNumber: 1
    };

    if (scope === "Admin") {
      artists = this.store.findAll("artist");
      live = this.store.query("drop", liveFilter);
      ended = this.store.query("drop", endedFilter);
      isComing = this.store.query("drop", isComingFilter);
    } else if (scope === "Creator") {
      artists = await this.store.query("artist", {userId: user.id});
      if (!artists.firstObject) {
        this.transitionTo('/creators/artists')
      }
      liveFilter.artistId = artists.firstObject.id;
      endedFilter.artistId = artists.firstObject.id;
      isComingFilter.artistId = artists.firstObject.id;
      live = this.store.query("drop", liveFilter);
      ended = this.store.query("drop", endedFilter);
      isComing = this.store.query("drop", isComingFilter);
    }
    return {live: live, ended: ended, isComing: isComing, artists: artists};
  }
}
