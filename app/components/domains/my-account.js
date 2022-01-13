import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class DomainsMyAccountComponent extends Component {
  @service domain;
  @service metamask;
  @tracked transferToAddress;

  constructor() {
    super(...arguments);
    if (!this.metamask.currentAccount) {
      this.metamask.connect();
    }
  }
}
