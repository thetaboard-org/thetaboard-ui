import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class DomainsAlreadyRegisteredComponent extends Component {
  constructor() {
    super(...arguments);
    this.initComponent();
  }
  @service domain;
  @service utils;
  @service intl;
  @service metamask;
  @tracked isOwner;
  @tracked canReverseName;
  @tracked reverseNameForm;
  @tracked commitingToReverse;
  @tracked reversing;
  @tracked reversed;

  get domainName() {
    return this.args.domainName;
  }

  get isCurrentReverseName() {
    return this.metamask.currentName == this.domainName;
  }

  async initComponent() {
    const registrant = await this.domain.getRegistrant(this.domainName);
    const currentAddress = this.metamask.currentAccount;
    if (currentAddress == registrant.registrant) {
      this.isOwner = true;
    } else {
      this.isOwner = false;
    }
  }
}
