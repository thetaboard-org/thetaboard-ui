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

  get domainName() {
    return this.args.domainName;
  }

  @action
  toggleTransferPanel() {
    this.transferPanel = !this.transferPanel;
  }

  @action
  async transfer() {
    if (!this.domain.inputAddress) {
      return this.utils.errorNotify(this.intl.t('domain.error.invalid_addr'));
    }
    this.commitingToTransfer = true;
    const transfer = await this.domain.changeRegistrant(this.domainName, this.domain.inputAddress);
    if (transfer && transfer.tx) {
      this.transfering = true;
      const receipt = await this.domain.waitForTransaction(transfer.tx.hash);
      if (receipt.success) {
        this.transfered = true;
        this.args.refreshComponent();
        return this.utils.successNotify(`${this.domainName} ${this.intl.t('domain.domain_transfered')} ${this.addressTo}`);
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
