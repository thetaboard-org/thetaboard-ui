import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class TrendThetaComponent extends Component {
  @service('theta-sdk') thetaSdk;

  get trendYesterday() {
    const yesterday = moment.utc(new Date(new Date() -3600000*24)).format('YYYY-MM-DD');
    const prices = this.args.historic_price;
    const thetaPrice = this.thetaSdk.prices.theta.price;
    if (thetaPrice && prices[yesterday] && prices[yesterday].theta_price) {
      return this.setTrend(thetaPrice, prices[yesterday].theta_price);
    }
    return {
      type: '-',
      class: 'down',
      change: 0,
      percentChange: 0,
    };
  }

  get trendLastWeek() {
    const lastWeek = moment.utc(new Date(new Date() -3600000*24*7)).format('YYYY-MM-DD');
    const prices = this.args.historic_price;
    const thetaPrice = this.thetaSdk.prices.theta.price;
    if (thetaPrice && prices[lastWeek] && prices[lastWeek].theta_price) {
      return this.setTrend(thetaPrice, prices[lastWeek].theta_price);
    }
    return {
      type: '-',
      class: 'down',
      change: 0,
      percentChange: 0,
    };
  }

  setTrend(currentPrice, previousPrice) {
    const change = Math.round(((currentPrice - previousPrice) + Number.EPSILON) * 100) / 100;
    const percentChange = Math.round(((change / previousPrice * 100) + Number.EPSILON) * 100) / 100;
    return {
      type: percentChange < 0 ? '-' : '+',
      class: percentChange < 0 ? 'down' : 'up',
      change: change < 0 ? -change : change,
      percentChange: percentChange < 0 ? -percentChange : percentChange,
    };
  }
}
