import Controller from '@ember/controller';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { sort } from '@ember/object/computed';

export default class AffiliateController extends Controller {
  @tracked modalSummary;
  @service utils;
  @service intl;
  @service thetaSdk;

  get edgeNodeList() {
    return this.model.affiliatePublicEdgeNodes;
  }

  get affiliate() {
    return this.model.affiliate;
  }

  @sort('edgeNodeList', function (a, b) {
    if (a['stakeAmount'] > b['stakeAmount']) {
      return 1;
    } else if (a['stakeAmount'] < b['stakeAmount']) {
      return -1;
    }

    return 0;
  })
  edgeNodeListSorted;

  @action
  setupModalSummary(summary) {
    this.modalSummary = summary;
  }

  @action
  copySummaryToClipBoard(label, inputId) {
    this.utils.copyToClipboard(
      inputId,
      this.intl.t('clip.succesfully', {label: label})
    );
  }
}
