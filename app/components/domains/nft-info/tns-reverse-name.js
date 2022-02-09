import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class DomainsNftInfoTnsReverseNameComponent extends Component {
  @service metamask;
  @service domain;
  @service intl;
  @service utils;
  @tracked commitingToReverse;
  @tracked reversing;
  @tracked reversed;
  @tracked reverseNamePanel;

  get domainName() {
    return this.args.domainName;
  }

  @action
  toggleReverseNamePanel() {
    this.reverseNamePanel = !this.reverseNamePanel;
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
        this.args.refreshComponent();
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
}
