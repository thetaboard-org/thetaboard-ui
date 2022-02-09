import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class DomainsNftInfoTnsEditAddressRecordComponent extends Component {
  @service metamask;
  @service domain;
  @service intl;
  @service utils;
  @tracked commitingToEdit;
  @tracked editing;
  @tracked edited;
  @tracked editPanel;

  get domainName() {
    return this.args.domainName;
  }

  @action
  toggleEditPanel() {
    this.editPanel = !this.editPanel;
  }

  @action
  async editAddressRecord() {
    this.commitingToEdit = true;
    const editAddressRecord = await this.domain.setAddressRecord(this.domainName, this.metamask.currentAccount);
    if (editAddressRecord && editAddressRecord.tx) {
      this.editing = true;
      const receipt = await this.domain.waitForTransaction(editAddressRecord.tx.hash);
      if (receipt.success) {
        this.edited = true;
        this.args.refreshComponent();
        return this.utils.successNotify(`${this.intl.t('domain.address_record_updated')} ${this.metamask.currentAccount}`);
      } else {
        this.commitingToEdit = false;
        this.editing = false;
        this.edited = false;
        return this.utils.errorNotify(
          this.intl.t('domain.error.problem_occured_check_metamask')
        );
      }
    } else {
      this.commitingToEdit = false;
      this.editing = false;
      this.edited = false;
      return this.utils.errorNotify(
        this.intl.t('domain.user_rejected_transaction')
      );
    }
  }
}
