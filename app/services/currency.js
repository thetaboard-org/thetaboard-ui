import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CurrencyService extends Service {
  @tracked currentCurrency;
  @tracked thetaPrice;
  @tracked TfuelPrice;

  @service intl;
  @service thetaSdk;
  @service store;

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
        value: 'cad',
        name: this.intl.t(`currency.cad`),
      },
      {
        value: 'eur',
        name: this.intl.t(`currency.eur`),
      },
      {
        value: 'gbp',
        name: this.intl.t(`currency.gbp`),
      },
      {
        value: 'jpy',
        name: this.intl.t(`currency.jpy`),
      },
      {
        value: 'krw',
        name: this.intl.t(`currency.krw`),
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
