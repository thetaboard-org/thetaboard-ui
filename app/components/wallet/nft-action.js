import Component from "@glimmer/component";
import {inject as service} from '@ember/service';
import {action} from '@ember/object';
import {tracked} from "@glimmer/tracking";
import {ethers} from "ethers";
import {set, computed} from '@ember/object';


export default class NftActionComponent extends Component {
  @service utils;
  @service intl;
  @service abi;
  @service metamask;

  @tracked commitingToApprove = false;
  @tracked approveLoading = false;
  @tracked cancelLoading = false;
  @tracked cancelApproveLoading = false;

  marketplaceChanged = 0;

  get nft() {
    return this.args.nft;
  }

  get priceEther() {
    return ethers.utils.formatUnits(this.nft.properties.selling_info.price, "ether");
  }

  get marketplaceContract() {
    // when calling this contract, we assume that metamask is present.
    // otherwise we won't have a signer
    const signer = this.metamask.provider.getSigner();
    return new ethers.Contract(this.abi.ThetaboardMarketplaceAddr, this.abi.ThetaboardMarketplace, signer);
  }

  @computed("metamask.isInstalled", "metamask.isThetaBlockchain", "metamask.isConnected", "metamask.currentAccount")
  get metamaskAvailable() {
    // return 0 if metamask is not installed
    // return 1 if not theta blockchain
    // return 2 if metamask is installed but not linked to thetaboard.io
    // return 3 if metamask is installed and linked but account is not the same as the NFT
    // return 4 if NFT is getting sold by current metamask wallet
    // return 5 if NFT is owned by current metamask wallet

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

        const currentAccount = this.metamask.currentAccount.toLowerCase();
        const nft_contract = new ethers.Contract(this.nft.contract_addr, this.abi.ThetaboardNFT, this.metamask.provider);
        const token_owner = await nft_contract.ownerOf(this.nft.original_token_id);
        if (token_owner.toLowerCase() === currentAccount) {
          return 5;
        } else if (this.nft.properties.selling_info && this.nft.properties.selling_info.seller.toLowerCase() === currentAccount) {
          return 4;
        } else {
          return 3;
        }
      }
    }
    return checkOwner();
  }

  @computed('marketplaceChanged')
  get marketPlaceStatus() {
    // return 0 not approved
    // return 1 if approved
    // return 2 if on sale

    const checkStatus = async () => {
      await this.metamask.initMeta();
      const nft_contract = new ethers.Contract(this.nft.contract_addr, this.abi.ThetaboardNFT, this.metamask.provider);
      const approved = await nft_contract.getApproved(this.nft.original_token_id);

      if (approved !== this.abi.ThetaboardMarketplaceAddr) {
        return 0;
      } else {
        const itemOnMarketplace = await this.marketplaceContract
          .getByNftContractTokenId(this.nft.contract_addr, this.nft.original_token_id);
        if (itemOnMarketplace.itemId === 0) {
          // is approved but not on sale
          return 1;
        } else {
          return 2;
        }
      }
    }
    return checkStatus();
  }

  setTooltip() {
    $('[data-toggle="tooltip"]').tooltip('hide');
    setTimeout(() => { $('[data-toggle="tooltip"]').tooltip() }, 1000);
  }

  @action
  async approve_for_sell() {
    try {
      this.approveLoading = true;
      this.setTooltip();
      const signer = this.metamask.provider.getSigner();
      const nft_contract = new ethers.Contract(this.nft.contract_addr, this.abi.ThetaboardNFT, signer);
      const tx = await nft_contract.approve(this.abi.ThetaboardMarketplaceAddr, this.nft.original_token_id);
      await tx.wait();
      this.approveLoading = false;
      // hack to update computed property of marketplace status
      set(this, 'marketplaceChanged', this.marketplaceChanged + 1);
      this.setTooltip();
      return this.utils.successNotify("Approved for sell");
    } catch (e) {
      this.approveLoading = false;
      this.setTooltip();
      return this.utils.errorNotify(e.message);
    }
  }

  @action
  async cancel_approve_for_sell() {
    try {
      this.cancelApproveLoading = true;
      this.setTooltip();
      const signer = this.metamask.provider.getSigner();
      const nft_contract = new ethers.Contract(this.nft.contract_addr, this.abi.ThetaboardNFT, signer);
      const tx = await nft_contract.approve("0x0000000000000000000000000000000000000000", this.nft.original_token_id);
      await tx.wait();
      this.cancelApproveLoading = false;
      // hack to update computed property of marketplace status
      set(this, 'marketplaceChanged', this.marketplaceChanged + 1);
      this.setTooltip();
      return this.utils.successNotify("Approved for sell");
    } catch (e) {
      this.cancelApproveLoading = false;
      this.setTooltip();
      return this.utils.errorNotify(e.message);
    }
  }

  @action
  async sell_nft(event) {
    event.preventDefault();
    try {
      this.commitingToApprove = true;
      this.setTooltip();
      const price = ethers.utils.parseEther(this.sellPrice);
      const tx = await this.marketplaceContract.createMarketItem(this.nft.contract_addr, this.nft.original_token_id, price, "ThetaboardUser");
      await tx.wait();
      // hack to update computed property of marketplace status
      set(this, 'marketplaceChanged', this.marketplaceChanged + 1);
      this.commitingToApprove = false;
      this.setTooltip();
      return this.utils.successNotify("Selling on marketplace");
    } catch (e) {
      this.commitingToApprove = false;
      this.setTooltip();
      return this.utils.errorNotify(e.message);
    }
  }

  @action
  async cancel_sell() {
    try {
      this.cancelLoading = true;
      this.setTooltip();
      const tx = await this.marketplaceContract.cancelMarketItem(this.nft.properties.selling_info.itemId);
      await tx.wait();
      this.cancelLoading = false;
      set(this, 'marketplaceChanged', this.marketplaceChanged + 1);
      this.setTooltip();
      return this.utils.successNotify("Canceled the sell");
    } catch (e) {
      this.cancelLoading = false;
      this.setTooltip();
      return this.utils.errorNotify(e.message);
    }
  }
}
