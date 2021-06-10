import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class VerifyEmailComponent extends Component {
  @service session;
  @service currentUser;
  @service utils;

  @action
  async resendEmailValidation(e) {
    e.preventDefault();
    if (
      this.session.isAuthenticated &&
      this.session.data.authenticated &&
      this.session.data.authenticated.token &&
      this.currentUser &&
      this.currentUser.user
    ) {
      const options = { method: 'POST', headers: { Authorization: `Bearer ${this.session.data.authenticated.token}` } };

      let response = await fetch(`/users/send_email_verification`, options);
      if (response.status == 200) {
        let { data } = await response.json();
        this.utils.successNotify(`Verification link sent to ${data.attributes.email}`);
      } else {
        this.utils.errorNotify("Something went wrong. Try again later.");
      }
    }
  }
}
