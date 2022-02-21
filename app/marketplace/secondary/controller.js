import Controller from '@ember/controller';

export default class SecondaryController extends Controller {

  get sellingNFTs(){
    return this.model.marketplaceInfo.sellingNFTs;
  }

}
