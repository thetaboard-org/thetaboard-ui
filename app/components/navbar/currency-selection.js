import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class I18nCurrencySelectionComponent extends Component {
  @service currency;
  @service intl;

  @action
  async setCurrency(value) {
    await this.currency.setCurrency(value);
  }
}
