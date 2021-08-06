import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MyWalletsController extends Controller {
  @tracked errorMessages;

  @service utils;
  @service intl;
  @service currentUser;

  @action
  async changeIsDefault(object) {
    if (object.isDefault) {
      return;
    }
    object.isDefault = true;
    await object.save();
    this.utils.successNotify(this.intl.t('notif.setup_as_default', {name: object.name}));
    this.store.findAll('wallet');
    this.store.findAll('group');
  }

  @action
  async deleteWallet(wallet) {
    try {
      await wallet.destroyRecord();
      this.utils.successNotify(this.intl.t('notif.wallet_removed'));
    } catch (err) {
      this.errorMessages.pushObject(err.errors);
    }
  }

  @action
  async deleteGroup(group) {
    try {
      await group.destroyRecord();
      this.utils.successNotify(this.intl.t('notif.group_removed'));
    } catch (err) {
      this.errorMessages.pushObject(err.errors);
    }
  }
}
