import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class GroupModel extends Model {
  @attr('string') name;
  @attr('boolean', { defaultValue: false }) isDefault;
  @belongsTo('user') user;
  @hasMany('wallet') wallets;
}
