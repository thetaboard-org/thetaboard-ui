import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class EECoinbaseHistoryComponent extends Component {
  @service envManager;
  @service thetaSdk;
  @service currency;

  get coinbasesLastDay() {
    const lastDayCoinbases = this.thetaSdk.eliteEdgeNodeCoinbases.filter((x) => x.timeScale === 'last_day');
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
    const lastWeekCoinbases = this.thetaSdk.eliteEdgeNodeCoinbases.filter((x) => x.timeScale === 'last_week');
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
    const lastMonthCoinbases = this.thetaSdk.eliteEdgeNodeCoinbases.filter((x) => x.timeScale === 'last_month');
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
    const lastSixMonthCoinbases = this.thetaSdk.eliteEdgeNodeCoinbases.filter((x) => x.timeScale === 'last_six_months');
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
