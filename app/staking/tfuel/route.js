import Route from '@ember/routing/route';

export default class TfuelStakingRoute extends Route {
  async model() {
    return await this.store
      .findAll('publicEdgeNode')
      .then((publicEdgeNodes) => {
        return { publicEdgeNodes: publicEdgeNodes };
      });
  }
}
