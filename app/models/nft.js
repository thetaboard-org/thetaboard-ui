import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { computed } from '@ember/object';

export default class NftModel extends Model {
  @attr('string') smallDescription;
  @attr('string') description;
  @attr('string') name;
  @attr('string') image;
  @attr('string') nftContractId;
  @attr('string') nftSellController;
  @attr('number') editionNumber;
  @attr('number') price;
  @attr('string', {defaultValue: 'open'}) type;
  @attr('number') dropId;
  @attr('number') artistId;
  @belongsTo('artist') artist;
  @belongsTo('drop') drop;
  @hasMany('nftAsset', {
    async: false
  }) nftAssets;

  @computed('type')
  get isOpenEdition() {
    return this.type === 'open';
  }

  @computed('type')
  get isLimitedEdition() {
    return this.type === 'limited';
  }

  @computed('type')
  get isAuction() {
    return this.type === 'auction';
  }

  @computed('type')
  get isLimitedOrAuction() {
    return ['limited', 'auction'].includes(this.type);
  }

  get possibleTypes() {
    return ['open', 'limited', 'auction']
  }

}
