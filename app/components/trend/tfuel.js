import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class TrendTfuelComponent extends Component {
  @service('theta-sdk') thetaSdk;

  get trendYesterday() {
    const yesterday = moment.utc(new Date(new Date() - 3600000 * 24)).format('YYYY-MM-DD');
    const prices = this.args.historic_price;
    const tfuelPrice = this.thetaSdk.prices.tfuel.price;
    if (tfuelPrice && prices[yesterday] && prices[yesterday].tfuel_price) {
      return this.setTrend(tfuelPrice, prices[yesterday].tfuel_price);
    }
    return {
      type: '-',
      class: 'down',
      change: 0,
      percentChange: 0,
    };
  }

  get trendLastWeek() {
    const lastWeek = moment.utc(new Date(new Date() - 3600000 * 24 * 7)).format('YYYY-MM-DD');
    const prices = this.args.historic_price;
    const tfuelPrice = this.thetaSdk.prices.tfuel.price;
    if (tfuelPrice && prices[lastWeek] && prices[lastWeek].tfuel_price) {
      return this.setTrend(tfuelPrice, prices[lastWeek].tfuel_price);
    }
    return {
      type: '-',
      class: 'down',
      change: 0,
      percentChange: 0,
    };
  }

  get ratio() {
    return Math.round(this.thetaSdk.prices.theta.price / this.thetaSdk.prices.tfuel.price) ;
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
