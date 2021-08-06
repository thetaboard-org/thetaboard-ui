import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class HistoricPriceService extends Service {
  @tracked historicPrice;

  get store() {
    return getOwner(this).lookup('service:store');
  }

  @action
  initialize(historicPrice) {
    this.historicPrice = historicPrice;
  }
}
