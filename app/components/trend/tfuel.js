import Component from '@glimmer/component';
import {inject as service} from '@ember/service';

export default class TrendTfuelComponent extends Component {
  @service('theta-sdk') thetaSdk;

  get trendYesterday() {
    const tfuelPrice = this.thetaSdk.prices.tfuel.price;
    const perc_change = this.args.historic_price ? this.args.historic_price.tfuel.change_24h : 0;
    if (tfuelPrice && perc_change) {
      const previous_price = tfuelPrice / (1 - (-perc_change / 100));
      return this.setTrend(tfuelPrice, previous_price);
    }
    return {
      type: '+',
      class: 'up',
      change: 0,
      percentChange: 0,
    };
  }

  get trendLastWeek() {
    const lastWeek = moment.utc(new Date(new Date() - 3600000 * 24 * 7)).format('YYYY-MM-DD');
    const prices = this.args.historic_price ? this.args.historic_price.dailyPrice.find((x) => x.date === lastWeek)['tfuel-price'] : 0;
    const tfuelPrice = this.thetaSdk.prices.tfuel.price;
    if (tfuelPrice && prices) {
      return this.setTrend(tfuelPrice, prices);
    }
    return {
      type: '+',
      class: 'up',
      change: 0,
      percentChange: 0,
    };
  }

  get ratio() {
    return Number(this.thetaSdk.prices.theta.price / this.thetaSdk.prices.tfuel.price).toFixed(1);
  }

  setTrend(currentPrice, previousPrice) {
    const change = currentPrice - previousPrice;
    const percentChange = (change / previousPrice) * 100;
    return {
      type: percentChange < 0 ? '-' : '+',
      class: percentChange < 0 ? 'down' : 'up',
      change: change < 0 ? -change : change,
      percentChange: percentChange < 0 ? -percentChange : percentChange,
    };
  }
}
