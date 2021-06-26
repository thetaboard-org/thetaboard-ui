import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';

export default class ApplicationRoute extends Route {
  queryParams = {
    env: {
      refreshModel: true,
    },
    wa: {}
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

  async beforeModel() {
    const params = this.paramsFor('application');
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
