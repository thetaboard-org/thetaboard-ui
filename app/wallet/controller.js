import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class WalletController extends Controller {
  constructor(...args) {
    super(...args);
    this.account = '';
    this.group = '';
    this.wallets = [];
    this.loading = false;
  }
  @tracked loading;
  @service('theta-sdk') thetaSdk;

  async initCoinbase() {
    if (
      this.thetaSdk.currentAccount &&
      this.thetaSdk.currentAccount[0] &&
      (this.account == undefined ||
        this.account[0] == undefined ||
        this.thetaSdk.currentAccount[0].toLowerCase() != this.account[0].toLowerCase())
    ) {
      this.loading = true;
      this.account = this.thetaSdk.currentAccount;
      this.group = '';
      this.wallets = this.thetaSdk.currentAccount;
      const coinbases = await this.thetaSdk.getAllCoinbases(this.wallets);
      this.loading = false;
      return coinbases;
    } else if (
      this.thetaSdk.currentGroup &&
      this.thetaSdk.currentGroup != this.group
    ) {
      this.loading = true;
      this.group = this.thetaSdk.currentGroup;
      this.account = '';
      let allWallets = this.thetaSdk.wallets.map((x) => x.wallet_address.toLowerCase());
      this.wallets = [...new Set(allWallets)];
      const coinbases = await this.thetaSdk.getAllCoinbases(this.wallets);
      this.loading = false;
      return coinbases;
    }
  }

  get getcoinbases() {
    this.initCoinbase();
  }


  @action
  setQueryParam(walletAddress) {
    this.transitionToRoute({ queryParams: { wa: walletAddress } });
  }
}
