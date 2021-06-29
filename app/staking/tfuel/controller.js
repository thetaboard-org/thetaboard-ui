import Controller from '@ember/controller';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class TfuelStakingController extends Controller {
  @tracked modalSummary;
  @service utils;

  get edgeNodeList() {
    return this.model.publicEdgeNodes;
  }

  @action
  setupModalSummary(edgeNodeSummary) {
    this.modalSummary = edgeNodeSummary;
  }

  @action
  copySummaryToClipBoard(label, summary) {
    this.utils.copyToClipboard(
      summary,
      `${label} was successfully copied to your clipboad`
    );
  }
}
