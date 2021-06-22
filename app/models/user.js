import Model, { attr, hasMany } from '@ember-data/model';
import { computed } from '@ember/object';

export default class UserModel extends Model {
  @attr('string') email;
  @attr('string') password;
  @attr('boolean') isVerified;
  @hasMany('tfuelstake') tfuelstakes;
  @hasMany('wallet') wallets;

  @computed('isVerified')
  get notVerified() {
    return !this.isVerified;
  }
}
