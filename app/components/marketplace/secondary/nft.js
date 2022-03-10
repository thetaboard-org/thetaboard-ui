import Component from '@glimmer/component';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import {ethers} from "ethers";
import { tracked } from '@glimmer/tracking';


export default class MarketplaceNFTComponent extends Component {
  constructor() {
    super(...arguments);
    this.setTooltip();
  }
  @service abi;
  @service metamask;
  @service utils;
  @service intl;
  @service thetaSdk;
  @service currency;
  @tracked commitingToBuy = false;

  get marketplaceContract() {
    // when calling this contract, we assume that metamask is present.
    // otherwise we won't have a signer
    return new this.metamask.web3.eth.Contract(this.abi.ThetaboardMarketplace, this.abi.ThetaboardMarketplaceAddr);
  }

  setTooltip() {
    $('[data-toggle="tooltip"]').tooltip('hide');
    setTimeout(() => {
      $('[data-toggle="tooltip"]').tooltip();
    }, 1000);
  }

  get nft() {
    return this.args.nft;
  }

  get priceCurrency() {
    const properties = this.nft.properties;
    const price = ethers.utils.formatUnits(properties.selling_info.price);
    return Number(this.thetaSdk.prices.tfuel.price * price).toFixed(2);
  }

  get priceEther() {
    const properties = this.nft.properties;
    return ethers.utils.formatUnits(properties.selling_info.price);
  }

  @action
  async buyNFT() {
    this.setTooltip();
    this.commitingToBuy = true;
    await this.metamask.initMeta();
    try {
      const properties = this.nft.properties;
      let artistWallet = "0x0000000000000000000000000000000000000000";
      if (properties.artist) {
        artistWallet = properties.artist["wallet-addr"];
      }
      const price = ethers.utils.parseEther(properties.selling_info.price);
      await this.marketplaceContract.methods
        .buyFromMarket(properties.selling_info.itemId, artistWallet, 250)
        .send({
          value: properties.selling_info.price,
          from: this.metamask.currentAccount,
        });
      this.commitingToBuy = false;
      this.setTooltip();
      return this.utils.successNotify(this.intl.t('NFT.iten_aquired'));
    } catch (e) {
      this.commitingToBuy = false;
      this.setTooltip();
      return this.utils.errorNotify(e.message);
    }
  }
}
