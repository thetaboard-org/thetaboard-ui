import Model, { attr, belongsTo } from '@ember-data/model';
import { computed } from '@ember/object';

export default class TfuelstakeModel extends Model {
  @attr('string') walletAddress;
  @attr('number') stakeAmount;
  @attr('string', { defaultValue: 'staking' }) status;
  @attr('date') createdAt;
  @belongsTo('user') user;

  @computed('status')
  get isStaking() {
    return this.status == 'staking';
  }

  @computed('status')
  get isStaked() {
    return this.status == 'staked';
  }

  @computed('status')
  get isUnstaking() {
    return this.status == 'unstaking';
  }

  @computed('status')
  get isUnstaked() {
    return this.status == 'unstaked';
  }
}
