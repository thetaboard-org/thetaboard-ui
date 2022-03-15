import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { ethers } from "ethers";


export default class MarketplaceNFTComponent extends Component {
  constructor() {
    super(...arguments);
    this.setTooltip();
  }
  @service intl;
  @service thetaSdk;
  @service currency;

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
    if (!properties) return 0;
    const price = ethers.utils.formatUnits(properties.selling_info.price);
    return Number(this.thetaSdk.prices.tfuel.price * price).toFixed(2);
  }

  get priceEther() {
    const properties = this.nft.properties;
    if (!properties) return 0;
    return ethers.utils.formatUnits(properties.selling_info.price);
  }
}
