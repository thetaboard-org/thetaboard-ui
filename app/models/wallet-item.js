import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class walletItemModel extends Model {
  @attr('string') currency;
  @attr('string') type;
  @attr('string') wallet_address;
  @attr('string') node_address;
  @attr('number') market_price;
  @attr('number') amount;

  @computed('amount,market_price')
  get value() {
    return this.amount * this.market_price;
  }
}
