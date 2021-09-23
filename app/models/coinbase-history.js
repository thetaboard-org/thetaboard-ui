import Model, { attr } from '@ember-data/model';

export default class CoinbaseHistoryModel extends Model {
  @attr('number') tfuel
  @attr('string') type // Can be 'en' or 'gn'
  @attr('string') timeScale // Can be last_day, last_week, last_month, last_six_months
  @attr('string') toAddress
  @attr('number') value
  @attr('number') tfuelPrice
  @attr('number') count
}
