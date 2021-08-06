import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';

export default class WalletService extends Service {
  get thetaSdk() {
    return getOwner(this).lookup('service:theta-sdk');
  }

  get currentUser() {
    return getOwner(this).lookup('service:current-user');
  }

  get router() {
    return getOwner(this).lookup('service:router');
  }

  get wallets() {
    return this.currentUser.wallets;
  }

  get defaultWallet() {
    return this.currentUser.wallets.filter((wallet) => wallet.isDefault).firstObject;
  }

  get isSearchedWalletOwned() {
    let ownedWallet = false;
    if (this.thetaSdk.currentAccount) {
      this.wallets.forEach((wallet) => {
        if (wallet.address == this.thetaSdk.currentAccount) {
          ownedWallet = wallet;
        }
      });
    }
    return ownedWallet;
  }

  @action
  async initWallet() {
    if (this.wallets && this.wallets.length) {
      if (!this.isSearchedWalletOwned && !this.thetaSdk.currentGroup && !this.thetaSdk.currentAccount) {
        if (this.defaultWallet) {
          await this.thetaSdk.getWalletsInfo('wallet', [this.defaultWallet.address]);
          return this.router.transitionTo({
            queryParams: { wa: this.defaultWallet.address, group: null },
          });
        }
      }
    }
  }
}
