import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {action, computed} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {debounce} from '@ember/runloop';


export default class NFTController extends Controller {
  @service('theta-sdk') thetaSdk;
  @service utils;
  @service intl;
  @service abi;
  @service metamask;

  // Manage pages
  @tracked currentPage = 1;

  // Manage facets
  @tracked overallFilter = "all";
  overallFiltersValues = ["all", "offers", "offered"];

  // Search Options
  @tracked search = '';
  @tracked selectedArtists = [];
  @tracked selectedDrops = [];
  @tracked selectedCategories = [];
  @tracked currentPageNumber = 1;

  get artists() {
    return this.model.facets.artists;
  }

  get drops() {
    return this.model.facets.drops;
  }

  get categories() {
    return this.model.facets.categories;
  }

  @computed('model.totalCount')
  get totalPageNumber() {
    return Math.ceil(this.model.totalCount / 12);
  }

  async refreshNFTs() {

  }


  async changePagination() {
    const filters = [`pageNumber=${this.currentPage}`];
    let apiPath = `/api/explorer/wallet-nft`;
    if (this.overallFilter === "offered") {
      apiPath = `/api/explorer/wallet-nft-offers`;
    } else if (this.overallFilter === "offers") {
      filters.push(`onlyOffers=${true}`);
    } else {
      // do nothing
    }

    const artistIds = this.selectedArtists.map((x) => x.id).join(',');
    const dropsIds = this.selectedDrops.map((x) => x.id).join(',');
    const categories = this.selectedCategories.map((x) => x.id).join(',');
    const wallets = this.model.wallets.join(',');
    filters.push(`search=${this.search}`, `artist=${artistIds}`, `drop=${dropsIds}`, `category=${categories}`, `wallets=${wallets}`);
    // todo this is a hack for now. As wallets as passed as a query params
    const wallet = this.model.wallets[0];
    const fetched = await fetch(`${apiPath}/${wallet}?${filters.join("&")}`);
    const fetchedJSON = await fetched.json();
    this.set("model.totalCount", fetchedJSON.totalCount);
    this.set("model.NFTs", fetchedJSON.NFTs);
    $('nav[aria-label="Page navigation"] .pager li').removeClass("disabled");
  }

  @action
  pageChanged(current) {
    this.currentPage = current;
    $('nav[aria-label="Page navigation"] .pager li').addClass("disabled");
    debounce(this, this.changePagination, current, 1000);
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
  async toggleOverallFilter(value) {
    this.overallFilter = value;
    this.currentPage = 1;
    await this.changePagination();
  }

  @action
  async toggleOffers() {
    this.onlyOffers = !this.onlyOffers;
    this.currentPage = 1;
    await this.changePagination();
  }

  @action
  async toggleOffered() {
    this.currentPage = 1;
    const filters = [`pageNumber=${this.currentPage}`];
    const newNFTs = await this.model.wallets.reduce(async (total, wallet) => {
      const fetched = await fetch(`/api/explorer/wallet-nft-offers/${wallet}?${filters.join("&")}`);
      const fetchedJSON = await fetched.json();
      total.totalCount += fetchedJSON.totalCount;
      total.NFTs.push(...fetchedJSON.NFTs);
      return total;
    }, {totalCount: 0, NFTs: []});
    this.model.totalCount = newNFTs.totalCount;
    this.model.NFTs = newNFTs.NFTs;
  }

  @action
  async searchNFTs() {
    this.currentPage = 1
    debounce(this, this.changePagination, 500);
  }

  @action
  changeArtist(artist) {
    this.currentPageNumber = 1;
    this.selectedArtists = artist;
    this.changePagination();
    debounce(this, this.changePagination, 500);
  }

  @action
  changeDrop(drop) {
    this.currentPageNumber = 1;
    this.selectedDrops = drop;
    debounce(this, this.changePagination, 500);
  }


  @action
  changeCategory(categories) {
    this.currentPageNumber = 1;
    this.selectedCategories = categories;
    debounce(this, this.changePagination, 500);
  }

}
