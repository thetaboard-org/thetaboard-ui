import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import * as thetajs from '@thetalabs/theta-js';

export default class TfuelvipStakingController extends Controller {
  @service utils;
  @service envManager;
  @service thetaSdk;
  @service wallet;
  @service intl;

  @tracked walletAddress;
  @tracked errorMessages;
  @tracked modalSummary;

  get explorerEndpoint() {
    return this.envManager.config.explorerEndpoint;
  }

  get stakeList() {
    return this.model.tfuelstakes.filter((stake) => !stake.isUnstaked);
  }

  get showWallet() {
    if (this.wallet.wallets.length) {
      return true;
    }
    return false;
  }

  @action
  setupModalSummary(summary) {
    this.modalSummary = summary;
  }

  @action
  selectWallet(wallet) {
    if (wallet.address) {
      this.walletAddress = wallet.address;
    }
  }

  @action
  clear(e) {
    e.preventDefault();
    this.walletAddress = '';
  }

  @action
  async submitStake(e) {
    try {
      e.preventDefault();
      this.errorMessages = [];
      if (
        !this.walletAddress ||
        this.walletAddress.length != 42 ||
        this.walletAddress.substr(1, 1).toLocaleLowerCase() != 'x'
      ) {
        return this.errorMessages.pushObject({
          message: this.intl.t('notif.invalid_wallet_address'),
        });
      }

      const isMinimumLimitReached = await this.verifyTfuelBalance(this.walletAddress);
      if (!isMinimumLimitReached) {
        return this.errorMessages.pushObject({
          message: this.intl.t('notif.not_enough_tfuel'),
        });
      }
      this.utils.successNotify(this.intl.t('notif.vip_creation'));
      let tfuelStake = this.store.createRecord('tfuelstake', this.getProperties('walletAddress'));
      await tfuelStake.save();
      this.utils.successNotify(this.intl.t('notif.vip_ready'));
      this.walletAddress = '';
    } catch (err) {
      this.errorMessages.pushObject(err.errors);
    }
  }

  async verifyTfuelBalance(wa) {
    let response = await fetch(
      `${this.envManager.config.explorerEndpoint}:8443/api/account/${wa}`
    );
    if (response.status == 200) {
      let data = await response.json();
      if (Number(thetajs.utils.fromWei(data.body.balance.tfuelwei)) < 100000) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  @action
  copySummaryToClipBoard(label, inputId) {
    this.utils.copyToClipboard(
      inputId,
      this.intl.t('clip.succesfully', {label: label})
    );
  }
}
