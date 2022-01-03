import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {action, computed} from '@ember/object';
import {tracked} from '@glimmer/tracking';


export default class NFTController extends Controller {
  @service('theta-sdk') thetaSdk;
  @service utils;
  @service intl;
  @service('abi') abi;


  // Manage pages
  @tracked currentPage = 1;

  @computed('model.totalCount')
  get totalPageNumber() {
    return Math.ceil(this.model.totalCount / 12);
  }

  async changePagination(current) {
    this.model = await this.model.wallets.reduce(async (total, wallet) => {
      const fetched = await fetch(`/explorer/wallet-nft/${wallet}?pageNumber=${current}`);
      const fetchedJSON = await fetched.json();
      total.totalCount += fetchedJSON.totalCount;
      total.NFTs.push(...fetchedJSON.NFTs);
      return total;
    }, {totalCount: 0, NFTs: [], wallets: this.model.wallets});
    $('nav[aria-label="Page navigation"] .pager li').removeClass("disabled");
  }

  @action
  pageChanged(current) {
    this.currentPage = current;
    $('nav[aria-label="Page navigation"] .pager li').addClass("disabled");
    Ember.run.debounce(this, this.changePagination, current, 1000, true);
  }

  // Manage Metamask actions
  get isWallet() {
    return this.thetaSdk.currentAccount || this.thetaSdk.currentGroup;
  }

  @action
  copySummaryToClipBoard(label, inputId) {
    this.utils.copyToClipboard(
      inputId,
      this.intl.t('clip.succesfully', {label: label})
    );
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
  async metamask() {
    try {
      const account = await this.metamask_connect();
      const sell_contract = new window.web3.eth.Contract(this.abi.ThetaboardDirectSell, "0xfbea9043f909b37a83ee9158b6698df8bec98553");
      const nft_sell = await sell_contract.methods.purchaseToken("0x7500CBde64B1bf956351Aa4ea2fa4eE1467a3428").send({
        value: window.web3.utils.toWei("20"),
        from: account
      });
      return this.utils.successNotify(this.intl.t('notif.success_nft'));
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }
}
