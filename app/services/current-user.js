import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentUserService extends Service {
  @service session;
  @service store;
  @service wallet;
  @tracked user;
  @tracked wallets;

  async load(handledAuthentication) {
    if (
      this.session.data.authenticated &&
      this.session.data.authenticated.tokenData &&
      this.session.data.authenticated.tokenData.userid
    ) {
      let userId = this.session.data.authenticated.tokenData.userid;
      if (userId) {
        let user = await this.store.findRecord('user', userId);
        this.user = user;
        let wallets = await this.store.findAll('wallet');
        this.wallets = wallets;
        if (handledAuthentication) {
          await this.wallet.initWallet();
        }
        return user;
      }
    }
  }
}
