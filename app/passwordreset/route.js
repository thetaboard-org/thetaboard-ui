import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PasswordresetRoute extends Route {
  @service session;

  beforeModel() {
    this.session.prohibitAuthentication('dashboard');
  }

  async model(params) {
    return { token: params.token };
  }
}
