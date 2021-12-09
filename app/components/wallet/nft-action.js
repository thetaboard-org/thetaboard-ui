import Component from "@glimmer/component";
import {inject as service} from '@ember/service';
import {action} from '@ember/object';
import {tracked} from "@glimmer/tracking";

export default class NftActionComponent extends Component {
  @service utils;
  @service intl;
  @service('abi') abi;

  @tracked transfer_initiated = false;
  @tracked destinationAddr;

  get nft() {
    return this.args.nft;
  }

  get enableTooltip(){
    $('[data-toggle="tooltip"]').tooltip();
    return;
  }

  get metamaskAvailable() {
    const checkMetamask = async () => {
      if (typeof ethereum === 'undefined' || !ethereum.isConnected()) {
        return this.intl.t('notif.no_metamask');
      } else if (parseInt(ethereum.chainId) !== 361) {
        return this.intl.t('notif.not_theta_blockchain');
      } else {
        window.web3 = new Web3(window.web3.currentProvider);
        const account = await this.metamask_connect();
        const nft_contract = new window.web3.eth.Contract(this.abi.ThetaboardNFT, this.nft.contract_addr);
        const token_owner = await nft_contract.methods.ownerOf(this.nft.original_token_id).call();
        if (token_owner.toLowerCase() !== account) {
          return "The account connected on metamask need to be the owner of the nft";
        }
        return true;
      }
    }

    return checkMetamask();
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
      return this.utils.successNotify(this.intl.t('notif.success_nft'));
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }
}
