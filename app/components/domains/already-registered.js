import Component from '@glimmer/component';
import { action } from '@ember/object';
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

  @action
  async setReverseName() {
    this.commitingToReverse = true;
    const reverseName = await this.domain.setReverseName(this.domainName);
    if (reverseName && reverseName.tx) {
      this.reversing = true;
      const receipt = await this.domain.waitForTransaction(reverseName.tx.hash);
      if (receipt.success) {
        this.reversed = true;
        return this.utils.successNotify(`${this.domainName} ${this.intl.t('domain.domain_reversed')}`);
      } else {
        this.commitingToReverse = false;
        this.reversing = false;
        this.reversed = false;
        return this.utils.errorNotify(
          this.intl.t('domain.error.problem_occured_check_metamask')
        );
      }
    } else {
      this.commitingToReverse = false;
      this.reversing = false;
      this.reversed = false;
      return this.utils.errorNotify(
        this.intl.t('domain.user_rejected_transaction')
      );
    }
  }

  @action
  toggleReverseNameForm() {
    this.reverseNameForm = !this.reverseNameForm;
  }

  @action
  refreshPage() {
    window.location.reload();
  }

  async initComponent() {
    const controller = await this.domain.getController(this.domainName);
    const currentAddress = this.metamask.currentAccount;
    if (currentAddress == controller.controller) {
      this.isOwner = true;
      if (
        !this.metamask.currentName ||
        this.metamask.currentName.replace('.theta', '') != this.domainName
      ) {
        this.canReverseName = true;
      } else {
        this.canReverseName = false;
      }
    } else {
      this.isOwner = false;
      this.canReverseName = false;
    }
  }

  // <Input {{on "keyup" checkAddressToName}} @placeholder="{{t 'domain.transfer_placeholder'}}" @type="text" class="form-control border-color input-domain-transfer-address" @value={{transferToAddress}}/>
  // {{#if transferLookup}}
  //     <p class="lookup-address-transfer">{{transferLookup}}</p>
  //     <p></p>
  // {{/if}}
  // @action
  // async checkAddressToName(e) {
  //   e.preventDefault();
  //   this.transferLookup = '';
  //   if (this.transferToAddress.endsWith(".theta")) {
  //     const address = await this.domain.getAddrForDomain(this.transferToAddress.replace(".theta", ""));
  //     if (
  //       address.addressRecord &&
  //       address.addressRecord != '0x0000000000000000000000000000000000000000'
  //     ) {
  //       const reverse = await this.domain.getReverseName(address.addressRecord);
  //       if (reverse.domain) {
  //         this.transferLookup = address.addressRecord;
  //       } else {
  //         this.transferLookup = '';
  //       }
  //     }
  //   } else if (
  //     this.transferToAddress.toLowerCase().startsWith('0x') &&
  //     this.transferToAddress.length == '42'
  //   ) {
  //     const value = await this.domain.getReverseName(this.transferToAddress);
  //     if (value.domain) {
  //       this.transferLookup = value.domain + ".theta";
  //     }
  //   }
  // }
}
