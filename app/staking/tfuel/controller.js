import Controller from '@ember/controller';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';

export default class TfuelStakingController extends Controller {
  @service utils;

  @action
  copySummaryToClipBoard(label, summary) {
    this.utils.copyToClipboard(
      summary,
      `${label} was successfully copied to your clipboad`
    );
  }
}
