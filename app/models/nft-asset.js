import Model, {attr, belongsTo} from '@ember-data/model';
import {computed} from '@ember/object';

export default class NftAssetModel extends Model {
  @attr('string') description;
  @attr('string') name;
  @attr('string') asset;
  @attr('string') type;
  @attr('number') nftId;
  @belongsTo('nft') nft;

  @computed('type')
  get isImage() {
    return this.type === 'image';
  }

  @computed('type')
  get isVideo() {
    return this.type === 'video';
  }

  @computed('type')
  get isObject3D() {
    return this.type === 'object3D';
  }

  get possibleTypes() {
    return ['image', 'video'];
  }
}
