import Service from '@ember/service';
import {inject as service} from '@ember/service';
import ThetaWalletConnect from '@thetalabs/theta-wallet-connect';
import * as thetajs from '@thetalabs/theta-js';
import {tracked} from '@glimmer/tracking';
import {htmlSafe} from '@ember/template';
import {cancel} from '@ember/runloop';
import {later} from '@ember/runloop';

export default class ThetaSdkService extends Service {
  constructor(...args) {
    super(...args);
    this.downloadProgress = '';
    this.wallets = [];
    this.groups = [];
    this.transactions = [];
    this.coinbases = [];
    this.pagination = {};
    this.currentAccount = '';
    this.currentGroup = '';
    this.currentAccountDomainList = [];
    this.prices = {
      theta: {price: 0, market_cap: 0, volume_24h: 0},
      tfuel: {
        price: 0,
        market_cap: 0,
        volume_24h: 0,
        total_supply: 1,
      },
    };
    this.totalStake = {totalAmount: '0', percent: 0};
    this.totalTfuelStake = {totalAmount: '0', percent: 0};
    this.initialize();
  }

  @tracked downloadProgress;
  @tracked wallets;
  @tracked groups;
  @tracked currentAccount;
  @tracked currentGroup;
  @tracked prices;
  @tracked pagination;
  @tracked transactions;
  @tracked coinbases;
  @tracked currentAccountDomainList
  @tracked totalStake
  @tracked totalTfuelStake

  @service envManager;
  @service guardian;
  @service contract;
  @service offer;
  @service utils;
  @service store;
  @service currency;

  get guardianWallets() {
    if (this.walletList.length) {
      return this.walletList.filter((x) => x.type === 'Guardian Node');
    }
    return [];
  }

  async initialize() {
    await this.getPrices(this.currency.currentCurrency.name);
    await this.getTotalStake();
    await this.getTotalTfuelStake();
  }

  get eliteEdgeNodeWallets() {
    if (this.walletList.length) {
      return this.walletList.filter((x) => x.type === 'Elite Edge Node');
    }
    return [];
  }

  get walletList() {
    let walletList = Ember.A();
    const tfuelPrice = this.prices.tfuel.price;
    const thetaPrice = this.prices.theta.price;
    this.wallets.forEach((wallet) => {
      let walletItem = this.store.createRecord('walletItem', wallet);
      if (wallet.currency == 'theta') {
        walletItem.market_price = thetaPrice;
      } else if (wallet.currency == 'tfuel') {
        walletItem.market_price = tfuelPrice;
      }
      walletList.pushObject(walletItem);
    });
    return walletList;
  }

  get walletTotal() {
    let wallets = this.walletList;
    if (wallets.length == 0) return 0;
    return wallets.reduce(function (previousValue, item) {
      return previousValue + item.value;
    }, 0);
  }

  get guardianCoinbases() {
    return this.coinbases.filter((x) => {
      return x.type === 'gn';
    });
  }

  get eliteEdgeNodeCoinbases() {
    return this.coinbases.filter((x) => {
      return x.type === 'en';
    });
  }

  get tfuelAPR() {
    if (this.totalTfuelStake && this.prices.tfuel && this.prices.tfuel.total_supply && this.prices.secPerBlock) {
      //test tfuel stake in %
      const totalStake = Number(this.totalTfuelStake.totalAmount) || 1;
      const testStake = 100000;
      const testPercentStaked = testStake / totalStake;

      //how many blocks per year
      const yearInSeconds = 31536000;
      const BlockPerYear = yearInSeconds / this.prices.secPerBlock;

      //Tfuel distributed per year
      // 38 TFUEL per block, corresponds to about 4% initial annual inflation rate.
      const totalTfuelPerYear = BlockPerYear * 38;

      //tfuel received per year
      const testTfuelPerYear = totalTfuelPerYear * testPercentStaked;

      //APR
      return (testTfuelPerYear / testStake) * 100;
    }
    return false;
  }

  async getThetaAccount() {
    try {
      let provider = new thetajs.providers.HttpProvider(
        this.envManager.config.thetaNetwork
      );
      await ThetaWalletConnect.connect();
      const timeoutId = later(
        this,
        function () {
          this.showDownloadExtensionPopup();
        },
        4000
      );
      const account = await ThetaWalletConnect.requestAccounts();
      return this.setupWalletAddress(account, timeoutId);
    } catch (error) {
      console.log(error);
      // this.utils.errorNotify(error.message);
    }
  }

  async connectWallet() {
    $('.connect-wallet-offer-button').addClass("disabled");
    $('.connect-wallet-button').addClass("disabled");
    const address = await this.getThetaAccount();
    await this.getWalletsInfo('wallet', address);
    await this.offer.setupOffers(address);
    $('.connect-wallet-offer-button').removeClass("disabled");
    $('.connect-wallet-button').removeClass("disabled");
    return this.contract.domainName ? this.contract.domainName : address[0];
  }

  setupWalletAddress(account, timeoutId) {
    cancel(timeoutId);
    this.currentAccount = account;
    $('#downloadThetaExtension').modal('hide');
    return account;
  }

  showDownloadExtensionPopup() {
    $('#downloadThetaExtension').modal('show');
  }

  async getPrices(currency = 'USD', start_date = null, end_date = null) {
    let api_call = `/explorer/prices?currency=${currency}`;
    if (start_date && end_date) {
      api_call += `&start_date=${start_date}&end_date=${end_date}`
    }
    api_call += this.envManager.config.queryParams;
    const getPrices = await fetch(api_call);
    this.prices = await getPrices.json();
    return this.prices;
  }

  async getTotalStake() {
    let totalStake = {totalAmount: '0', totalNodes: 0, percent: 0};
    const getStake = await fetch(
      '/explorer/totalStake' + this.envManager.config.queryParams
    );
    if (getStake.status == 200) {
      totalStake = await getStake.json();
    }
    totalStake.totalAmount = Number(
      thetajs.utils.fromWei(totalStake.totalAmount)
    );
    totalStake.percent = totalStake.totalAmount / 10000000;
    this.totalStake = totalStake;
    return totalStake;
  }

  async getTotalTfuelStake() {
    let totalTfuelStake = {totalAmount: '0', percent: 0};
    const getTfuelStake = await fetch(
      '/explorer/totalTfuelStake' + this.envManager.config.queryParams
    );
    if (getTfuelStake.status == 200) {
      totalTfuelStake = await getTfuelStake.json();
    }
    totalTfuelStake.totalAmount = Number(
      thetajs.utils.fromWei(totalTfuelStake.totalAmount)
    );
    const totalSupply = this.prices.tfuel ? this.prices.tfuel.total_supply : 1;
    totalTfuelStake.percent = (totalTfuelStake.totalAmount / totalSupply) * 100;
    this.totalTfuelStake = totalTfuelStake;
    return totalTfuelStake;
  }

  async getWalletsInfo(type, object) {
    //type: group or wallet
    //object: Either the group or the wallet
    if (type == 'wallet') {
      let wallets = {wallets: []};
      this.contract.domainName = '';
      const walletInfo = await fetch(
        '/explorer/wallet-info/' + object[0] + this.envManager.config.queryParams
      );
      if (walletInfo.status == 200) {
        wallets = await walletInfo.json();
      }
      if (object.length) {
        this.currentAccountDomainList = await this.contract.getAddressToNames(
          object[0]
        );
        if (this.currentAccountDomainList && this.currentAccountDomainList.length) {
          this.contract.domainName = this.currentAccountDomainList[0];
        }
      } else {
        this.currentAccountDomainList = [];
      }
      this.wallets = wallets.wallets;
      this.currentAccount = object;
      this.currentGroup = null;
      return wallets;
    } else if (type == 'group') {
      let wallets = {wallets: []};
      this.contract.domainName = '';
      let uuid = '';
      if (typeof object == 'string') {
        uuid = object;
      } else {
        uuid = object.uuid;
      }

      const goupInfo = await fetch(
        '/explorer/group-info/' + uuid + this.envManager.config.queryParams
      );
      if (goupInfo.status == 200) {
        wallets = await goupInfo.json();
      }
      this.currentAccountDomainList = [];
      this.wallets = wallets.wallets;
      this.currentAccount = null;
      this.currentGroup = uuid;
      return wallets;
    }
  }

  async getTransactions(wallets, current = 1, limit_number = 40) {
    this.transactions = await this.store.query('transactionHistory', {
      pageNumber: current,
      limitNumber: limit_number,
      wallets: wallets,
    });
    this.pagination = this.transactions.meta.pagination;
    return this.transactions;
  }

  async getAllCoinbases(wallets) {
    this.coinbases = await this.store.query('coinbaseHistory', {
      wallets: wallets
    });
    return this.coinbases;
  }

  async getGuardianStatus() {
    const response = await fetch(
      '/guardian/status' + this.envManager.config.queryParams
    );
    return await response.json();
  }

  async readableStreamDownload(response) {
    const self = this;
    const reader = response.body.getReader();
    let textDecoder = new TextDecoder();
    let result = [];
    return new ReadableStream({
      start(controller) {
        return pump();

        function pump() {
          return reader.read().then(({done, value}) => {
            // When no more data needs to be consumed, close the stream
            if (done) {
              controller.close();
              self.downloadProgress = '';
              return result;
            }
            // Enqueue the next data chunk into our target stream
            controller.enqueue(value);
            let decodedString = textDecoder.decode(value);
            result.push(decodedString);
            const percentReceived = decodedString.split('%')[0].substr(-3);
            if (percentReceived != '...') {
              if (
                percentReceived != '050' &&
                Number(percentReceived) > self.downloadProgress &&
                Number(percentReceived) < 100
              ) {
                self.downloadProgress = percentReceived;
              }
            }
            return pump();
          });
        }
      },
    });
  }

  async readableStream(response) {
    const reader = response.body.getReader();
    let result = '';
    return new ReadableStream({
      start(controller) {
        return pump();

        function pump() {
          return reader.read().then(({done, value}) => {
            // When no more data needs to be consumed, close the stream
            if (done) {
              controller.close();
              return result;
            }
            // Enqueue the next data chunk into our target stream
            controller.enqueue(value);
            result += value;
            return pump();
          });
        }
      },
    });
  }

  async getGuardianLogs() {
    const self = this;
    return await fetch('/guardian/logs' + this.envManager.config.queryParams)
      .then((response) => self.readableStream(response))
      .then((stream) => new Response(stream))
      .then((response) => response.blob())
      .then((blob) => {
        return blob.text().then((text) => {
          return {logs: htmlSafe(text.split('\n').join('<br/>'))};
        });
      })
      .catch((err) => console.error(err));
  }

  async getGuardianSummary() {
    const response = await fetch(
      '/guardian/summary' + this.envManager.config.queryParams
    );
    return await response.json();
  }

  async getGuardianLatestSnapshot() {
    const response = await fetch(
      '/guardian/latest_snapshot' + this.envManager.config.queryParams
    );
    return await response.json();
  }

  async startGuardian() {
    const response = await fetch(
      '/guardian/start' + this.envManager.config.queryParams
    );
    return await response.json();
  }

  async stopGuardian() {
    const response = await fetch(
      '/guardian/stop' + this.envManager.config.queryParams
    );
    return await response.json();
  }

  async updateGuardian() {
    const response = await fetch(
      '/guardian/update' + this.envManager.config.queryParams
    );
    return await response.json();
  }

  async downloadLatestGuardianSnapshot() {
    const self = this;
    return await fetch('/guardian/download_snapshot' + this.envManager.config.queryParams)
      .then((response) => self.readableStreamDownload(response))
      .then((stream) => {
        self.utils.successNotify('Downloading...');
        return new Response(stream);
      })
      .then((response) => response.blob())
      .then((blob) => {
        return blob.text().then((logs) => {
          self.utils.successNotify('Download completed. You can now start your Guardian Node');
          return {logs: htmlSafe(logs.split('\n').join('<br/>'))};
        });
      })
      .catch((err) => console.error(err));
  }
}
