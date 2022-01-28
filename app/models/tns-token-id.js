import Model, { attr } from '@ember-data/model';

export default class TnsTokenIdModel extends Model {
  @attr('string') name;
  @attr('string') tokenId;
}
