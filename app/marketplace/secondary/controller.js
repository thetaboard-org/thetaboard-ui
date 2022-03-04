import Controller from '@ember/controller';
import {debounce} from '@ember/runloop';
import {action, computed, set} from '@ember/object';
import {tracked} from '@glimmer/tracking';


export default class SecondaryController extends Controller {
  @tracked search = '';
  @tracked selectedArtists = [];
  @tracked selectedDrops = [];
  @tracked selectedPriceRanges = [];

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

  get priceRanges() {
    return this.model.facets.priceRanges;
  }

  async searchMarketplaceFetch() {
    if (this.search
      || this.selectedArtists.length !== 0
      || this.selectedDrops.length !== 0
      || this.selectedPriceRanges.length !== 0) {

      const artistIds = this.selectedArtists.map((x) => x.id).join(',');
      const dropsIds = this.selectedDrops.map((x) => x.id).join(',');
      const priceRanges = this.selectedPriceRanges.join(',');
      const marketplaceInfoFetch = await fetch(`/api/marketplace/search?search=${this.search}&artist=${artistIds}&drop=${dropsIds}&priceRange=${priceRanges}`);
      set(this.model, 'marketplaceInfo', await marketplaceInfoFetch.json());
    } else {
      const marketplaceInfoFetch = await fetch(`/api/marketplace`);
      set(this.model, 'marketplaceInfo', await marketplaceInfoFetch.json());

    }
  }

  @action
  searchMarketplace() {
    debounce(this, this.searchMarketplaceFetch, 500);
  }

  @action
  changeArtist(artist) {
    this.selectedArtists = artist;
    debounce(this, this.searchMarketplaceFetch, 500);
  }

  @action
  changeDrop(drop) {
    this.selectedDrops = drop;
    debounce(this, this.searchMarketplaceFetch, 500);
  }

  @action
  changePriceRange(priceRange) {
    this.selectedPriceRanges = priceRange;
    debounce(this, this.searchMarketplaceFetch, 500);
  }

}
