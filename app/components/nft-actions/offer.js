import Component from '@glimmer/component';
import {inject as service} from '@ember/service';
import {action} from '@ember/object';
import {tracked} from "@glimmer/tracking";
import {ethers} from "ethers";
import {computed} from '@ember/object';


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

  get price(){
    const offer = this.nft.properties.offers.find(offer => offer.offerer === this.metamask.currentAccount.toLowerCase());
    return ethers.utils.formatEther(offer.price);
  }

  get offersCount(){
    return this.nft.properties.offers.length;
  }

  @computed("nft.contract_addr", "nft.original_token_id", "metamask.currentAccount")
  get isOwner() {
    const isOwner = () => {
      if (!this.metamask.currentAccount) {
        return false;
      } else if (this.nft.properties.selling_info) {
        return this.nft.properties.selling_info.seller.toLowerCase() === this.metamask.currentAccount.toLowerCase();
      } else {
        return this.nft.owner.toLowerCase() === this.metamask.currentAccount.toLowerCase();
      }
    }
    return isOwner()
  }

  @computed('metamask.currentAccount')
  get offerStatus() {
    // return 0 if owned by current metamask wallet and no offer
    // return 1 if owned by current metamask wallet and there are offers
    // return 2 if owned by other wallet and current metamask wallet have made no offer
    // return 3 if owned by other wallet and current metamask wallet have made an offer
    const offers = this.nft.properties.offers || [];
    const isWalletInOffer = offers.some(offer => offer.offerer === this.metamask.currentAccount.toLowerCase());

    if (this.isOwner && offers.length === 0) {
      return 0;
    } else if (this.isOwner && offers.length !== 0) {
      return 1;
    } else if(!this.isOwner && !isWalletInOffer){
      return 2;
    } else if(!this.isOwner && isWalletInOffer){
      return 3;
    } else {
      debugger
    }
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

      const signer = this.metamask.provider.getSigner();
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

  @action
  async cancelOffer() {
    const signer = this.metamask.provider.getSigner();
    const offerContract = new ethers.Contract(this.abi.ThetaboardOfferAddr, this.abi.ThetaboardOffer, signer);
    const offer = this.nft.properties.offers.find(offer => offer.offerer === this.metamask.currentAccount.toLowerCase());
    const offerTx = await offerContract.cancelOffer(offer.itemId);
  }
}
