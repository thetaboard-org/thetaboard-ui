import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MyWalletsController extends Controller {
  @tracked errorMessages;

  @service utils;
  @service currentUser;

  @action
  async changeIsDefault(object) {
    if (object.isDefault) {
      return;
    }
    object.isDefault = true;
    await object.save();
    this.utils.successNotify(`${object.name} is now setup as default`);
    this.store.findAll('wallet');
    this.store.findAll('group');
  }

  @action
  async deleteWallet(wallet) {
    try {
      await wallet.destroyRecord();
      this.utils.successNotify(`Wallet removed`);
      // return this.store.findAll('wallet');
    } catch (err) {
      this.errorMessages.pushObject(err.errors);
    }
  }

  @action
  async deleteGroup(group) {
    try {
      await group.destroyRecord();
      this.utils.successNotify(`Group removed`);
      // return this.store.findAll('group');
    } catch (err) {
      this.errorMessages.pushObject(err.errors);
    }
  }
}
