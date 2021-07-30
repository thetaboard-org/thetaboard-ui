import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class TotalCoinbaseHistoryComponent extends Component {
  constructor(...args) {
    super(...args);
    this.account = '';
    this.group = '';
    this.wallets = [];
  }
  @service('env-manager') envManager;
  @service('theta-sdk') thetaSdk;

  async initialize() {
    if (
      this.thetaSdk.currentAccount &&
      this.thetaSdk.currentAccount[0] &&
      (this.account == undefined ||
        this.account[0] == undefined ||
        this.thetaSdk.currentAccount[0].toLowerCase() != this.account[0].toLowerCase())
    ) {
      this.account = this.thetaSdk.currentAccount;
      this.group = '';
      this.wallets = this.thetaSdk.currentAccount;
      return await this.thetaSdk.getAllCoinbases(this.wallets);
    } else if (
      this.thetaSdk.currentGroup &&
      this.thetaSdk.currentGroup != this.group
    ) {
      this.group = this.thetaSdk.currentGroup;
      this.account = '';
      let allWallets = this.thetaSdk.wallets.map((x) => x.wallet_address.toLowerCase());
      this.wallets = [...new Set(allWallets)];
      return await this.thetaSdk.getAllCoinbases(this.wallets);
    }
  }

  get coinbasesLastDay() {
    this.initialize();
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    const lastDayCoinbases = this.thetaSdk.coinbases.filter((x) => x.timestamp > yesterday);
    return lastDayCoinbases;
  }

  get coinbasesLastDayTfuelAmount() {
    const finalAmount = this.coinbasesLastDay.reduce((a, b) => a + b.value, 0);
    return Number.parseFloat(finalAmount).toFixed(2);
  }

  get coinbasesLastDayUsdValue() {
    if (this.thetaSdk.prices && this.thetaSdk.prices.tfuel) {
      return this.coinbasesLastDayTfuelAmount * this.thetaSdk.prices.tfuel.price;
    }
    return 0;
  }

  get coinbasesLastWeek() {
    const lastWeek = new Date(new Date().setDate(new Date().getDate() - 7));
    const lastWeekCoinbases = this.thetaSdk.coinbases.filter((x) => x.timestamp > lastWeek);
    return lastWeekCoinbases;
  }

  get coinbasesLastWeekTfuelAmount() {
    const finalAmount = this.coinbasesLastWeek.reduce((a, b) => a + b.value, 0);
    return Number.parseFloat(finalAmount).toFixed(2);
  }

  get coinbasesLastWeekUsdValue() {
    if (this.thetaSdk.prices && this.thetaSdk.prices.tfuel) {
      return this.coinbasesLastWeekTfuelAmount * this.thetaSdk.prices.tfuel.price;
    }
    return 0;
  }

  get coinbasesLastMonth() {
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1));
    const lastMonthCoinbases = this.thetaSdk.coinbases.filter((x) => x.timestamp > lastMonth);
    return lastMonthCoinbases;
  }

  get coinbasesLastMonthTfuelAmount() {
    const finalAmount = this.coinbasesLastMonth.reduce((a, b) => a + b.value, 0);
    return Number.parseFloat(finalAmount).toFixed(2);
  }

  get coinbasesLastMonthUsdValue() {
    if (this.thetaSdk.prices && this.thetaSdk.prices.tfuel) {
      return this.coinbasesLastMonthTfuelAmount * this.thetaSdk.prices.tfuel.price;
    }
    return 0;
  }

  get coinbasesLastSixMonths() {
    const lastSixMonth = new Date(new Date().setMonth(new Date().getMonth() - 6));
    const lastSixMonthCoinbases = this.thetaSdk.coinbases.filter((x) => x.timestamp > lastSixMonth);
    return lastSixMonthCoinbases;
  }

  get coinbasesLastSixMonthsTfuelAmount() {
    const finalAmount = this.coinbasesLastSixMonths.reduce((a, b) => a + b.value, 0);
    return Number.parseFloat(finalAmount).toFixed(2);
  }

  get coinbasesLastSixMonthsUsdValue() {
    if (this.thetaSdk.prices && this.thetaSdk.prices.tfuel) {
      return this.coinbasesLastSixMonthsTfuelAmount * this.thetaSdk.prices.tfuel.price;
    }
    return 0;
  }

  get explorerEndpoint() {
    return this.envManager.config.explorerEndpoint;
  }
}
