import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';

export default class GroupService extends Service {
  get thetaSdk() {
    return getOwner(this).lookup('service:theta-sdk');
  }

  get currentUser() {
    return getOwner(this).lookup('service:current-user');
  }

  get router() {
    return getOwner(this).lookup('service:router');
  }

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
