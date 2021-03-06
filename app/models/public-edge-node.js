import Model, { attr, belongsTo } from '@ember-data/model';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/template';

export default class PublicEdgeNodeModel extends Model {
  @attr('number') nodeId;
  @attr('string') summary;
  @attr('number') stakeAmount;
  @attr('number') affiliateId;
  @belongsTo('affiliate') affiliate;

  @computed('stakeAmount')
  get stakeAmountK() {
    if (this.stakeAmount) {
      return Number(this.stakeAmount / 1000).toFixed(1);;
    }
    return 0;
  }

  @computed('stakeAmount')
  get availableStake() {
    if (this.stakeAmount) {
      return 500000 - this.stakeAmount;
    }
    return 500000;
  }

  @computed('stakeAmount')
  get availableStakeK() {
    if (this.stakeAmount) {
      return Number((500000 - this.stakeAmount) / 1000).toFixed(1);
    }
    return 500;
  }

  @computed('stakeAmount')
  get percentFill() {
    if (this.stakeAmount) {
      return (this.stakeAmount / 500000) * 100;
    }
    return 0;
  }

  @computed('stakeAmount')
  get percentFillSafe() {
    if (this.stakeAmount) {
      return htmlSafe('width:' + (this.stakeAmount / 500000) * 100 + '%;');
    }
    return htmlSafe('width:0%;');
  }
}
