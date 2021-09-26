import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { computed } from '@ember/object';

export default class DropModel extends Model {
  @attr('string') smallDescription;
  @attr('string') description;
  @attr('string') name;
  @attr('string') image;
  @attr('date') startDate;
  @attr('date') endDate;
  @belongsTo('artist') artist;
  // @hasMany('nft') nft;

  @computed('startDate')
  get isDropStarted() {
    return this.startDate < new Date();
  }

  @computed('endDate')
  get isDropEnded() {
    return this.endDate < new Date();
  }

  @computed('startDate', 'endDate')
  get isDropLive() {
    const today = new Date();
    return this.startDate < today && this.endDate > today;
  }
}
