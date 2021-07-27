import Model, { attr, hasMany } from '@ember-data/model';
import { computed } from '@ember/object';

export default class UserModel extends Model {
  @attr('string') email;
  @attr('string') password;
  @attr('boolean') isVerified;
  @attr('string', { defaultValue: 'User' }) scope;
  @hasMany('tfuelstake') tfuelstakes;
  @hasMany('wallet') wallets;
  @hasMany('group') groups;
  @hasMany('affiliate') affiliates;

  @computed('isVerified')
  get notVerified() {
    return !this.isVerified;
  }
}
