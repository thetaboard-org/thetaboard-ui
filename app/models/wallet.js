import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class WalletModel extends Model {
  @attr('string') address;
  @attr('boolean', { defaultValue: false }) isDefault;
  @attr('boolean', { defaultValue: false }) isSelected;
  @attr('string') name;
  @belongsTo('user') user;
  @hasMany('group') groups;
}
