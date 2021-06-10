import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PasswordresetController extends Controller {
  @tracked password;
  @tracked passwordConfirmation;
  @tracked errorMessages;
  @tracked isPasswordReset;

  @action
  validatePassword() {
    if (this.password != this.passwordConfirmation) {
      $('#passwordConfirmation')[0].setCustomValidity("Passwords don't match");
    } else {
      $('#passwordConfirmation')[0].setCustomValidity('');
    }
  }

  @action
  async resetPassword(e) {
    e.preventDefault();
    if (this.model.token && this.password) {
      const options = {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.model.token}` },
        body: JSON.stringify({ password: this.password }),
      };

      let response = await fetch(`/users/password_reset`, options);
      if (response.status == 200) {
        let { data } = await response.json();
        this.isPasswordReset = true;
        return { data: data };
      } else {
        this.isPasswordReset = false;
        return { data: { error: true } };
      }
    }
  }
}
