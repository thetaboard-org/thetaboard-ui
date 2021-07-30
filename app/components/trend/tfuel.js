import Component from '@glimmer/component';
import {inject as service} from '@ember/service';

export default class TrendTfuelComponent extends Component {
  @service('theta-sdk') thetaSdk;

  get trendYesterday() {
    const tfuelPrice = this.thetaSdk.prices.tfuel.price;
    const perc_change = this.args.historic_price.tfuel.change_24h;
    if (tfuelPrice && perc_change) {
      const previous_price = tfuelPrice + tfuelPrice / 100 * perc_change;
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
    const prices = this.args.historic_price.dailyPrice;
    const tfuelPrice = this.thetaSdk.prices.tfuel.price;
    if (tfuelPrice && prices.find((x) => x.date === lastWeek)) {
      return this.setTrend(tfuelPrice, prices.find((x) => x.date === lastWeek)['tfuel-price']);
    }
    return {
      type: '+',
      class: 'up',
      change: 0,
      percentChange: 0,
    };
  }

  get ratio() {
    return Math.round(this.thetaSdk.prices.theta.price / this.thetaSdk.prices.tfuel.price);
  }

  setTrend(currentPrice, previousPrice) {
    const change = (Number(currentPrice) - Number(previousPrice)).toFixed(3);
    const percentChange = (change / Number(previousPrice) * 100).toFixed(2);
    return {
      type: percentChange < 0 ? '-' : '+',
      class: percentChange < 0 ? 'down' : 'up',
      change: change < 0 ? -change : change,
      percentChange: percentChange < 0 ? -percentChange : percentChange,
    };
  }
}
