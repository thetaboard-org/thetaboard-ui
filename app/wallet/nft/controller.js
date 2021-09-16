import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {action} from '@ember/object';

export default class NFTController extends Controller {
  @service('theta-sdk') thetaSdk;
  @service utils;
  @service intl;


  get isWallet() {
    return this.thetaSdk.currentAccount || this.thetaSdk.currentGroup
  }

  @action
  copySummaryToClipBoard(label, inputId) {
    this.utils.copyToClipboard(
      inputId,
      this.intl.t('clip.succesfully', {label: label})
    );
  }
}
