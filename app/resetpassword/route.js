import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ResetpasswordRoute extends Route {
  @service session;

  beforeModel() {
    this.session.prohibitAuthentication('dashboard');
  }
}