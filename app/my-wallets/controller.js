import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MyWalletsController extends Controller {
  @tracked errorMessages;

  @service utils;
  @service currentUser;

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
}
