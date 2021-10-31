import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class DomainsSearchComponent extends Component {
  @service domain;
  @service metamask;
  @tracked domainName;
  @tracked domainNameToBuy;
  @tracked searchInProgress;
  @tracked domainAvailable;
  @tracked domainNameInvalid;
  @tracked price;
  @tracked isBalanceEnough;
  @tracked searchDisabled;

  @action
  async checkNameAvailable(event) {
    event.preventDefault();
    this.searchDisabled = true;
    this.searchInProgress = false;
    this.domainNameInvalid = false;
    const regex = /([\W]-|-[\W]|[^\w-])+|^-|-$/gimu;
    if (
      regex.test(this.domainName) ||
      this.domainName == '' ||
      this.domainName == undefined
    ) {
      this.domainNameToBuy =  this.domainName ? this.domainName.toLowerCase() : '';
      this.domainNameInvalid = true;
      this.domainAvailable = false;
      this.searchInProgress = true;
      this.searchDisabled = false;
    } else {
      this.domainNameToBuy = this.domainName.toLowerCase();
      const nameAvailable = await this.domain.checkNameAvailable(this.domainNameToBuy);
      if (nameAvailable.available) {
        this.domainAvailable = true;
        this.price = nameAvailable.price;
        this.isBalanceEnough = nameAvailable.isBalanceEnough;
        this.searchInProgress = true;
        this.searchDisabled = false;
      } else {
        this.domainAvailable = false;
        this.price = null;
        this.isBalanceEnough = false;
        this.searchInProgress = true;
        this.searchDisabled = false;
      }
    }
  }
}
