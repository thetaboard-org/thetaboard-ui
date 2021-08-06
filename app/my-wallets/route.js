import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MyWalletsRoute extends Route {
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    const wallets = await this.store.peekAll('wallet');
    const groups = await this.store.peekAll('group');
    return { wallets: wallets, groups: groups };
  }
}
