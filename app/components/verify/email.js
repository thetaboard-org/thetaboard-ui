import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class VerifyEmailComponent extends Component {
  @service session;
  @service currentUser;
  @service utils;
  @service intl;

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

      let response = await fetch(`/api/users/send_email_verification`, options);
      if (response.status == 200) {
        let { data } = await response.json();
        this.utils.successNotify(this.intl.t("notif.verification_sent", {email: data.attributes.email}));
      } else {
        this.utils.errorNotify(this.intl.t("notif.something_wrong"));
      }
    }
  }
}
