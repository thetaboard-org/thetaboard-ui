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
  @service domain;

  @tracked transferPanel;
  @tracked addressLookup;
  @tracked inputDomain;
  @tracked inputAddress;
  @tracked commitingToTransfer;
  @tracked transfering;

  marketplaceChanged = 0;

  get nft() {
    return this.args.nft;
  }

  get enableTooltip() {
    $('[data-toggle="tooltip"]').tooltip();
    return;
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

  @action
  toggleTransferPanel() {
    this.transferPanel = !this.transferPanel;
  }

  @action
  async transfer(event) {
    event.preventDefault();
    try {
      this.commitingToTransfer = true;
      const account = this.metamask.currentAccount;
      const signer = this.metamask.provider.getSigner();
      const nft_contract = new ethers.Contract(this.nft.contract_addr, this.abi.ThetaboardNFT, signer)
      const transfer = await nft_contract.transferFrom(account, this.inputAddress, this.nft.original_token_id);
      if (transfer && transfer.hash) {
        this.transfering = true;
        const receipt = await this.domain.waitForTransaction(transfer.hash);
        if (receipt.success) {
          this.transfering = false;
          this.commitingToTransfer = false;
          this.transferPanel = false;
          return this.utils.successNotify(`${this.domainName} ${this.intl.t('domain.domain_transfered')} ${this.inputAddress}`);
        } else {
          this.commitingToTransfer = false;
          this.transfering = false;
          return this.utils.errorNotify(
            this.intl.t('domain.error.problem_occured_check_metamask')
          );
        }
      } else {
        this.commitingToTransfer = false;
        this.transfering = false;
        return this.utils.errorNotify(
          this.intl.t('domain.user_rejected_transaction')
        );
      }
    } catch (e) {
      this.commitingToTransfer = false;
      this.transfering = false;
      return this.utils.errorNotify(e.message);
    }
  }


  @tracked approveLoading = false;
  @action
  async approve_for_sell() {
    try {
      this.approveLoading = true;
      const signer = this.metamask.provider.getSigner();
      const nft_contract = new ethers.Contract(this.nft.contract_addr, this.abi.ThetaboardNFT, signer);
      const tx = await nft_contract.approve(this.abi.ThetaboardMarketplaceAddr, this.nft.original_token_id);
      await tx.wait();
      this.approveLoading = false;
      // hack to update computed property of marketplace status
      set(this, 'marketplaceChanged', this.marketplaceChanged + 1);
      return this.utils.successNotify("Approved for sell");
    } catch (e) {
      this.approveLoading = false;
      return this.utils.errorNotify(e.message);
    }
  }

  @tracked cancelLoading = false;
  @action
  async cancel_approve_for_sell() {
    try {
      this.cancelLoading = true;
      const signer = this.metamask.provider.getSigner();
      const nft_contract = new ethers.Contract(this.nft.contract_addr, this.abi.ThetaboardNFT, signer);
      const tx = await nft_contract.approve("0x0000000000000000000000000000000000000000", this.nft.original_token_id);
      await tx.wait();

      // hack to update computed property of marketplace status
      set(this, 'marketplaceChanged', this.marketplaceChanged + 1);
      this.cancelLoading = false;
      return this.utils.successNotify("Approved for sell");
    } catch (e) {
      this.cancelLoading = false;
      return this.utils.errorNotify(e.message);
    }
  }

  @action
  async sell_nft(event) {
    event.preventDefault();
    try {
      const tx = await this.marketplaceContract.createMarketItem(this.nft.contract_addr, this.nft.original_token_id, this.sellPrice, "ThetaboardUser");
      await tx.wait();
      // hack to update computed property of marketplace status
      set(this, 'marketplaceChanged', this.marketplaceChanged + 1);
      return this.utils.successNotify("Selling on marketplace");
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  @action
  async cancel_sell() {
    try {
      await this.marketplaceContract.cancelMarketItem(this.nft.properties.selling_info.itemId).send({
        from: account
      });
      return this.utils.successNotify("Canceled the sell");
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  @action
  async inputHandler(e) {
    e.preventDefault();
    this.addressLookup = '';
    let inputValue = e.currentTarget.value;
    await this.metamask.initMeta();
    if (inputValue.endsWith(".theta")) {
      const address = await this.domain.getAddrForDomain(inputValue.replace(".theta", ""));
      if (
        address.addressRecord &&
        address.addressRecord != '0x0000000000000000000000000000000000000000'
      ) {
        const reverse = await this.domain.getReverseName(address.addressRecord);
        if (reverse.domain == inputValue.replace(".theta", "")) {
          this.addressLookup = address.addressRecord;
          this.inputDomain = inputValue;
        } else {
          this.addressLookup = '';
          this.inputDomain = '';
        }
      } else {
        this.inputDomain = '';
      }
      this.inputAddress = this.addressLookup;
    } else if (
      inputValue.toLowerCase().startsWith('0x') &&
      inputValue.length == '42'
    ) {
      const value = await this.domain.getReverseName(inputValue);
      if (value.domain) {
        this.addressLookup = value.domain + ".theta";
      }
      this.inputAddress = inputValue;
      this.inputDomain = this.addressLookup;
    } else {
      this.inputAddress = '';
      this.inputDomain = '';
    }
  }
}
