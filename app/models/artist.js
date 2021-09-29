import Model, { attr, hasMany } from '@ember-data/model';

export default class ArtistModel extends Model {
  @attr('string') bio;
  @attr('string') name;
  @attr('string') logoName;
  @attr('string') image;
  @attr('string') instagram;
  @attr('string') youtube;
  @attr('string') twitter;
  @attr('string') website;
  @hasMany('drop') drops;
  @hasMany('nft') nfts;
}
