import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class TfuelvipRoute extends Route {
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    return this.store.findAll('tfuelstake').then((tfuelstakes) => {
      return { tfuelstakes: tfuelstakes };
    });
  }
}
