import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class DomainsAlreadyRegisteredComponent extends Component {
  constructor() {
    super(...arguments);
    this.initComponent();
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('chainChanged', () => {
        setTimeout(this.initComponent, 2000);
      });
      window.ethereum.on('accountsChanged', () => {
        setTimeout(this.initComponent, 2000);
      });
    }
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
    this.isOwner = false;
    this.metamask.initMeta();
    const registrant = await this.domain.getRegistrant(this.domainName);
    const currentAddress = this.metamask.currentAccount;
    if (currentAddress && currentAddress == registrant.registrant) {
      this.isOwner = true;
    }
  }
}
