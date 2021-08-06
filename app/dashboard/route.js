import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class DashboardRoute extends Route {
  @service thetaSdk;
  @service currency;
  @service historicPrice;

  async model() {
    const oneYearBack = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const historicPrice = await this.thetaSdk.getPrices(this.currency.currentCurrency.name, oneYearBack, today);
    return this.historicPrice.initialize(historicPrice);
  }
}
