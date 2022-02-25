import Controller from '@ember/controller';
import {debounce} from '@ember/runloop';
import {action, computed, set} from '@ember/object';
import {tracked} from '@glimmer/tracking';


export default class SecondaryController extends Controller {
  @tracked search = '';
  @tracked selectedArtists = [];
  @tracked selectedDrops = [];

  @computed("model.marketplaceInfo")
  get sellingNFTs() {
    return this.model.marketplaceInfo.sellingNFTs;
  }

  get artists() {
    return this.model.facets.artists;
  }

  get drops() {
    return this.model.facets.drops;
  }

  get categories() {
    return this.model.facets.categories;
  }

  get priceRange() {
    debugger
  }

  async searchMarketplaceFetch() {
    if (this.search || this.selectedArtists.length !== 0 || this.selectedDrops.length !==  0) {
      const artistIds = this.selectedArtists.map((x) => x.id).join(',');
      const dropsIds = this.selectedDrops.map((x) => x.id).join(',');
      const marketplaceInfoFetch = await fetch(`/api/marketplace/search?search=${this.search}&artist=${artistIds}&drop=${dropsIds}`);
      set(this.model, 'marketplaceInfo',  await marketplaceInfoFetch.json());
    } else {
      const marketplaceInfoFetch = await fetch(`/api/marketplace`);
      set(this.model, 'marketplaceInfo',  await marketplaceInfoFetch.json());

    }
  }

  @action
  searchMarketplace() {
    debounce(this, this.searchMarketplaceFetch, 500);
  }

  @action
  changeArtist(artist) {
    this.selectedArtists = artist
    debounce(this, this.searchMarketplaceFetch, 500);
  }

  @action
  changeDrop(drop) {
    this.selectedDrops = drop
    debounce(this, this.searchMarketplaceFetch, 500);
  }

}
