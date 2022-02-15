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
    // check if already connected
    const metamaskProvider = await detectEthereumProvider();
    if (!metamaskProvider) {
      // default provider
      this.provider = new ethers.providers.JsonRpcProvider("https://eth-rpc-api.thetatoken.org/rpc");
      return this.isInstalled = false;
    } else {
      this.provider = new ethers.providers.Web3Provider(metamaskProvider);
    }

    this.isInstalled = true;
    if (parseInt(ethereum.chainId) !== 361) {
      return this.isThetaBlockchain = false;
    }
    this.isThetaBlockchain = true;
    window.web3 = new Web3(window.web3.currentProvider);
    const accounts = await window.web3.eth.getAccounts();
    if (accounts.length === 0) {
      return this.isConnected = false;
    }
    this.isConnected = true;
    this.currentAccount = accounts[0];
    this.setCurrentName();
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
    this.isInstalled = null;
    this.isConnected = false;
    this.currentAccount = null;
    this.currentName = null;
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
