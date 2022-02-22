import Component from '@glimmer/component';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import {ethers} from "ethers";


export default class MarketplaceNFTComponent extends Component {
  @service abi;
  @service metamask;
  @service utils;

  get marketplaceContract() {
    // when calling this contract, we assume that metamask is present.
    // otherwise we won't have a signer
    return new this.metamask.web3.eth.Contract(this.abi.ThetaboardMarketplace, this.abi.ThetaboardMarketplaceAddr);
  }


  get nft() {
    return this.args.nft;
  }

  get priceEther(){
    const properties = this.nft.properties;
    return ethers.utils.formatUnits(properties.selling_info.price);
  }

  @action
  async buyNFT() {
    await this.metamask.initMeta();
    try {
      const properties = this.nft.properties;
      let artistWallet = "0x0000000000000000000000000000000000000000";
      if (properties.artist) {
        artistWallet = properties.artist["wallet-addr"];
      }
      const price = ethers.utils.parseEther(properties.selling_info.price);
      await this.marketplaceContract.methods.buyFromMarket(properties.selling_info.itemId, artistWallet, 250,).send({
        value: properties.selling_info.price,
        from: this.metamask.currentAccount
      });
      return this.utils.successNotify("Item acquired");
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }


  }
}
