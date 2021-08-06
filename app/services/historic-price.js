import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class HistoricPriceService extends Service {
  @tracked historicPrice;

  @service store;

  @action
  initialize(historicPrice) {
    this.historicPrice = historicPrice;
  }
}
