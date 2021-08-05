import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';

export default class I18nService extends Service {
  get intl() {
    return getOwner(this).lookup('service:intl');
  }

  get store() {
    return getOwner(this).lookup('service:store');
  }

  get currentLocale() {
    return this.setJsonReturn(this.intl.get('primaryLocale'));
  }

  get localeList() {
    return this.intl.get('locales').map((locale) => {
      return this.setJsonReturn(locale);
    });
  }

  @action
  async setLocale(value) {
    const savedLocale = await this.store.findAll('locale');
    if (savedLocale.length) {
      savedLocale.map((localToDelete) => localToDelete.destroyRecord());
    }
    let locale = this.store.createRecord('locale', {
      value: value,
    });
    await locale.save();
    this.intl.setLocale(value);
  }

  setJsonReturn(locale) {
    return {
      value: locale,
      name: this.intl.t(`locale.${locale}`),
      shortName: locale.charAt(0).toUpperCase() + locale.slice(1),
    };
  }
}
