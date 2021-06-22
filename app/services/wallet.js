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

  get noneSelectedWallet() {
    if (this.isSearchedWalletOwned) {
      return this.wallets.filter(
        (wallet) => wallet.id != this.isSearchedWalletOwned.id
      );
    }
    return [];
  }

  @action
  async initWallet() {
    if (this.wallets.length) {
      if (!this.isSearchedWalletOwned && !this.thetaSdk.currentAccount) {
        let walletAddress = this.defaultWallet
          ? this.defaultWallet.address
          : this.wallets.firstObject.address;
        await this.thetaSdk.getWalletInfo([walletAddress]);
        return this.router.transitionTo({ queryParams: { wa: walletAddress } });
      }
    }
  }
}
