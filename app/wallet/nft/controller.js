import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {action} from '@ember/object';

export default class NFTController extends Controller {
  @service('theta-sdk') thetaSdk;
  @service utils;
  @service intl;
  @service('abi') abi;

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
  async metamask() {
    try {
      if (typeof ethereum === 'undefined' || !ethereum.isConnected()) {
        return this.utils.errorNotify(this.intl.t('notif.no_metamask'));
      } else if (parseInt(ethereum.chainId) !== 361) {
        return this.utils.errorNotify(this.intl.t('notif.not_theta_blockchain'));
      } else {
        window.web3 = new Web3(window.web3.currentProvider);
        const sell_contract = new window.web3.eth.Contract(this.abi.ThetaboardDirectSell, "0xfbea9043f909b37a83ee9158b6698df8bec98553");
        const accounts = await ethereum.request({method: 'eth_requestAccounts'});
        const account = accounts[0];
        const nft_sell = await sell_contract.methods.purchaseToken("0x7500CBde64B1bf956351Aa4ea2fa4eE1467a3428").send({
          value: window.web3.utils.toWei("20"),
          from: account
        });
        return this.utils.successNotify(this.intl.t('notif.success_nft'));
      }
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }
}
