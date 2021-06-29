import Route from '@ember/routing/route';

export default class TfuelStakingRoute extends Route {
  async model() {
    return this.store.findAll('publicEdgeNode').then((publicEdgeNode) => {
      return { publicEdgeNode: publicEdgeNode };
    });
  }
}
