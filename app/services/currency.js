import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class CurrencyService extends Service {
  @tracked currentCurrency;
  @tracked thetaPrice;
  @tracked TfuelPrice;
  @service intl;
  @service thetaSdk;

  get store() {
    return getOwner(this).lookup('service:store');
  }

  get currencyList() {
    return [
      {
        value: 'usd',
        name: this.intl.t(`currency.usd`),
      },
      {
        value: 'aud',
        name: this.intl.t(`currency.aud`),
      },
      {
        value: 'eur',
        name: this.intl.t(`currency.eur`),
      },
    ];
  }

  initialize(currency) {
    this.currentCurrency = currency
      ? this.setJsonReturn(currency)
      : this.setJsonReturn('usd');
  }

  @action
  async setCurrency(value) {
    const savedCurrency = await this.store.findAll('currency');
    if (savedCurrency.length) {
      savedCurrency.map((currencyToDelete) => currencyToDelete.destroyRecord());
    }
    let currency = this.store.createRecord('currency', {
      value: value,
    });
    currency.save();
    this.currentCurrency = this.setJsonReturn(value);
    //get Prices
    this.thetaSdk.getPrices(value.toUpperCase());
  }

  setJsonReturn(currency) {
    return {
      value: currency,
      name: this.intl.t(`currency.${currency}`),
      symbol: this.intl.t(`currency.symbol.${currency}`),
    };
  }
}
