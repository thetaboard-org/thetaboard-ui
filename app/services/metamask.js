import Service from '@ember/service';
import {inject as service} from '@ember/service';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import detectEthereumProvider from '@metamask/detect-provider';
import {ethers} from 'ethers';

export default class MetamaskService extends Service {
  constructor() {
    super(...arguments);
    this.initPromise = null;
    this.initMeta();
  }

  @service utils;
  @service intl;
  @service domain;
  @tracked isInstalled;
  @tracked isConnected;
  @tracked isThetaBlockchain;
  @tracked currentAccount;
  @tracked currentName;
  @tracked provider;
  @tracked networkId;
  @tracked etherProvider;
  @tracked balance = 0;

  initPromise = null;

  async initMeta() {
    if (!this.initPromise) {
      this.initPromise = this.getStatus();
    }
    return this.initPromise;
  }

  async getStatus() {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('chainChanged', this.handleChainChanged);
      window.ethereum.on('accountsChanged', this.handleAccountsChanged);
    }

    return await this.initProvider();
  }

  async initProvider() {
    this.balance = 0;
    // check if already connected
    const metamaskProvider = await detectEthereumProvider();
    if (!metamaskProvider) {
      // default provider
      this.provider = new ethers.providers.JsonRpcProvider("https://eth-rpc-api.thetatoken.org/rpc");
      return this.isInstalled = false;
    }
    this.isInstalled = true;
    if (parseInt(ethereum.chainId) !== 361) {
      this.provider = new ethers.providers.JsonRpcProvider("https://eth-rpc-api.thetatoken.org/rpc");
      return this.isThetaBlockchain = false;
    }
    // if metamask is on the right blockchain, then use metamask
    this.provider = new ethers.providers.Web3Provider(metamaskProvider);

    this.isThetaBlockchain = true;
    const accounts = await this.provider.send("eth_requestAccounts", []);
    if (accounts.length === 0) {
      return this.isConnected = false;
    }
    this.isConnected = true;
    this.currentAccount = accounts[0];
    this.balance = await this.getBalance();
    this.setCurrentName();
  }

  async getBalance() {
    if (!this.currentAccount) {
      return 0;
    }
    const web3 = new Web3(window.ethereum);
    const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
    const accountBalance = await ethersProvider.getBalance(this.currentAccount);
    const balance = web3.utils.fromWei(accountBalance.toString());
    return Number(balance);
  }

  async setCurrentName() {
    const reverseName = await this.domain.getReverseName(this.currentAccount);
    if (reverseName && reverseName.domain) {
      this.currentName = reverseName.domain;
    } else {
      this.currentName = null;
    }
  }

  @action
  disconnect(hideNotif) {
    this.isConnected = false;
    this.currentAccount = null;
    this.currentName = null;
    this.balance = 0;
    if (hideNotif == true) return;
    this.utils.successNotify(this.intl.t('domain.disconnected_from_metmask'));
  }

  @action
  async connect() {
    try {
      await this.initProvider();
      if (this.isConnected) {
        return this.utils.successNotify(this.intl.t('domain.connect_to') + this.currentAccount);
      } else {
        if (!this.isInstalled) {
          return this.utils.errorNotify(this.intl.t('domain.install_metamask'));
        }
        if (!this.isThetaBlockchain) {
          return this.utils.errorNotify(this.intl.t('domain.select_theta'));
        }
        //open metamask and ask to authorize connection to the page
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        this.utils.errorNotify(this.intl.t('domain.error.check_metamask'));
        await provider.send("eth_requestAccounts", []);
        return;
      }
    } catch (e) {
      console.log(e.message);
    }
  }

  @action
  async handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      this.disconnect();
      return this.utils.errorNotify(this.intl.t('domain.connect_to_metamask'));
    } else if (accounts[0] !== this.currentAccount) {
      await this.initProvider();
      if (this.isConnected) {
        this.utils.successNotify(this.intl.t('domain.connect_to') + this.currentAccount);
      }
    }
  }

  @action
  async handleChainChanged(networkId) {
    this.disconnect(true);
    if (parseInt(networkId) !== 361) {
      this.isThetaBlockchain = false;
      return this.utils.errorNotify(this.intl.t('domain.select_theta'));
    }
    await this.initProvider();
    if (this.isConnected) {
      this.utils.successNotify(this.intl.t('domain.connect_to') + this.currentAccount);
    }
  }
}
