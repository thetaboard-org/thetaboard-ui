import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {action, computed} from '@ember/object';
import {tracked} from '@glimmer/tracking';


export default class NFTController extends Controller {
  @service('theta-sdk') thetaSdk;
  @service utils;
  @service intl;
  @service abi;

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

  @action
  setQueryParam(walletAddress) {
    this.transitionToRoute({ queryParams: { wa: walletAddress } });
  }
}
