import Controller from '@ember/controller';

export default class NftController extends Controller {
  get nft() {
    return this.model.nft;
  }

  get drop() {
    return this.model.drop;
  }
}
