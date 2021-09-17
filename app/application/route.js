import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { storageFor } from 'ember-local-storage';

export default class ApplicationRoute extends Route {
  queryParams = {
    env: {
      refreshModel: true,
    },
    wa: {
      refreshModel: true,
    },
    lang: {},
  };
  locales = storageFor('locales');

  @service envManager;
  @service session;
  @service currentUser;
  @service intl;
  @service currency;
  @service moment;
  @service i18n;

  async setLanguage() {
    const locale = await this.getLocaleLanguage();
    this.intl.setLocale([locale]);
    this.moment.setLocale(locale);
  }

  async beforeModel() {
    const params = this.paramsFor('application');
    if (params.lang) {
      if (this.intl.get('locales').indexOf(params.lang) > -1) {
        this.intl.setLocale([params.lang]);
        this.moment.setLocale(params.lang);
        await this.i18n.setLocale(params.lang);
      } else {
        await this.setLanguage();
      }
    } else {
      await this.setLanguage();
    }
    await this.setCurrency();
    await this.envManager.setParameters(params);
    return this._loadCurrentUser();
  }

  async setCurrency() {
    const currencies = await this.store.findAll('currency');
    let currency = null;
    if (currencies.length) {
      currency = currencies.firstObject.value;
    }
    this.currency.initialize(currency);
  }

  async getLocaleLanguage() {
    let locale = null;
    const savedLocale = await this.store.findAll('locale');
    if (savedLocale.length) {
      return savedLocale.firstObject.value;
    }
    if (navigator.languages != undefined) {
      locale = navigator.languages[0].substring(0, 2).toLowerCase();
    } else {
      locale = navigator.language.substring(0, 2).toLowerCase();
    }
    if (this.intl.get('locales').indexOf(locale) > -1) {
      return locale;
    } else {
      return 'en';
    }
  }

  async _loadCurrentUser() {
    try {
      await this.currentUser.load();
    } catch (err) {
      await this.session.invalidate();
    }
  }
}
