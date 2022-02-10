import Service from '@ember/service';
import {inject as service} from '@ember/service';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import detectEthereumProvider from '@metamask/detect-provider';
import {ethers} from 'ethers';

export default class MetamaskService extends Service {
  constructor() {
    super(...arguments);
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

  async initMeta() {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('chainChanged', this.handleChainChanged);
      window.ethereum.on('accountsChanged', this.handleAccountsChanged);
    }
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
  }

  @action
  disconnect(hideNotif) {
    this.isInstalled = null;
    this.isConnected = null;
    this.currentAccount = null;
    this.currentName = null;
    if (hideNotif == true) return;
    this.utils.successNotify(this.intl.t('domain.disconnected_from_metmask'));
  }

  @action
  async connect(silent) {
    try {
      this.provider = await detectEthereumProvider();
      if (this.provider) {
        this.isInstalled = true;
        if (this.provider !== window.ethereum) {
          return this.utils.errorNotify(this.intl.t('domain.multiple_wallet'));
        }
        this.networkId = parseInt(await window.ethereum.request({method: 'eth_chainId'}));
        if (this.networkId !== 361) {
          return this.utils.errorNotify(this.intl.t('domain.select_theta'));
        }
        const etherProvider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = etherProvider.getSigner();
        const address = await signer.getAddress();
        return await this.handleAccountsChanged([address], silent == true);
      } else {
        return this.utils.errorNotify(this.intl.t('domain.install_metamask'));
      }
    } catch (e) {
      if (e.code == -32002) {
        return this.utils.errorNotify(this.intl.t('domain.error.check_metamask'));
      }
      if (e.operation == 'getAddress') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        this.utils.errorNotify(this.intl.t('domain.error.check_metamask'));
        await provider.send("eth_requestAccounts", []);
        return;
      }
      return this.utils.errorNotify(e.message);
    }
  }

  @action
  async handleAccountsChanged(accounts, silent) {
    if (accounts.length === 0) {
      this.disconnect();
      return this.utils.errorNotify(this.intl.t('domain.connect_to_metamask'));
    } else if (accounts[0] !== this.currentAccount) {
      this.isConnected = true;
      const etherProvider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = etherProvider.getSigner();
      const address = await signer.getAddress();
      this.currentAccount = address;
      if (!silent) {
        this.utils.successNotify(this.intl.t('domain.connect_to') + this.currentAccount);
      }
      const reverseName = await this.domain.getReverseName(this.currentAccount);
      if (reverseName && reverseName.domain) {
        this.currentName = reverseName.domain;
      } else {
        this.currentName = null;
      }
      return address;
    }
  }

  @action
  async handleChainChanged(networkId) {
    this.disconnect(true);
    if (parseInt(networkId) !== 361) {
      this.isThetaBlockchain = false;
      return this.utils.errorNotify(this.intl.t('domain.select_theta'));
    }
    return await this.connect();
  }
}