import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MyWalletsAddGroupsComponent extends Component {
  @tracked name;
  @tracked errMessages;
  @tracked isAddingGroups;

  @service utils;
  @service currentUser;
  @service store;

  get walletList() {
    return this.currentUser.wallets;
  }

  @action
  resetComponent() {
    this.name = '';
    this.isAddingGroups = false;
    this.walletList.forEach((wallet) => {
      wallet.isSelected = false;
    });
  }

  @action
  showAddGroup() {
    this.isAddingGroups = true;
  }

  @action
  toggleWallet(wallet) {
    wallet.isSelected = !wallet.isSelected;
  }

  @action
  async submitGroup(e) {
    try {
      e.preventDefault();
      this.errMessages = [];
      if (!this.name || this.name.length == 0) {
        return this.errMessages.pushObject({
          message: 'Invalid Group name',
        });
      }
      let group = this.store.createRecord('group', {
        wallets: this.walletList.filter((x) => x.isSelected),
        name: this.name,
      });
      await group.save();
      this.utils.successNotify(`Group created`);
      this.resetComponent();
    } catch (err) {
      this.errMessages.pushObject(err.errors);
    }
  }
}
