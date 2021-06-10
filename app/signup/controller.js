import Controller from '@ember/controller';
import {action} from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SignupController extends Controller {
  @tracked email;
  @tracked password;
  @tracked passwordConfirmation;
  @tracked errorMessages;

  @action
  validatePassword() {
    if (this.password != this.passwordConfirmation) {
      $('#passwordConfirmation')[0].setCustomValidity("Passwords don't match");
    } else {
      $('#passwordConfirmation')[0].setCustomValidity('');
    }
  }

  @action
  async register(e) {
    e.preventDefault();
    this.errorMessages = [];
    let user = this.store.createRecord('user', this.getProperties('email', 'password'));
    try {
      await user.save();
      this.transitionToRoute('registered');
    } catch (adapterError) {
      this.errorMessages.pushObject(adapterError.errors);
    }
  }
}
