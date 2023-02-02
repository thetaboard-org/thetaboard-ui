import Route from '@ember/routing/route';
import fetch from 'fetch';

export default class LandingRoute extends Route {


  async model() {
    const [nft, marketplaceNewlyAdded] = await Promise.all([this._fetch_nft(),this._fetchMarketplaceAdded()]);
    return {nft: nft, marketplaceNewlyAdded: marketplaceNewlyAdded};
  }

  async _fetch_nft(){
    let latest_drop;

    const sponsored = await this.store.query('drop', {
      isLive: 1,
      isSponsored: 1,

      isPublic: 1,
      sortBy: "endDate",
      pageNumber: 1,
    });
    latest_drop = sponsored.firstObject;
    if(!latest_drop){
      const live = await this.store.query('drop', {
        isLive: 1,
        isSponsored: 0,

        sortBy: "endDate",
        pageNumber: 1,
        isPublic: 1,
      });
      latest_drop = live.firstObject;
    }
    if(!latest_drop){
      const isComing = await this.store.query('drop', {
        isComing: 1,

        isPublic: 1,
        sortBy: "startDate",
        pageNumber: 1
      });
      latest_drop = isComing.firstObject;
    }

    if(!latest_drop){
      const ended = await this.store.query('drop', {
        isEnded: 1,

        isPublic: 1,
        sortBy: "endDate",
        pageNumber: 1
      });
      latest_drop = ended.firstObject;
    }
    const drop = await this.store.findRecord('drop', latest_drop.id);
    const nfts = drop.nfts.content.currentState.map((x)=>x.id);
    const nft_id = nfts[Math.floor(Math.random() * nfts.length)]
    return this.store.findRecord('nft', nft_id);
  }

  async _fetchMarketplaceAdded(){
    const fetched = await fetch(`/api/marketplace/newlyAdded`);
    const newlyAdded = await fetched.json();
    return newlyAdded[0];
  }

}
