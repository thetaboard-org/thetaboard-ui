import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class NftInfoController extends Controller {
  @service abi;

  get nft() {
    return this.model.nft;
  }

  get isTNS() {
    return (
      this.nft.contract_addr === this.abi.tnsRegistrarContractAddr
    );
  }
}
