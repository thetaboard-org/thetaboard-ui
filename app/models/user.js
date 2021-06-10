import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class UserModel extends Model {
  @attr('string') email;
  @attr('string') password;
  @attr('boolean') isVerified;

  @computed('isVerified')
  get notVerified() {
    return !this.isVerified;
  }
}
