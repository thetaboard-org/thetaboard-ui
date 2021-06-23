import Model, { attr, belongsTo } from '@ember-data/model';

export default class TfuelstakeModel extends Model {
  @attr('string') address;
  @attr('boolean', { defaultValue: false }) isDefault;
  @attr('string') name;
  @belongsTo('user') user;
}
