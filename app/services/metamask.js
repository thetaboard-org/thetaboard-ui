import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import detectEthereumProvider from '@metamask/detect-provider';

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
  @tracked currentAccount;
  @tracked provider;
  @tracked networkId;

  initMeta() {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('chainChanged', this.handleChainChanged);
      window.ethereum.on('accountsChanged', this.handleAccountsChanged);
    }
  }

  @action
  disconnect(hideNotif) {
    this.isInstalled = null;
    this.isConnected = null;
    this.currentAccount = null;
    if (hideNotif) return;
    this.utils.successNotify(this.intl.t('domain.disconnected_from_metmask'));
  }

  @action
  async connect() {
    try {
      this.provider = await detectEthereumProvider();
      if (this.provider) {
        this.isInstalled = true;
        if (this.provider !== window.ethereum) {
          return this.utils.errorNotify(this.intl.t('domain.multiple_wallet'));
        }
        this.networkId = parseInt(await window.ethereum.request({ method: 'eth_chainId' }));
        if (this.networkId !== 365) {
          return this.utils.errorNotify(this.intl.t('domain.select_theta'));
        }
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
        return this.handleAccountsChanged(accounts);
      } else {
        return this.utils.errorNotify(this.intl.t('domain.install_metamask'));
      }
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  @action
  handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      this.disconnect();
      return this.utils.errorNotify(this.intl.t('domain.connect_to_metamask'));
    } else if (accounts[0] !== this.currentAccount) {
      this.isConnected = true;
      this.currentAccount = accounts[0];
      this.domain.initDomain();
      this.utils.successNotify(this.intl.t('domain.connect_to') + this.currentAccount);
    }
  }

  @action
  async handleChainChanged(networkId) {
    this.disconnect(true);
    if (parseInt(networkId) !== 365) {
      return this.utils.errorNotify(this.intl.t('domain.select_theta'));
    }
    return await this.connect();
  }
}
