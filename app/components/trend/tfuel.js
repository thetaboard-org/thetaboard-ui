import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class TrendTfuelComponent extends Component {
  constructor(...args) {
    super(...args);
    this.dates;
    this.trendY;
    this.trendLW;
    this.initialize();
  }
  @service('theta-sdk') thetaSdk;

  @tracked trendY;
  @tracked trendLW;

  async initialize() {
    return await this.getDates().then((dates) => {
      this.dates = dates;
      this.trendLastWeek;
      this.trendYesterday;
    });
  }

  get trendYesterday() {
    const prices = this.args.historic_price;
    const tfuelPrice = this.thetaSdk.prices.tfuel.price;
    if (!this.dates) {
      return {
        type: '-',
        class: 'down',
        change: 0,
        percentChange: 0,
      };
    }
    this.trendY = this.setTrend(tfuelPrice, prices[this.dates.yesterday].tfuel_price);
    return this.trendY;
  }

  get trendLastWeek() {
    const prices = this.args.historic_price;
    const tfuelPrice = this.thetaSdk.prices.tfuel.price;
    if (!this.dates) {
      return {
        type: '-',
        class: 'down',
        change: 0,
        percentChange: 0,
      };
    }
    this.trendLW = this.setTrend(tfuelPrice, prices[this.dates.lastWeek].tfuel_price);
    return this.trendLW;
  }

  get ratio() {
    return Math.round(this.thetaSdk.prices.theta.price / this.thetaSdk.prices.tfuel.price) ;
  }

  setTrend(currentPrice, previousPrice) {
    const change = (currentPrice - previousPrice).toFixed(3);
    const percentChange = (change / previousPrice * 100).toFixed(2);
    return {
      type: percentChange < 0 ? '-' : '+',
      class: percentChange < 0 ? 'down' : 'up',
      change: change < 0 ? -change : change,
      percentChange: percentChange < 0 ? -percentChange : percentChange,
    };
  }

  async getDates() {
    const yesterday = await moment(new Date(new Date() - 3600000 * 24)).format('YYYY-MM-DD');
    const lastWeek = await moment(new Date(new Date() - 3600000 * 24 * 7)).format('YYYY-MM-DD');
    return {yesterday: yesterday, lastWeek: lastWeek};
  }
}
