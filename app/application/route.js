import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';

export default class ApplicationRoute extends Route {
  queryParams = {
    env: {
      refreshModel: true,
    },
    wa: {
      refreshModel: true,
    },
  };

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

  async beforeModel() {
    const params = this.paramsFor('application');
    const locale = this.getLocaleLanguage();
    this.intl.setLocale([locale]);
    await this.envManager.setParameters(params);
    return this._loadCurrentUser();
  }

  getLocaleLanguage() {
    let locale = null;
    const availableLocal = ['en', 'fr', 'es'];
    if (navigator.languages != undefined) {
      locale = navigator.languages[0].substring(0, 2).toLowerCase();
    } else {
      locale = navigator.language.substring(0, 2).toLowerCase();
    }
    if (availableLocal.indexOf(locale) > -1) {
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
