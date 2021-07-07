import Controller from '@ember/controller';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class TfuelStakingController extends Controller {
  @tracked modalSummary;
  @service utils;
  @service thetaSdk;

  get edgeNodeList() {
    return this.model.publicEdgeNodes;
  }

  @action
  setupModalSummary(summary) {
    this.modalSummary = summary;
  }

  @action
  copySummaryToClipBoard(label, inputId) {
    this.utils.copyToClipboard(
      inputId,
      `${label} was successfully copied to your clipboad`
    );
  }
}
