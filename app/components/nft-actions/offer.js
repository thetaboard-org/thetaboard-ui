import Component from '@glimmer/component';
import {inject as service} from '@ember/service';
import {action} from '@ember/object';
import {tracked} from "@glimmer/tracking";
import {ethers} from "ethers";

export default class NftActionsTransferComponent extends Component {
  @service utils;
  @service intl;
  @service metamask;
  @service abi;

  @tracked offerPanel = false;
  @tracked offering = false;
  @tracked offerPrice;

  get nft() {
    return this.args.nft;
  }

  @action
  toggleOfferPanel() {
    this.args.setTooltip();
    this.offerPanel = !this.offerPanel;
  }

  @action
  async makeOffer(event) {
    event.preventDefault();
    try {
      this.args.setTooltip();
      this.offering = true;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const offerContract = new ethers.Contract(this.abi.ThetaboardOfferAddr, this.abi.ThetaboardOffer, signer);
      const options = {value: ethers.utils.parseEther(this.offerPrice)};
      const offerTx = await offerContract.createNewOffer(this.nft.contract_addr, this.nft.original_token_id, options);
      await offerTx.wait();
      this.offering = false;
      this.offerPanel = false;
      this.args.setTooltip();
      return this.utils.successNotify(`Offered ${this.offerPrice} Tfuels for ${this.nft.name}`);
    } catch (e) {
      this.offering = false;
      this.args.setTooltip();
      return this.utils.errorNotify(e.message);
    }
  }
}
