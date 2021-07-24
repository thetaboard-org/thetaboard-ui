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
    this.intl.setLocale(['en-us']);
    await this.envManager.setParameters(params);
    return this._loadCurrentUser();
  }

  async _loadCurrentUser() {
    try {
      await this.currentUser.load();
    } catch (err) {
      await this.session.invalidate();
    }
  }
}
