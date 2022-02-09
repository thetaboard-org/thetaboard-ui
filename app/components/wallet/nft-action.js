import Component from "@glimmer/component";
import {inject as service} from '@ember/service';
import {action} from '@ember/object';
import {tracked} from "@glimmer/tracking";
import { ethers } from "ethers";
import {computed} from '@ember/object';

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

  get nft() {
    return this.args.nft;
  }

  get enableTooltip() {
    $('[data-toggle="tooltip"]').tooltip();
    return;
  }

  get marketplaceContract() {
    return new window.web3.eth.Contract(this.abi.ThetaboardMarketplace, this.abi.ThetaboardMarketplaceAddr);
  }

  @computed("metamask.isInstalled", "metamask.isThetaBlockchain", "metamask.isConnected", "metamask.currentAccount")
  get isOwner() {
    // return 0 if metamask is not installed
    // return 1 if not theta blockchain
    // return 2 if metamask is installed but not linked to thetaboard.io
    // return 3 if metamask is installed and linked but account is not the same as the NFT
    // return 4  if NFT is getting sold by current metamask wallet
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
        const nft_contract = new window.web3.eth.Contract(this.abi.ThetaboardNFT, this.nft.contract_addr);
        const token_owner = await nft_contract.methods.ownerOf(this.nft.original_token_id).call();
        if (token_owner.toLowerCase() === currentAccount) {
          return 5;
        } else if (this.nft.properties.selling_info && this.nft.properties.selling_info.seller.toLowerCase() === currentAccount) {
          return 4;
        } else {
          return 3;
        }
      }

    }
    return checkMetamask();

  }

  get marketPlaceStatus() {
    // return 0 not approved
    // return 1 if approved
    // return 2 if on sale

    const checkStatus = async () => {
      const account = await this.metamask_connect();
      const nft_contract = new window.web3.eth.Contract(this.abi.ThetaboardNFT, this.nft.contract_addr);
      const approved = await nft_contract.methods.getApproved(this.nft.original_token_id).call();
      if (approved !== this.abi.ThetaboardMarketplaceAddr) {
        return 0;
      } else {

        const itemOnMarketplace = await this.marketplaceContract
          .methods.getByNftContractTokenId(this.nft.contract_addr, this.nft.original_token_id)
          .call();
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

  async metamask_connect() {
    if (typeof ethereum === 'undefined' || !ethereum.isConnected()) {
      return this.utils.errorNotify(this.intl.t('notif.no_metamask'));
    } else if (parseInt(ethereum.chainId) !== 361) {
      return this.utils.errorNotify(this.intl.t('notif.not_theta_blockchain'));
    } else {
      window.web3 = new Web3(window.web3.currentProvider);
      const accounts = await ethereum.request({method: 'eth_requestAccounts'});
      return accounts[0];
    }
    };
    return checkOwner();
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

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
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



@action
async approve_for_sell() {
  try {
    const account = await this.metamask_connect();
    const nft_contract = new window.web3.eth.Contract(this.abi.ThetaboardNFT, this.nft.contract_addr);
    await nft_contract.methods.approve(this.abi.ThetaboardMarketplaceAddr, this.nft.original_token_id).send({
      from: account
    });
    return this.utils.successNotify("Approved for sell");
  } catch (e) {
    return this.utils.errorNotify(e.message);
  }
}

@action
async sell_nft(event) {
  event.preventDefault();
  try {
    const account = await this.metamask_connect();
    await this.marketplaceContract.methods.createMarketItem(this.nft.contract_addr, this.nft.original_token_id, this.sellPrice, "ThetaboardUser").send({
      from: account
    });
    return this.utils.successNotify("Selling on marketplace");
  } catch (e) {
    return this.utils.errorNotify(e.message);
  }
}

@action
async cancel_sell() {
  try {
    const account = await this.metamask_connect();
    await this.marketplaceContract.methods.cancelMarketItem(this.nft.properties.selling_info.itemId).send({
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
