import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import * as thetajs from '@thetalabs/theta-js';

export default class TfuelStakingController extends Controller {
  @tracked walletAddress;
  @tracked stakeAmount;
  @tracked errorMessages;

  @service('env-manager') envManager;
  @service utils;
  @service wallet;

  get summary() {
    return "0xbA8e836cfAcfb7032c66F5dC8e549089A2c04BC484c049b5631f98b5b5b1bbe21563c88948dedc06e6565452f10b3c97a3f2cd4c6f3c14ee22cf748fc76137fa62ef7a5a8a97fe51a07d4d40d36c3710ca87f691fc49e8f69f935a3e3f4e21c60e5f53752c9adb5c9617aca87eac0c2794e4dc4c123bf7c2416c035a76d13569ca5c7fc1c0eb23dc65d498db94af9d3a8a354d806146c3cfe8c0956cd0cde696e5133adb014c6b4c6a2b29ccfa6785099bff3be84a26d808ba4127a154d277ad080a90d323f7323cb34f6a596627c98527d501e1f2fba7ac4117d40a390954040371aa7200b1585ab57bec34636a48afd56f07c9893cd69f7c2fba387690bbe55fcd693a44"
  }

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
  async max(e) {
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

      const maxTfuel = await this.getMaxTfuelBalance(this.walletAddress);
      if (maxTfuel < 100000) {
        return this.errorMessages.pushObject({
          message: "You don't have enough Tfuel in your wallet",
        });
      }
      this.stakeAmount = Math.floor(maxTfuel);
    } catch (err) {
      this.errorMessages.pushObject(err.errors);
    }
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
      if (
        Number(thetajs.utils.fromWei(data.body.balance.tfuelwei)) < Number(stakeAmount) &&
        Number(thetajs.utils.fromWei(data.body.balance.tfuelwei)) < 100000
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  async getMaxTfuelBalance(wa) {
    let response = await fetch(
      `${this.envManager.config.explorerEndpoint}:8443/api/account/${wa}`
    );
    if (response.status == 200) {
      let data = await response.json();
      return thetajs.utils.fromWei(data.body.balance.tfuelwei);
    }
    return 0;
  }

  @action
  copySummaryToClipBoard(label, value) {
    this.utils.copyToClipboard(
      value,
      `${label} was successfully copied to your clipboad`
    );
  }
}
