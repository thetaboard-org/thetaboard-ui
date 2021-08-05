import Model, { attr } from '@ember-data/model';

export default class LocaleModel extends Model {
  @attr('string') value;
}
