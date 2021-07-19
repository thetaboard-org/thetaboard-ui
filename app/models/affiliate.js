import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class AffiliateModel extends Model {
  @attr('string') address;
  @attr('string') name;
  @attr('string') displayName;
  @attr('string') logo;
  @belongsTo('user') userId;
  @hasMany('publicEdgeNode') publicEdgeNodes;
}