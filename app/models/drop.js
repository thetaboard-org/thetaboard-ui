import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { computed } from '@ember/object';

export default class DropModel extends Model {
  @attr('string') smallDescription;
  @attr('string') description;
  @attr('string') name;
  @attr('string') image;
  @attr('isodate') startDate;
  @attr('isodate') endDate;
  @attr('boolean') isPublic;
  @attr('boolean') isDeployed;
  @belongsTo('artist') artist;
  @hasMany('nft') nfts;

  @computed('startDate')
  get isDropStarted() {
    return new Date(this.startDate) < new Date();
  }

  @computed('endDate')
  get isDropEnded() {
    return new Date(this.endDate) < new Date();
  }

  @computed('startDate', 'endDate')
  get isDropLive() {
    const today = new Date();
    return new Date(this.startDate) < today && new Date(this.endDate) > today;
  }

  @computed('startDate')
  get isStartingInLessThan24Hours() {
    const in24hours = new Date(new Date().getTime() + 60 * 60 * 24 * 1000);
    const now = new Date();
    return new Date(this.startDate) < in24hours && new Date(this.startDate) > now;
  }

  @computed('endDate', 'isDropLive')
  get isEndingInLessThan24Hours() {
    const in24hours = new Date(new Date().getTime() + 60 * 60 * 24 * 1000);
    const now = new Date();
    return new Date(this.endDate) < in24hours && new Date(this.endDate) > now;
  }
}
