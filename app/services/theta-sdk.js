import Service, {inject as service} from '@ember/service';
import * as thetajs from '@thetalabs/theta-js';
import {tracked} from '@glimmer/tracking';
import {htmlSafe} from '@ember/template';

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
    // this.currentAccountDomainList = [];
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
  @tracked totalStake;
  @tracked totalTfuelStake;
  @tracked cachedReverseName = {};

  @service envManager;
  @service guardian;
  @service utils;
  @service store;
  @service currency;
  @service metamask;
  @service domain;

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
    const tfuelPrice = this.prices.tfuel ? this.prices.tfuel.price : 0;
    const thetaPrice = this.prices.theta ? this.prices.theta.price : 0;
    const tdropPrice = this.prices.tdrop ? this.prices.tdrop.price : 0;

    return Ember.A(this.wallets.map((wallet) => {
      let walletItem = this.store.createRecord('walletItem', wallet);
      if (wallet.currency === 'theta') {
        walletItem.market_price = thetaPrice;
      } else if (wallet.currency === 'tfuel') {
        walletItem.market_price = tfuelPrice;
      } else if (wallet.currency === 'tdrop') {
        walletItem.market_price = tdropPrice;
      }
      return walletItem;
    }));
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

  async getPrices(currency = 'USD', start_date = null, end_date = null) {
    let api_call = `/api/explorer/prices?currency=${currency}`;
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
      '/api/explorer/totalStake' + this.envManager.config.queryParams
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
      '/api/explorer/totalTfuelStake' + this.envManager.config.queryParams
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
    let wallets = { wallets: [] };
    //type: group or wallet
    //object: Either the group or the wallet
    if (type == 'wallet') {
      const walletInfo = await fetch(
        '/api/explorer/wallet-info/' + object[0] + this.envManager.config.queryParams
      );
      if (walletInfo.status == 200) {
        wallets = await walletInfo.json();
      }
      // this.wallets = wallets.wallets;
      this.currentAccount = object;
      this.currentGroup = null;
      // return wallets;
    } else if (type == 'group') {
      let uuid = '';
      if (typeof object == 'string') {
        uuid = object;
      } else {
        uuid = object.uuid;
      }

      const goupInfo = await fetch(
        '/api/explorer/group-info/' + uuid + this.envManager.config.queryParams
      );
      if (goupInfo.status == 200) {
        wallets = await goupInfo.json();
      }
      // this.wallets = wallets.wallets;
      this.currentAccount = null;
      this.currentGroup = uuid;
      // return wallets;
    }

    await this.metamask.initMeta();

    return await this.setWalletsReverseName(wallets.wallets);
  }

  async getTransactions(wallets, current = 1, limit_number = 40) {
    const transactions = await this.store.query('transactionHistory', {
      pageNumber: current,
      limitNumber: limit_number,
      wallets: wallets,
    });
    await this.metamask.initMeta();
    return await this.setTransactionsReverseName(transactions);
  }

  uniqueByKey(array, key) {
    const formattedArray = array.filter((n) => n[key]).map((x) => [x[key], x]);
    const map = new Map(formattedArray);
    const [firstKey] = map.keys();
    if (firstKey) {
      const values = map.keys();
      return [...values];
    }
    return [];
  }

  arrayUnique(array) {
    let a = array.concat();
    for (var i = 0; i < a.length; ++i) {
      for (var j = i + 1; j < a.length; ++j) {
        if (a[i] === a[j]) a.splice(j--, 1);
      }
    }
    return a;
  }

  async setWalletsReverseName(wallets) {
    const walletsResolved = [];
    let walletAddresses = this.uniqueByKey(wallets.toArray(), 'wallet_address');
    let nodeAddresses = this.uniqueByKey(wallets.toArray(), 'node_address');
    const uniqueAddresses = this.arrayUnique(walletAddresses.concat(nodeAddresses));
    const domainNames = await this.domain.getReverseNames(uniqueAddresses);
    for (const wallet of wallets.toArray()) {
      if (wallet.wallet_address) {
        wallet.wallet_tns = domainNames[wallet.wallet_address];
      }
      if (wallet.node_address) {
        wallet.node_address_tns = domainNames[wallet.node_address];
      }
      walletsResolved.push(wallet);
    }
    this.wallets = walletsResolved;
    return walletsResolved;
  }

  async setTransactionsReverseName(transactions) {
    const transactionsResolved = [];
    let toAddresses = this.uniqueByKey(transactions, 'toAddress');
    let fromAddresses = this.uniqueByKey(transactions, 'fromAddress');
    const uniqueAddresses = this.arrayUnique(toAddresses.concat(fromAddresses));
    const domainNames = await this.domain.getReverseNames(uniqueAddresses);
    for (const transaction of transactions.toArray()) {
      if (transaction.toAddress) {
        transaction.toAddressName = domainNames[transaction.toAddress];
      }
      if (transaction.fromAddress) {
        transaction.fromAddressName = domainNames[transaction.fromAddress];
      }
      transactionsResolved.push(transaction);
    }
    this.transactions = transactions;
    this.pagination = transactions.meta.pagination;
    return transactionsResolved;
  }

  async getAllCoinbases(wallets) {
    this.coinbases = await this.store.query('coinbaseHistory', {
      wallets: wallets,
    });
    return this.coinbases;
  }

  async getGuardianStatus() {
    const response = await fetch(
      '/api/guardian/status' + this.envManager.config.queryParams
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
    return await fetch('/api/guardian/logs' + this.envManager.config.queryParams)
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
      '/api/guardian/summary' + this.envManager.config.queryParams
    );
    return await response.json();
  }

  async getGuardianLatestSnapshot() {
    const response = await fetch(
      '/api/guardian/latest_snapshot' + this.envManager.config.queryParams
    );
    return await response.json();
  }

  async startGuardian() {
    const response = await fetch(
      '/api/guardian/start' + this.envManager.config.queryParams
    );
    return await response.json();
  }

  async stopGuardian() {
    const response = await fetch(
      '/api/guardian/stop' + this.envManager.config.queryParams
    );
    return await response.json();
  }

  async updateGuardian() {
    const response = await fetch(
      '/api/guardian/update' + this.envManager.config.queryParams
    );
    return await response.json();
  }

  async downloadLatestGuardianSnapshot() {
    const self = this;
    return await fetch('/api/guardian/download_snapshot' + this.envManager.config.queryParams)
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
