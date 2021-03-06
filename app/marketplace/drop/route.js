import Route from '@ember/routing/route';

export default class DropRoute extends Route {
  async model(params) {
    const drop = await this.store.findRecord('drop', params.dropId);
    return { drop: drop };
  }
}
