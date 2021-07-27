import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MyWalletsAddWalletsComponent extends Component {
  @tracked address;
  @tracked name;
  @tracked errMessages;
  @tracked isAddingWallet;

  @service utils;
  @service currentUser;
  @service store;
  @service thetaSdk;
  @service router;

  @action
  resetComponent() {
    this.address = '';
    this.name = '';
    this.isAddingWallet = false;
  }

  @action
  showAddWallet() {
    this.isAddingWallet = true;
  }

  @action
  async submitWallet(e) {
    try {
      e.preventDefault();
      this.errMessages = [];
      if (
        !this.address ||
        this.address.length != 42 ||
        this.address.substr(1, 1).toLocaleLowerCase() != 'x'
      ) {
        return this.errMessages.pushObject({
          message: 'Invalid wallet address',
        });
      }
      if (!this.name || this.name.length == 0) {
        return this.errMessages.pushObject({
          message: 'Invalid wallet name',
        });
      }

      let wallet = this.store.createRecord('wallet', {
        address: this.address,
        name: this.name,
      });
      if (!this.currentUser.wallets.length) {
        wallet.isDefault = true;
      }
      await wallet.save();
      this.utils.successNotify(`Wallet added`);
      await this.thetaSdk.getWalletInfo([wallet.address]);
      this.router.transitionTo({
        queryParams: { wa: wallet.address },
        reload: true,
      });
      this.resetComponent();
    } catch (err) {
      this.errMessages.pushObject(err.errors);
    }
  }
}
