import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class I18nService extends Service {
  @service intl;
  @service store;
  @service moment;

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
    this.moment.setLocale(value);
    this.intl.setLocale(value);
  }

  setJsonReturn(locale) {
    return {
      value: locale,
      name: this.intl.t(`locale.${locale}`),
      shortName: locale.substring(0, 2).toUpperCase(),
    };
  }
}
