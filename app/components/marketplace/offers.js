import Component from '@glimmer/component';
import {inject as service} from '@ember/service';
import {action} from '@ember/object';


export default class MarketplaceNftTileComponent extends Component {
  @service metamask;
  @service abi;

  get nft() {
    return this.args.nft;
  }

  get offers() {
    return this.nft.properties.offers;
  }

  get isOwner() {
    return this.metamask.isConnected && this.metamask.currentAccount.toLowerCase() === this.nft.owner
  }


  @action
  async acceptOffer(itemId) {
    let [artistWallet, royalties] = ['0x0000000000000000000000000000000000000000', 0];
    if (this.nft.properties.artist) {
      artistWallet = this.nft.properties.artist['wallet-addr'];
      royalties = 250;
    }
    const signer = this.metamask.provider.getSigner();
    const nft_contract = new ethers.Contract(this.nft.contract_addr, this.abi.ThetaboardNFT, signer);
    const offerContract = new ethers.Contract(this.abi.ThetaboardOfferAddr, this.abi.ThetaboardOffer, signer);
    const approveTx = await nft_contract.approve(this.abi.ThetaboardOfferAddr, this.nft.original_token_id);

    try {
      const offerTx = await offerContract.acceptOffer(itemId, artistWallet, royalties);
      await Promise.all([approveTx.wait(), offerTx.wait()]);
      this.offering = false;
      this.offerPanel = false;
    } catch (e) {
      debugger
    }

  }

  @action
  async rejectOffer(itemId) {
    const signer = this.metamask.provider.getSigner();
    const offerContract = new ethers.Contract(this.abi.ThetaboardOfferAddr, this.abi.ThetaboardOffer, signer);
    const offerTx = await offerContract.denyOffer(itemId);
    await offerTx.wait();
    this.offering = false;
    this.offerPanel = false;
  }
}
