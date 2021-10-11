import Controller from '@ember/controller';

export default class NftInfoController extends Controller {
  get nft() {
    return this.model.nft;
  }
}
