import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class I18nCurrencySelectionComponent extends Component {
  @service i18n;
  @service currency;
  @service intl;
  @service store;
  @service thetaSdk;

  @action
  async setLocale(value) {
    await this.i18n.setLocale(value);
  }

  @action
  async setCurrency(value) {
    await this.currency.setCurrency(value);
  }
}
