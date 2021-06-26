import Route from '@ember/routing/route';
import {getOwner} from '@ember/application';


export default class GuardianRoute extends Route {
  get thetaSdk() {
    return getOwner(this).lookup('service:theta-sdk');
  }

  get guardian() {
    return getOwner(this).lookup('service:guardian');
  }

  async model(params) {
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
