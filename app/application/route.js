import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';
import { storageFor } from 'ember-local-storage';

export default class ApplicationRoute extends Route {
  queryParams = {
    env: {
      refreshModel: true,
    },
    wa: {
      refreshModel: true,
    },
  };
  locales = storageFor('locales');

  get envManager() {
    return getOwner(this).lookup('service:env-manager');
  }

  get session() {
    return getOwner(this).lookup('service:session');
  }

  get currentUser() {
    return getOwner(this).lookup('service:currentUser');
  }

  get intl() {
    return getOwner(this).lookup('service:intl');
  }

  get currency() {
    return getOwner(this).lookup('service:currency');
  }

  async beforeModel() {
    const params = this.paramsFor('application');
    const locale = await this.getLocaleLanguage();
    this.intl.setLocale([locale]);
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
