import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class DomainsNftInfoTnsTransferComponent extends Component {
  @service metamask;
  @service domain;
  @service intl;
  @service utils;
  @tracked commitingToTransfer;
  @tracked transfering;
  @tracked transfered;
  @tracked transferPanel;
  @tracked addressTo;
  @tracked addressLookup;
  @tracked inputDomain;
  @tracked inputAddress;

  get domainName() {
    return this.args.domainName;
  }

  @action
  toggleTransferPanel() {
    this.transferPanel = !this.transferPanel;
  }

  @action
  async transfer() {
    if (!this.inputAddress) {
      return this.utils.errorNotify(this.intl.t('domain.error.invalid_addr'));
    }
    this.commitingToTransfer = true;
    const transfer = await this.domain.changeRegistrant(this.domainName, this.inputAddress);
    if (transfer && transfer.tx) {
      this.transfering = true;
      const receipt = await this.domain.waitForTransaction(transfer.tx.hash);
      if (receipt.success) {
        this.transfered = true;
        this.args.refreshComponent();
        return this.utils.successNotify(`${this.domainName} ${this.intl.t('domain.domain_transfered')} ${this.inputAddress}`);
      } else {
        this.commitingToTransfer = false;
        this.transfering = false;
        this.transfered = false;
        return this.utils.errorNotify(
          this.intl.t('domain.error.problem_occured_check_metamask')
        );
      }
    } else {
      this.commitingToTransfer = false;
      this.transfering = false;
      this.transfered = false;
      return this.utils.errorNotify(
        this.intl.t('domain.user_rejected_transaction')
      );
    }
  }

  @action
  async inputHandler(e) {
    e.preventDefault();
    this.addressLookup = '';
    let inputValue = e.currentTarget.value;
    await this.metamask.initMeta();
    if (inputValue.endsWith(".theta")) {
      const address = await this.domain.getAddrForDomain(inputValue.replace(".theta", ""));
      if (
        address.addressRecord &&
        address.addressRecord != '0x0000000000000000000000000000000000000000'
      ) {
        const reverse = await this.domain.getReverseName(address.addressRecord);
        if (reverse.domain == this.domain.sanitizeTNS(inputValue)) {
          this.addressLookup = address.addressRecord;
          this.inputDomain = this.domain.sanitizeTNS(inputValue);
        } else {
          this.addressLookup = '';
          this.inputDomain = '';
        }
      } else {
        this.inputDomain = '';
      }
      this.inputAddress = this.addressLookup;
    } else if (
      inputValue.toLowerCase().startsWith('0x') &&
      inputValue.length == '42'
    ) {
      const value = await this.domain.getReverseName(inputValue);
      if (value.domain) {
        this.addressLookup = value.domain;
      }
      this.inputAddress = inputValue;
      this.inputDomain = this.addressLookup;
    } else {
      this.inputAddress = '';
      this.inputDomain = '';
    }
  }
}
