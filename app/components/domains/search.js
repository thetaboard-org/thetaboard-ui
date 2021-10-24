import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DomainsSearchComponent extends Component {
  @tracked domainName;
  @tracked domainNameToBuy;
  @tracked searchInProgress;
  @tracked domainAvailable;
  @tracked domainNameInvalid;

  @action
  checkNameAvailable(event) {
    event.preventDefault();
    this.searchInProgress = true;
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
    } else {
      this.domainNameToBuy = this.domainName.toLowerCase();
      this.domainAvailable = true;
    }
  }
}
