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

  @action
  async test() {
    // debugger
    // const toto = await this.domain.getNameForAddress(this.metamask.currentAccount);
    debugger
    const tata = await this.domain.getDomainOwner(this.transferToAddress);
    debugger
  }

  @action
  async getAddrForDomain() {
    debugger
    const tata = await this.domain.getAddrForDomain("tata");
    debugger
  }

  @action
  async setReverseName() {
    debugger
    const tata = await this.domain.setReverseName('titi');
    debugger
  }

  @action
  async transferDomain() {
    debugger
    const transfer = await this.domain.transferDomain('titi', this.transferToAddress);
    debugger
  }

  @action
  async reclaimOwnership() {
    debugger
    const reclaimOwnership = await this.domain.reclaimOwnership('titi', this.transferToAddress);
    debugger
  }
}
