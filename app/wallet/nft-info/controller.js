import Controller from '@ember/controller';

export default class NftInfoController extends Controller {
  get nft() {
    return this.model.nft;
  }

  get isTNS() {
    return (
      this.nft.contract_addr == '0xbb4d339a7517c81c32a01221ba51cbd5d3461a94'
    );
  }
}
