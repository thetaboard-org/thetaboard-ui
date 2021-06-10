import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';

export default class ApplicationRoute extends Route {
  queryParams = {
    env: {
      refreshModel: true,
    },
    wa: {}
  };

  get thetaSdk() {
    return getOwner(this).lookup('service:theta-sdk');
  }

  get envManager() {
    return getOwner(this).lookup('service:env-manager');
  }

  get guardian() {
    return getOwner(this).lookup('service:guardian');
  }

  get session() {
    return getOwner(this).lookup('service:session');
  }

  get currentUser() {
    return getOwner(this).lookup('service:currentUser');
  }

  beforeModel() {
    return this._loadCurrentUser();
  }

  async _loadCurrentUser() {
    try {
      await this.currentUser.load();
    } catch (err) {
      await this.session.invalidate();
    }
  }

  async model(params) {
    this.envManager.setParameters(params);
    const guardianStatus = await this.thetaSdk.getGuardianStatus();
    const guardianSummary = await this.thetaSdk.getGuardianSummary();
    const guardianLatestSnapshot = await this.thetaSdk.getGuardianLatestSnapshot();
    return this.guardian.setup({
      guardianStatus: guardianStatus,
      guardianSummary: guardianSummary,
      guardianLatestSnapshot: guardianLatestSnapshot,
    });
  }
}
