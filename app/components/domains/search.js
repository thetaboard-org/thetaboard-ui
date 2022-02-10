import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default class DomainsSearchComponent extends Component {
  constructor() {
    super(...arguments);
    this.cleanLocalStorage();
    if (this.tns) {
      this.initWithTNS();
    }
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('chainChanged', () => {
        this.checkNameAvailable();
      });
      window.ethereum.on('accountsChanged', () => {
        this.checkNameAvailable();
      });
    }
  }

  @service domain;
  @service metamask;
  @service store;
  @tracked domainName;
  @tracked domainNameToBuy;
  @tracked searchInProgress;
  @tracked domainAvailable;
  @tracked domainNameInvalid;
  @tracked price;
  @tracked isBalanceEnough;
  @tracked searchDisabled;

  get tns() {
    return this.args.tns;
  }

  async cleanLocalStorage() {
    const commitNames = await this.store.findAll('commitName');
    if (commitNames.length) {
      const twentyFourHours = 86400000;
      commitNames.forEach((commitName) => {
        const timeDifference = moment(new Date()).diff(commitName.timestamp);
        if (timeDifference >= twentyFourHours) {
          commitName.destroyRecord();
        }
      });
    }
  }

  async initWithTNS() {
    this.domainName = this.tns;
    if (!this.metamask.currentAccount) {
      await this.metamask.connect();
    }
    if (this.metamask.currentAccount) {
      await this.checkNameAvailable();
    }
  }

  @action
  async checkNameAvailable(event) {
    if (event) {
      event.preventDefault();
    }
    if (!this.domainName || this.domainName == '') {
      return;
    }
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
      if (this.tns != this.domainNameToBuy) {
        this.args.setTns(this.domainNameToBuy);
      }
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
