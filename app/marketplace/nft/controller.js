import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class NftController extends Controller {
  @service currency;

  get nft() {
    return this.model.nft;
  }

  get drop() {
    return this.model.nft.drop;
  }
}
