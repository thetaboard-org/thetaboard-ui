import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import * as thetajs from '@thetalabs/theta-js';

export default class StakingController extends Controller {
  @tracked walletAddress;
  @tracked stakeAmount;
  @tracked errorMessages;

  @service('env-manager') envManager;
  @service utils;
  @service currentUser;

  get explorerEndpoint() {
    return this.envManager.config.explorerEndpoint;
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
      if (!this.stakeAmount || this.stakeAmount < 100000) {
        return this.errorMessages.pushObject({
          message: 'The minimum limit is 100,000 Tfuel',
        });
      }

      const isMinimumLimitReached = await this.verifyTfuelBalance(
        this.walletAddress,
        this.stakeAmount
      );
      if (!isMinimumLimitReached) {
        return this.errorMessages.pushObject({
          message: "You don't have enough Tfuel in your wallet",
        });
      }

      let tfuelStake = this.store.createRecord(
        'tfuelstake',
        this.getProperties('walletAddress', 'stakeAmount')
      );
      await tfuelStake.save();
      this.utils.successNotify(
        `Your request to stake ${this.stakeAmount} Tfuel has been submitted`
      );
      this.stakeAmount = '';
      this.walletAddress = '';
    } catch (err) {
      this.errorMessages.pushObject(err.errors);
    }
  }

  @action
  async unstake(stake) {
    this.errorMessages = [];
    try {
      let message = '';
      const savedStake = await stake.save();
      if (savedStake.isUnstaked) {
        message = 'You succesfully canceled your stake request';
      } else if (savedStake.isStaked) {
        message = `Your request to unstake ${savedStake.stakeAmount} Tfuel has been canceled`;
      } else if (savedStake.isUnstaking) {
        message = `Your request to unstake ${savedStake.stakeAmount} Tfuel has been submitted`;
      } else {
        this.errorMessages.pushObject({ message: 'Action not authorized' });
      }
      this.utils.successNotify(message);
    } catch (err) {
      this.errorMessages.pushObject(err.errors);
    }
  }

  async verifyTfuelBalance(wa, stakeAmount) {
    let response = await fetch(
      `${this.envManager.config.explorerEndpoint}:8443/api/account/${wa}`
    );
    if (response.status == 200) {
      let data = await response.json();
      if (thetajs.utils.fromWei(data.body.balance.tfuelwei) < stakeAmount) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
}