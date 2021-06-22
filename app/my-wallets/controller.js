import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MyWalletsController extends Controller {
  @tracked address;
  @tracked name;
  @tracked isDefault;
  @tracked errorMessages;

  @service utils;
  @service currentUser;
  @service thetaSdk;

  @action
  async changeIsDefault(wallet) {
    if (wallet.isDefault) {
      return;
    }
    wallet.isDefault = true;
    await wallet.save();
    this.utils.successNotify(`Default wallet setup`);
    this.address = '';
    this.name = '';
    this.isDefault = false;
    return this.store.findAll('wallet');
  }

  @action
  async deleteWallet(wallet) {
    try {
      await wallet.destroyRecord();
      this.utils.successNotify(`Wallet removed`);
      return this.store.findAll('wallet');
    } catch (err) {
      this.errorMessages.pushObject(err.errors);
    }
  }

  @action
  async submitWallet(e) {
    try {
      e.preventDefault();
      this.errorMessages = [];
      if (
        !this.address ||
        this.address.length != 42 ||
        this.address.substr(1, 1).toLocaleLowerCase() != 'x'
      ) {
        return this.errorMessages.pushObject({
          message: 'Invalid wallet address',
        });
      }
      if (!this.name || this.name.length == 0) {
        return this.errorMessages.pushObject({
          message: 'Invalid wallet name',
        });
      }

      let wallet = this.store.createRecord('wallet', this.getProperties('address', 'name', 'isDefault'));
      await wallet.save();
      this.utils.successNotify(`Wallet added`);
      this.address = '';
      this.name = '';
      this.isDefault = false;
      await this.store.findAll('wallet');
      await this.thetaSdk.getWalletInfo([wallet.address]);
      this.transitionToRoute({
        queryParams: { wa: wallet.address },
        reload: true,
      });
    } catch (err) {
      this.errorMessages.pushObject(err.errors);
    }
  }
}
