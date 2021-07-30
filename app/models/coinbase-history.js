import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class CoinbaseHistoryModel extends Model {
  @attr('number') tfuel
  @attr('number') type
  @attr('string') toAddress
  @attr('number') value
  @attr('number') tfuelPrice
  @attr('date') timestamp
}