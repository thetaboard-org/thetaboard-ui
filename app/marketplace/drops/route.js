import Route from '@ember/routing/route';

export default class DropsRoute extends Route {
  async model() {
    const sponsored = this.store.query('drop', {
      isLive: 1,
      isSponsored: 1,

      isPublic: 1,
      sortBy: "endDate",
      pageNumber: 1,
    });

    const live = this.store.query('drop', {
      isLive: 1,
      isSponsored: 0,

      sortBy: "endDate",
      pageNumber: 1,
      isPublic: 1,
    });

    const ended = this.store.query('drop', {
      isEnded: 1,

      isPublic: 1,
      sortBy: "endDate",
      pageNumber: 1
    });

    const isComing = this.store.query('drop', {
      isComing: 1,

      isPublic: 1,
      sortBy: "startDate",
      pageNumber: 1
    });

    return {sponsored: sponsored, live: live, ended:ended, isComing: isComing};
  }
}
