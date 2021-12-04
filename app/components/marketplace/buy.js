import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Component from "@glimmer/component";
import {tracked} from '@glimmer/tracking';


export default class BuyComponent extends Component {
  @service utils;
  @service abi;
  @service intl;

  @tracked bid = 0;

  @action
  updateBid(event) {
    this.bid = event.target.value;
  }

  get minBid() {
    const getMinBid = async () => {
      const infos = await this.nft.blockChainInfo;
      // TODO; this is also used as a set which is quite bad..
      this.bid = Number(infos.minBid) + 1;
      return this.bid;
    }
    return getMinBid();
  }

  get nft() {
    return this.args.nft;
  }


  @action
  async buy(nft) {
    try {
      if (typeof ethereum === 'undefined' || !ethereum.isConnected()) {
        return this.utils.errorNotify(this.intl.t('notif.no_metamask'));
      } else if (parseInt(ethereum.chainId) !== 361) {
        return this.utils.errorNotify(this.intl.t('notif.not_theta_blockchain'));
      } else {
        window.web3 = new Web3(window.ethereum);
        const accounts = await ethereum.request({method: 'eth_requestAccounts'});
        const account = accounts[0];
        const sell_contract = new window.web3.eth.Contract(this.abi.ThetaboardDirectSell, nft.nftSellController);
        await sell_contract.methods.purchaseToken(nft.nftContractId).send({
          value: window.web3.utils.toWei(String(nft.price)),
          from: account
        });
        return this.utils.successNotify(this.intl.t('notif.success_nft'));
      }
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  @action
  async placeBid(nft) {
    try {
      if (typeof ethereum === 'undefined' || !ethereum.isConnected()) {
        return this.utils.errorNotify(this.intl.t('notif.no_metamask'));
      } else if (parseInt(ethereum.chainId) !== 361) {
        return this.utils.errorNotify(this.intl.t('notif.not_theta_blockchain'));
      } else {
        window.web3 = new Web3(window.ethereum);
        const accounts = await ethereum.request({method: 'eth_requestAccounts'});
        const account = accounts[0];

        const auction_contract = new window.web3.eth.Contract(this.abi.ThetaboardAuctionSell, nft.nftSellController);
        await auction_contract.methods.placeBid(nft.nftContractId).send({
          value: window.web3.utils.toWei(String(this.bid)),
          from: account
        });
        return this.utils.successNotify(this.intl.t('notif.success_nft'));
      }
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }


  }
}
