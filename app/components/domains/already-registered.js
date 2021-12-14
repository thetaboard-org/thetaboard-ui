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
  @tracked canReclaim;
  @tracked canTransfer;
  @tracked didTransfer;
  @tracked transferToAddress;
  @tracked transferForm;
  @tracked transferLookup;
  @tracked canReverseName;
  @tracked reverseNameForm;
  @tracked addressToFrom;
  @tracked nameToFrom;
  @tracked commitingToTransfer;
  @tracked transferName  
  @tracked nameTransfered;
  @tracked reclaiming;
  @tracked commitingToReclaim;
  @tracked reclaimed;
  @tracked commitingToReverse;
  @tracked reversing;
  @tracked reversed;


  get domainName() {
    return this.args.domainName;
  }

  async validateAddress(addr) {
    this.addressToFrom = '';
    this.nameToFrom = '';
    if (!addr || addr.length == 0) {
      this.utils.errorNotify(this.intl.t('domain.error.addr_cannot_empty'));
      return false;
    }
    if (!/^(0x)?[0-9a-f]{40}$/i.test(addr)) {
      const isName = await this.domain.getAddrForDomain(addr.replace('.theta', ''));
      if (isName && isName.address != '0x0000000000000000000000000000000000000000') {
        this.addressToFrom = isName.address;
        this.nameToFrom = addr.replace('.theta', '') + '.theta';
        return isName.address;
      }
      this.utils.errorNotify(this.intl.t('domain.error.invalid_addr'));
      return false
    } 
    this.addressToFrom = addr;
    return addr;
  }

  @action
  async transferDomain() {
    const validAddr = await this.validateAddress(this.transferToAddress);
    if (!validAddr) {
      return;
    }
    this.commitingToTransfer = true;
    const transfer = await this.domain.transferDomain(this.domainName, validAddr);
    if (transfer && transfer.tx) {
      this.transferName = true;
      const receipt = await this.domain.waitForTransaction(transfer.tx.hash);
      if (receipt.success) {
        this.nameTransfered = true;
        return this.utils.successNotify(`${this.domainName} ${this.intl.t('domain.domain_transfered')} ${validAddr}`);
      } else {
        this.commitingToTransfer = false;
        this.transferName = false  
        this.nameTransfered = false;
          return this.utils.errorNotify(
          this.intl.t('domain.error.problem_occured_check_metamask')
        );
      } 
    } else {
      this.commitingToTransfer = false;
      this.transferName = false  
      this.nameTransfered = false;
      return this.utils.errorNotify(
        this.intl.t('domain.user_rejected_transaction')
      );
    }
  }

  @action
  async setReverseName() {
    this.commitingToReverse = true;
    debugger
    const reverseName = await this.domain.setReverseName(this.domainName);
    debugger
    if (reverseName && reverseName.tx) {
      this.reversing = true;
      const receipt = await this.domain.waitForTransaction(reverseName.tx.hash);
      if (receipt.success) {
        this.reversed = true;
        return this.utils.successNotify(`${this.domainName} ${this.intl.t('domain.domain_reversed')}`);
      } else {
        this.commitingToReverse = false;
        this.reversing = false  
        this.reversed = false;
          return this.utils.errorNotify(
          this.intl.t('domain.error.problem_occured_check_metamask')
        );
      } 
    } else {
      this.commitingToReverse = false;
      this.reversing = false  
      this.reversed = false;
      return this.utils.errorNotify(
        this.intl.t('domain.user_rejected_transaction')
      );
    }
  }

  @action
  async reclaimDomain() {
    this.commitingToReclaim = true;
    const reclaimOwnership = await this.domain.reclaimOwnership(this.domainName);
    if (reclaimOwnership && reclaimOwnership.tx) {
      this.reclaiming = true;
      const receipt = await this.domain.waitForTransaction(reclaimOwnership.tx.hash);
      if (receipt.success) {
        this.reclaimed = true;
        return this.utils.successNotify(`${this.intl.t('domain.domain_reclaimed')} ${this.domainName}`);
      } else {
        this.commitingToReclaim = false;
        this.reclaiming = false  
        this.reclaimed = false;
          return this.utils.errorNotify(
          this.intl.t('domain.error.problem_occured_check_metamask')
        );
      } 
    } else {
      this.commitingToReclaim = false;
      this.reclaiming = false  
      this.reclaimed = false;
      return this.utils.errorNotify(
        this.intl.t('domain.user_rejected_transaction')
      );
    }
  }

  @action
  openTransferForm() {
    this.transferForm = true;
  }

  @action
  openReverseNameForm() {
    this.reverseNameForm = true;
  }

  @action
  cancelTransferForm() {
    this.transferForm = false;
    this.transferToAddress = '';
  }

  @action
  cancelReverseName() {
    this.reverseNameForm = false;
  }

  @action
  refreshPage() {
    window.location.reload();
  }

  @action
  async checkAddressToName(e) {
    e.preventDefault();
    this.transferLookup = '';
    if (this.transferToAddress.endsWith(".theta")) {
      const value = await this.domain.getAddrForDomain(this.transferToAddress.replace(".theta", ""));
      if (value.address && value.address != '0x0000000000000000000000000000000000000000') {
        this.transferLookup = value.address;
      }
    } else if (
      this.transferToAddress.toLowerCase().startsWith('0x') &&
      this.transferToAddress.length == '42'
    ) {
      const value = await this.domain.getNameForAddress(this.transferToAddress);
      if (value.name) {
        this.transferLookup = value.name;
      }
    }
  }

  async initComponent() {
    const nameOwner = await this.domain.getOwnerOf(this.domainName);
    const domainOwner = await this.domain.getDomainOwner(this.domainName);
    // const addressForDomain = await this.domain.getAddrForDomain(this.domainName);
    const currentAddress = this.metamask.currentAccount.toLowerCase();
    this.addressToFrom = '';
    this.nameToFrom = '';
    if (
      currentAddress == domainOwner.address.toLowerCase() &&
      currentAddress == nameOwner.address.toLowerCase()
    ) {
      this.isOwner = true;
      this.canTransfer = true;
      this.didTransfer = false;
      this.canReclaim = false;
      if (
        !this.metamask.currentName ||
        this.metamask.currentName.replace('.theta', '') != this.domainName
      ) {
        this.canReverseName = true;
      } else {
        this.canReverseName = false;
      }
    } else if (
      currentAddress == domainOwner.address.toLowerCase() &&
      currentAddress != nameOwner.address.toLowerCase()
    ) {
      this.isOwner = false;
      this.canTransfer = false;
      this.didTransfer = true;
      this.canReclaim = false;
      this.canReverseName = false;
      this.addressToFrom = nameOwner.address;
      const name = await this.domain.getNameForAddress(this.addressToFrom);
      this.nameToFrom = name.name;
    } else if (
      currentAddress != domainOwner.address.toLowerCase() &&
      currentAddress == nameOwner.address.toLowerCase()
    ) {
      this.isOwner = false;
      this.canTransfer = false;
      this.didTransfer = false;
      this.canReclaim = true;
      this.canReverseName = false;
      this.addressToFrom = domainOwner.address;
      const name = await this.domain.getNameForAddress(this.addressToFrom);
      this.nameToFrom = name.name;
    } else {
      this.isOwner = false;
      this.canTransfer = false;
      this.didTransfer = false;
      this.canReclaim = false;
      this.canReverseName = false;
    }
  }
}
