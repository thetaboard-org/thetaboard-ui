import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ResetpasswordController extends Controller {
  @tracked email;
  @tracked resetPasswordLinkSent;

  @service session;

  @action
  async resetPassword(e) {
    e.preventDefault();
    const body = { email: this.email };
    const options = { method: 'POST', body: JSON.stringify(body) };
    let response = await fetch(`/users/reset_password`, options);
    this.resetPasswordLinkSent = true;
  }
}
