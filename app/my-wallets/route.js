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
    const wallets = await this.store.peekAll('wallet');
    const groups = await this.store.peekAll('group');
    return { wallets: wallets, groups: groups };
  }
}
