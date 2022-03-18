import Controller from '@ember/controller';
import {debounce} from '@ember/runloop';
import {action, computed, set} from '@ember/object';
import {tracked} from '@glimmer/tracking';


export default class SecondaryController extends Controller {
  @tracked search = '';
  @tracked selectedArtists = [];
  @tracked selectedDrops = [];
  @tracked selectedPriceRanges = [];
  @tracked selectedCategories = [];
  @tracked selectedSortBy = null;
  @tracked currentPageNumber = 1;

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

  get categories() {
    return this.model.facets.categories;
  }

  get sortBy() {
    return [{
      name: "Price: Low to High",
      id: "price:asc"
    },
      {
        name: "Price: High to Low",
        id: "price:desc"
      }]
  }

  @computed('model.marketplaceInfo.totalCount')
  get showPagination() {
    return this.model.marketplaceInfo.totalCount > 20;
  }

  @computed('model.marketplaceInfo.totalCount')
  get totalPageNumber() {
    return Math.ceil(this.model.marketplaceInfo.totalCount / 20);
  }

  async searchMarketplaceFetch() {
    const sortBy = this.selectedSortBy && this.selectedSortBy.id ? "price" : null;
    const orderBy = this.selectedSortBy && this.selectedSortBy.id ? this.selectedSortBy.id.split(':')[1] : null;

    if (this.search
      || this.selectedArtists.length !== 0
      || this.selectedDrops.length !== 0
      || this.selectedPriceRanges.length !== 0
      || this.selectedCategories.length !== 0) {

      const artistIds = this.selectedArtists.map((x) => x.id).join(',');
      const dropsIds = this.selectedDrops.map((x) => x.id).join(',');
      const priceRanges = this.selectedPriceRanges.join(',');
      const categories = this.selectedCategories.map((x) => x.id).join(',');

      const marketplaceInfoFetch = await fetch(
        `/api/marketplace/search?search=${this.search}&artist=${artistIds}&drop=${dropsIds}&priceRange=${priceRanges}&category=${categories}&sortBy=${sortBy}&orderBy=${orderBy}&pageNumber=${this.currentPageNumber}`);
      set(this.model, 'marketplaceInfo', await marketplaceInfoFetch.json());
    } else {
      const marketplaceInfoFetch = await fetch(`/api/marketplace?sortBy=${sortBy}&orderBy=${orderBy}&pageNumber=${this.currentPageNumber}`);
      set(this.model, 'marketplaceInfo', await marketplaceInfoFetch.json());

    }
  }

  @action
  searchMarketplace() {
    this.currentPageNumber = 1;
    debounce(this, this.searchMarketplaceFetch, 500);
  }

  @action
  changeArtist(artist) {
    this.currentPageNumber = 1;
    this.selectedArtists = artist;
    debounce(this, this.searchMarketplaceFetch, 500);
  }

  @action
  changeDrop(drop) {
    this.currentPageNumber = 1;
    this.selectedDrops = drop;
    debounce(this, this.searchMarketplaceFetch, 500);
  }

  @action
  changePriceRange(priceRange) {
    this.currentPageNumber = 1;
    this.selectedPriceRanges = priceRange;
    debounce(this, this.searchMarketplaceFetch, 500);
  }

  @action
  changeSortBy(sortBy) {
    this.currentPageNumber = 1;
    this.selectedSortBy = sortBy;
    debounce(this, this.searchMarketplaceFetch, 500);
  }

  @action
  pageChanged(page) {
    this.currentPageNumber = 1;
    this.currentPageNumber = page;
    debounce(this, this.searchMarketplaceFetch, 500);
  }

  @action
  changeCategory(categories) {
    this.currentPageNumber = 1;
    this.selectedCategories = categories;
    debounce(this, this.searchMarketplaceFetch, 500);
  }

}
