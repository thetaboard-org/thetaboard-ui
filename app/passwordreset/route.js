import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';

export default class PasswordresetRoute extends Route {
  get session() {
    return getOwner(this).lookup('service:session');
  }

  beforeModel() {
    this.session.prohibitAuthentication('dashboard');
  }

  async model(params) {
    return { token: params.token };
  }
}
