import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class I18nSelectionComponent extends Component {
  @service i18n;
  @service intl;
  @service store;

  @action
  async setLocale(value) {
    const savedLocale = await this.store.findAll('locale');
    if (savedLocale.length) {
      savedLocale.map((localToDelete) => localToDelete.destroyRecord());
    }
    let locale = this.store.createRecord('locale', {
      value: value
    });
    locale.save();
    this.intl.setLocale(value);
  }
}
