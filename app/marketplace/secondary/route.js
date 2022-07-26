import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default class SecondaryRoute extends Route {
  @service abi;

  async model(params) {
    const [marketplaceInfoFetch, facetsFetch] = await Promise.all([
      fetch(`/api/marketplace`),
      fetch(`/api/marketplace/facets`),
    ]);
    const [marketplaceInfo, facets] = await Promise.all([marketplaceInfoFetch.json(), facetsFetch.json()]);
    return {marketplaceInfo: marketplaceInfo, facets: facets};
  }
}
