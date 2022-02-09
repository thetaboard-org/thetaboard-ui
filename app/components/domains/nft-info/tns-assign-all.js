import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class DomainsNftInfoTnsAssignAllComponent extends Component {
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

  @action
  toggleTransferPanel() {
    this.transferPanel = !this.transferPanel;
  }

  @action
  async assignAll() {
    let result = false;
    if (this.args.canReclaimController) {
      let reclaim = await this.transferController();
      if (!reclaim) {
        return;
      }
      result = true;
    }

    if (this.args.rawReverseName.domain !== this.domainName.replace('.theta', '') && this.args.addressRecord !== this.metamask.currentAccount) {
      result = await Promise.all([this.editAddressRecord(), this.setReverseName()]);
      await this.args.refreshComponent();
      if (result[0] && result[1]) {
        return this.utils.successNotify(`${this.domainName} ${this.intl.t('domain.domain_reversed')}`);
      }
    } else if (this.args.rawReverseName.domain !== this.domainName.replace('.theta', '')) {
      result = await this.setReverseName();
    } else if (this.args.addressRecord !== this.metamask.currentAccount) {
      result = await this.editAddressRecord();
    }
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
    const editAddressRecord = await this.domain.setAddressRecord(this.domainName, this.metamask.currentAccount);
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

  @action
  async setReverseName() {
    this.commitingToTransfer = true;
    const reverseName = await this.domain.setReverseName(this.domainName);
    if (reverseName && reverseName.tx) {
      this.transfering = true;
      const receipt = await this.domain.waitForTransaction(reverseName.tx.hash);
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
