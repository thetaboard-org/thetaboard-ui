import Route from '@ember/routing/route';
import {getOwner} from '@ember/application';

export default class DashboardRoute extends Route {
  get thetaSdk() {
    return getOwner(this).lookup('service:theta-sdk');
  }

  async model() {
    const oneYearBack = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return {
      historicPrice: await this.thetaSdk.getPrices(oneYearBack, today, 'USD')
    };
  }
}
