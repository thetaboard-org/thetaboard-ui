import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class DomainsNftInfoTnsReclaimControllerComponent extends Component {
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
  async transferController() {
    this.commitingToTransfer = true;
    const transferController = await this.domain.reclaimControl(this.domainName);
    if (transferController && transferController.tx) {
      this.transfering = true;
      const receipt = await this.domain.waitForTransaction(transferController.tx.hash);
      if (receipt.success) {
        this.transfered = true;
        this.args.refreshComponent();
        return this.utils.successNotify(`${this.intl.t('domain.controller_transfered')} ${this.domainName}`);
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
}
