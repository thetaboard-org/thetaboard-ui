import Ember from 'ember';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class CoinbaseHistoryComponent extends Component {
  constructor(...args) {
    super(...args);
    this.account = '';
  }
  @service('env-manager') envManager;
  @service('theta-sdk') thetaSdk;

  get coinbasesLastDay() {
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    const lastDayCoinbases = this.thetaSdk.eliteEdgeNodeCoinbases.filter(
      (x) => new Date(Number(x.timestamp * 1000)) > yesterday
    );
    return lastDayCoinbases;
  }

  get coinbasesLastDayTfuelAmount() {
    const finalAmount = this.coinbasesLastDay.reduce((a, b) => a + b.amount, 0);
    return finalAmount;
  }

  get coinbasesLastDayUsdValue() {
    if (this.thetaSdk.prices && this.thetaSdk.prices.tfuel) {
      return this.coinbasesLastDayTfuelAmount * this.thetaSdk.prices.tfuel.price;
    }
    return 0;
  }

  get coinbasesLastWeek() {
    const lastWeek = new Date(new Date().setDate(new Date().getDate() - 7));
    const lastWeekCoinbases = this.thetaSdk.eliteEdgeNodeCoinbases.filter(
      (x) => new Date(Number(x.timestamp * 1000)) > lastWeek
    );
    return lastWeekCoinbases;
  }

  get coinbasesLastWeekTfuelAmount() {
    const finalAmount = this.coinbasesLastWeek.reduce((a, b) => a + b.amount, 0);
    return finalAmount;
  }

  get coinbasesLastWeekUsdValue() {
    if (this.thetaSdk.prices && this.thetaSdk.prices.tfuel) {
      return this.coinbasesLastWeekTfuelAmount * this.thetaSdk.prices.tfuel.price;
    }
    return 0;
  }

  get coinbasesLastMonth() {
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1));
    const lastMonthCoinbases = this.thetaSdk.eliteEdgeNodeCoinbases.filter(
      (x) => new Date(Number(x.timestamp * 1000)) > lastMonth
    );
    return lastMonthCoinbases;
  }

  get coinbasesLastMonthTfuelAmount() {
    const finalAmount = this.coinbasesLastMonth.reduce((a, b) => a + b.amount, 0);
    return finalAmount;
  }

  get coinbasesLastMonthUsdValue() {
    if (this.thetaSdk.prices && this.thetaSdk.prices.tfuel) {
      return this.coinbasesLastMonthTfuelAmount * this.thetaSdk.prices.tfuel.price;
    }
    return 0;
  }

  get showLastMonth() {
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1));
    return this.lastCoinbaseDate < lastMonth;
  }

  get coinbasesLastTwoMonths() {
    const lastTwoMonth = new Date(new Date().setMonth(new Date().getMonth() - 2));
    const lastTwoMonthCoinbases = this.thetaSdk.eliteEdgeNodeCoinbases.filter(
      (x) => new Date(Number(x.timestamp * 1000)) > lastTwoMonth
    );
    return lastTwoMonthCoinbases;
  }

  get coinbasesLastTwoMonthsTfuelAmount() {
    const finalAmount = this.coinbasesLastTwoMonths.reduce((a, b) => a + b.amount, 0);
    return finalAmount;
  }

  get coinbasesLastTwoMonthsUsdValue() {
    if (this.thetaSdk.prices && this.thetaSdk.prices.tfuel) {
      return this.coinbasesLastTwoMonthsTfuelAmount * this.thetaSdk.prices.tfuel.price;
    }
    return 0;
  }

  get showLastTwoMonth() {
    const lastTwoMonth = new Date(new Date().setMonth(new Date().getMonth() - 2));
    return this.lastCoinbaseDate < lastTwoMonth;
  }

  get lastCoinbaseDate() {
    if (this.thetaSdk.eliteEdgeNodeCoinbases.lastObject && this.thetaSdk.eliteEdgeNodeCoinbases.lastObject.timestamp) {
      return new Date(Number(this.thetaSdk.eliteEdgeNodeCoinbases.lastObject.timestamp * 1000));
    }
    return '';
  }

  get explorerEndpoint() {
    return this.envManager.config.explorerEndpoint;
  }

  async connectToWallet() {
    const address = await this.thetaSdk.connectWallet();
    this.args.onRouteChange(address);
  }

  @action
  async connectWallet(event) {
    if (event) {
      event.preventDefault();
    }
    Ember.run.debounce(this, this.connectToWallet, 500, true);
  }
}
