import Controller from '@ember/controller';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class LoginController extends Controller {
  @tracked email;
  @tracked password;
  @tracked errorMessages;

  get session() {
    return getOwner(this).lookup('service:session');
  }

  @action
  async authenticate(e) {
    this.errorMessages = [];
    e.preventDefault();
    const credentials = this.getProperties('email', 'password');
    const authenticator = 'authenticator:jwt';
    try {
      await this.session.authenticate(authenticator, credentials);
    } catch (error) {
      this.errorMessages.pushObject(error.json);
    }
  }
}
