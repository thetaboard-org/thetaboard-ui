import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class DomainsNftInfoTnsUnassignPreviousOwnerComponent extends Component {
  @service metamask;
  @service domain;
  @service intl;
  @service utils;
  @tracked commitingToTransfer;
  @tracked transfering;
  @tracked transfered;
  @tracked transferPanel;

  get domainName() {
    return this.args.domainName;
  }

  get addressRecord() {
    return this.args.addressRecord;
  }

  get transactionCount() {
    return [this.args.isController, this.args.isAddressRecord].filter(
      (x) => x === false
    ).length;
  }

  get multipleTransactions() {
    return this.transactionCount > 1;
  }

  @action
  toggleTransferPanel() {
    this.transferPanel = !this.transferPanel;
  }

  @action
  async unassignPreviousOwner() {
    let result = false;
    if (this.args.canReclaimController) {
      let reclaim = await this.transferController();
      if (!reclaim) {
        return;
      }
    }

    result = await this.editAddressRecord();
    await this.args.refreshComponent();
    if (result) {
      this.utils.successNotify(`${this.domainName} ${this.intl.t('domain.domain_reversed')}`);
    }
  }

  @action
  async transferController() {
    this.commitingToTransfer = true;
    const transferController = await this.domain.reclaimControl(this.domainName);
    if (transferController && transferController.tx) {
      this.transfering = true;
      const receipt = await this.domain.waitForTransaction(transferController.tx.hash);
      if (receipt.success) {
        return true;
      } else {
        this.commitingToTransfer = false;
        this.transfering = false;
        this.utils.errorNotify(this.intl.t('domain.error.problem_occured_check_metamask'));
        return false;
      }
    } else {
      this.commitingToTransfer = false;
      this.transfering = false;
      this.utils.errorNotify(this.intl.t('domain.user_rejected_transaction'));
      return false;
    }
  }

  @action
  async editAddressRecord() {
    this.commitingToTransfer = true;
    const editAddressRecord = await this.domain.setAddressRecord(this.domainName, "0x0000000000000000000000000000000000000000");
    if (editAddressRecord && editAddressRecord.tx) {
      this.transfering = true;
      const receipt = await this.domain.waitForTransaction(editAddressRecord.tx.hash);
      if (receipt.success) {
        return true;
      } else {
        this.commitingToTransfer = false;
        this.transfering = false;
        this.utils.errorNotify(this.intl.t('domain.error.problem_occured_check_metamask'));
        return false;
      }
    } else {
      this.commitingToTransfer = false;
      this.transfering = false;
      this.utils.errorNotify(this.intl.t('domain.user_rejected_transaction'));
      return false;
    }
  }
}