import Model, { attr } from '@ember-data/model';

export default class CurrencyModel extends Model {
  @attr('string') value;
}
