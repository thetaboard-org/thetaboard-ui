import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default class SecondaryRoute extends Route {
  @service abi;

  async model(params) {
    const marketplaceInfoFetch = await fetch(`/api/marketplace`);
    const marketplaceInfo = await marketplaceInfoFetch.json()
    return {marketplaceInfo: marketplaceInfo};
  }
}
