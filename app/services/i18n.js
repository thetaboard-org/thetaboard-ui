import Service from '@ember/service';
import { getOwner } from '@ember/application';

export default class I18nService extends Service {
  get intl() {
    return getOwner(this).lookup('service:intl');
  }

  get currentLocale() {
    return this.setJsonReturn(this.intl.get('primaryLocale'));
  }

  get localeList() {
    return this.intl.get('locales').map((locale) => {
      return this.setJsonReturn(locale);
    });
  }

  setJsonReturn(locale) {
    return {
      value: locale,
      name: this.intl.t(`locale.${locale}`),
      shortName: locale.charAt(0).toUpperCase() + locale.slice(1),
    };
  }
}
