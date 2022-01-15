import Component from "@glimmer/component";
import {inject as service} from '@ember/service';
import {action} from '@ember/object';
import {tracked} from "@glimmer/tracking";

export default class NftActionComponent extends Component {
  @service utils;
  @service intl;
  @service('abi') abi;
  @service metamask;

  @tracked transfer_initiated = false;
  @tracked destinationAddr;

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

  get nftContract() {

  }

  get metamaskAvailable() {
    // return 0 if metamask is not installed
    // return 1 if not theta blockchain
    // return 2 if metamask is installed but not linked to thetaboard.io
    // return 3 if metamask is installed and linked but account is not the same as the NFT
    // return 4 if everything is good

    const checkMetamask = async () => {

      if (!this.metamask.isInstalled) {
        return 0;
      } else if (!this.metamask.isThetaBlockchain) {
        return 1;
      } else {
        if (!this.metamask.isConnected) {
          return 2;
        }
        const nft_contract = new window.web3.eth.Contract(this.abi.ThetaboardNFT, this.nft.contract_addr);
        const token_owner = await nft_contract.methods.ownerOf(this.nft.original_token_id).call();
        if (token_owner !== this.metamask.currentAccount) {
          return 3;
        }
        return 4;
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
  }

  @action
  async init_transfer() {
    this.transfer_initiated = true;
  }

  @action
  async transfer(event) {
    event.preventDefault();
    try {
      const account = await this.metamask_connect();
      const nft_contract = new window.web3.eth.Contract(this.abi.ThetaboardNFT, this.nft.contract_addr);
      await nft_contract.methods.transferFrom(account, this.destinationAddr, this.nft.original_token_id).send({
        from: account
      });
      return this.utils.successNotify("Successfully transfered");
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  @action
  async approve_for_sell() {
    debugger
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
      await this.marketplaceContract.methods.createMarketItem(this.nft.contract_addr, 2, this.sellPrice, "ThetaboardUser").send({
        from: account
      });
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }

  }
}
