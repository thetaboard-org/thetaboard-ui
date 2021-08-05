import Ember from 'ember';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import $ from 'jquery';

export default class TransactionHistoryComponent extends Component {
  constructor(...args) {
    super(...args);
    this.account = '';
    this.group = '';
    this.wallets = [];
  }
  @service('env-manager') envManager;
  @service('theta-sdk') thetaSdk;

  async initialize() {
    if (
      this.thetaSdk.currentAccount &&
      this.thetaSdk.currentAccount[0] &&
      (this.account[0] == undefined ||
      this.thetaSdk.currentAccount[0].toLowerCase() != this.account[0].toLowerCase())
    ) {
      this.account = this.thetaSdk.currentAccount;
      this.group = '';
      this.wallets = this.thetaSdk.currentAccount;
      return await this.thetaSdk.getTransactions(this.wallets);
    } else if (
      this.thetaSdk.currentGroup &&
      this.thetaSdk.currentGroup != this.group
    ) {
      this.group = this.thetaSdk.currentGroup;
      this.account = '';
      let allWallets = this.thetaSdk.walletList.map((x) => x.wallet_address.toLowerCase());
      this.wallets = [...new Set(allWallets)];
      return await this.thetaSdk.getTransactions(this.wallets);
    }
  }

  get transactionList() {
    this.initialize();
    return this.thetaSdk.transactions;
  }

  get showPagination() {
    const pagination = this.thetaSdk.pagination;
    if (pagination && !!pagination.totalPageNumber)
      return !!pagination.totalPageNumber && !!(pagination.totalPageNumber > 1);
    return false;
  }

  get explorerEndpoint() {
    return this.envManager.config.explorerEndpoint;
  }

  async changePagination(current) {
    await this.thetaSdk.getTransactions(this.wallets, current);
    $('nav[aria-label="Page navigation"] .pager li').removeClass("disabled");
  }

  @action
   pageChanged(current) {
    $('nav[aria-label="Page navigation"] .pager li').addClass("disabled");
    Ember.run.debounce(this, this.changePagination, current, 1000, true);
  }
}
