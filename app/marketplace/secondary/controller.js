import Controller from '@ember/controller';
import { debounce } from '@ember/runloop';
import {action} from '@ember/object';
import { tracked } from '@glimmer/tracking';




export default class SecondaryController extends Controller {
  @tracked search = '';
  @tracked selectedArtists = [];

  get sellingNFTs(){
    return this.model.marketplaceInfo.sellingNFTs;
  }

  get artists(){
    return this.model.marketplaceInfo.artists;
  }

  async searchMarketplaceFetch (){
    if(this.search || this.selectedArtists.length !== 0){
      const artistIds = this.selectedArtists.map((x)=>x.id).join(',')
      const marketplaceInfoFetch = await fetch(`/api/marketplace/search?search=${this.search}&artists=${artistIds}`);
      const marketplaceInfo = await marketplaceInfoFetch.json();
      this.model = {marketplaceInfo: marketplaceInfo};
    } else {
      const marketplaceInfoFetch = await fetch(`/api/marketplace`);
      const marketplaceInfo = await marketplaceInfoFetch.json();
      this.model = {marketplaceInfo: marketplaceInfo};
    }


  }

  @action
  searchMarketplace(){
    debounce(this, this.searchMarketplaceFetch, 500);
  }

  @action
  changeArtist(artist){
    this.selectedArtists = artist
    debounce(this, this.searchMarketplaceFetch, 500);
  }

}
