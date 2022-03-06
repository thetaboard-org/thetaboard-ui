import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {action, computed} from '@ember/object';
import {tracked} from '@glimmer/tracking';


export default class NFTController extends Controller {
  @service('theta-sdk') thetaSdk;
  @service utils;
  @service intl;
  @service abi;
  @service metamask;

  // Manage pages
  @tracked currentPage = 1;

  // Manage facets
  @tracked onlyTNS = false;

  @computed('model.totalCount')
  get totalPageNumber() {
    return Math.ceil(this.model.totalCount / 12);
  }

  async changePagination(current) {
    const filters = [`pageNumber=${current}`];
    if (this.onlyTNS) {
      filters.push(`contractAddr=${this.abi.tnsRegistrarContractAddr}`);
    }
    this.model = await this.model.wallets.reduce(async (total, wallet) => {
      const fetched = await fetch(`/api/explorer/wallet-nft/${wallet}?${filters.join("&")}`);
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
  async buyMetamask() {
    try {
      if (typeof ethereum === 'undefined' || !ethereum.isConnected()) {
        return this.utils.errorNotify(this.intl.t('notif.no_metamask'));
      } else if (parseInt(ethereum.chainId) !== 361) {
        return this.utils.errorNotify(this.intl.t('notif.not_theta_blockchain'));
      } else {
        window.web3 = new Web3(window.ethereum);
        const accounts = await ethereum.request({method: 'eth_requestAccounts'});
        const account = accounts[0];
        const sell_contract = new window.web3.eth.Contract(this.abi.ThetaboardDirectSell, "0x0d2bD4F9b8966D026a07D9Dc97C379AAdD64C912");
        await sell_contract.methods.purchaseToken("0x956156267de1de8896E9cBE14BF59C1BCA0b1938").send({
          value: window.web3.utils.toWei(String(20)),
          from: account
        });
        return this.utils.successNotify(this.intl.t('notif.success_nft'));
      }
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  @action
  copySummaryToClipBoard(label, inputId) {
    this.utils.copyToClipboard(
      inputId,
      this.intl.t('clip.succesfully', {label: label})
    );
  }

  @action
  setQueryParam(value, type) {
    if (type == 'group') {
      this.transitionToRoute({queryParams: {group: value, wa: null}});
    } else {
      this.transitionToRoute({queryParams: {wa: value, group: null}});
    }
  }

  @action
  async toggleTNS() {
    this.onlyTNS = !this.onlyTNS;
    this.currentPage = 1;
    await this.changePagination(this.currentPage);
  }
}
