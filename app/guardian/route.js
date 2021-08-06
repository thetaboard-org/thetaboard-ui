import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class GuardianRoute extends Route {
  @service thetaSdk;
  @service guardian;

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
