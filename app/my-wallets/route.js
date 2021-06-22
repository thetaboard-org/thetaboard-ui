import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';

export default class MyWalletsRoute extends Route {
  get session() {
    return getOwner(this).lookup('service:session');
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    return this.store.findAll('wallet').then((wallets) => {
      return { wallets: wallets };
    });
  }
}
