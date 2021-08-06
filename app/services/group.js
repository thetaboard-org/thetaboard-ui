import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class GroupService extends Service {
  @service thetaSdk;
  @service currentUser;
  @service router;
  
  get groups() {
    return this.currentUser.groups;
  }

  get defaultGroup() {
    return this.currentUser.groups.filter((group) => group.isDefault).firstObject;
  }

  get isSearchedGroupOwned() {
    let ownedGroup = false;
    if (this.thetaSdk.currentGroup) {
      this.groups.forEach((group) => {
        if (group.uuid == this.thetaSdk.currentGroup) {
          ownedGroup = group;
        }
      });
    }
    return ownedGroup;
  }

  @action
  async initGroup() {
    if (this.groups && this.groups.length) {
      if (!this.isSearchedGroupOwned && !this.thetaSdk.currentGroup && !this.thetaSdk.currentAccount) {
        if (this.defaultGroup) {
          await this.thetaSdk.getWalletsInfo('group', this.defaultGroup);
          return this.router.transitionTo({
            queryParams: { wa: null, group: this.defaultGroup.uuid },
          });
        }
      }
    }
  }
}
