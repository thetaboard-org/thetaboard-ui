import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import * as thetajs from '@thetalabs/theta-js';

export default class TfuelvipStakingController extends Controller {
  @service utils;
  @service('env-manager') envManager;
  @service thetaSdk;
  @service wallet;

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
          message: 'Invalid wallet address',
        });
      }

      const isMinimumLimitReached = await this.verifyTfuelBalance(this.walletAddress);
      if (!isMinimumLimitReached) {
        return this.errorMessages.pushObject({
          message: "You don't have enough Tfuel in your wallet",
        });
      }
      this.utils.successNotify(`Creating your VIP Elite Edge Node.`);
      let tfuelStake = this.store.createRecord('tfuelstake', this.getProperties('walletAddress'));
      await tfuelStake.save();
      this.utils.successNotify(`Your VIP Elite Edge Node is ready!`);
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
      `${label} was successfully copied to your clipboad`
    );
  }
}
