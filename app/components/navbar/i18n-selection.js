import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class I18nCurrencySelectionComponent extends Component {
  @service i18n;
  @service intl;
  @service thetaSdk;

  @action
  async setLocale(value) {
    await this.i18n.setLocale(value);
  }
}
