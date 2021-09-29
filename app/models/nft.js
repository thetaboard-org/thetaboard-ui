import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { computed } from '@ember/object';

export default class DropModel extends Model {
  @attr('string') smallDescription;
  @attr('string') description;
  @attr('string') name;
  @attr('string') image;
  @attr('string') nftContractId;
  @attr('string') nftSellController;
  @attr('number') editionNumber;
  @attr('number') price;
  @attr('string', { defaultValue: 'open' }) type;
  @belongsTo('artist') artist;
  @belongsTo('drop') drop;

  @computed('type')
  get isOpenEdition() {
    return this.type == 'open';
  }

  @computed('type')
  get isLimitedEdition() {
    return this.type == 'limited';
  }
}
