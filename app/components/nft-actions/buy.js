import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class NftActionsBuyComponent extends Component {
  @service utils;
  @service intl;
  @service abi;
  @service metamask;

  @tracked commitingToBuy = false;

  get marketplaceContract() {
    // when calling this contract, we assume that metamask is present.
    // otherwise we won't have a signer
    return new this.metamask.web3.eth.Contract(this.abi.ThetaboardMarketplace, this.abi.ThetaboardMarketplaceAddr);
  }

  get nft() {
    return this.args.nft;
  }

  @computed('metamask.isInstalled', 'metamask.isThetaBlockchain', 'metamask.isConnected','metamask.currentAccount')
  get metamaskAvailable() {
    // return 0 if metamask is not installed
    // return 1 if not theta blockchain
    // return 2 if metamask is installed but not linked to thetaboard.io
    // return 3 if metamask is installed and linked

    const checkOwner = async () => {
      this.setTooltip();
      if (!this.metamask.isInstalled) {
        return 0;
      } else if (!this.metamask.isThetaBlockchain) {
        return 1;
      } else {
        if (!this.metamask.isConnected) {
          return 2;
        }
      }
      return 3;
    };
    return checkOwner();
  }

  setTooltip() {
    $('[data-toggle="tooltip"]').tooltip('hide');
    setTimeout(() => {
      $('[data-toggle="tooltip"]').tooltip();
    }, 1000);
  }

  @action
  async buyNFT() {
    this.setTooltip();
    this.commitingToBuy = true;
    await this.metamask.initMeta();
    try {
      const properties = this.nft.properties;
      let artistWallet = '0x0000000000000000000000000000000000000000';
      if (properties.artist) {
        artistWallet = properties.artist['wallet-addr'];
      }
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
