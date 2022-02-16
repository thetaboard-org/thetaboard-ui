import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class NavbarNavbarComponent extends Component {
  @service session;
  @service currentUser;

  @action
  invalidateSession() {
    this.session.invalidate();
  }
}
