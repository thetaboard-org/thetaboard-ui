import Model, { attr } from '@ember-data/model';

export default class PublicEdgeNodeModel extends Model {
  @attr('number') nodeId;
  @attr('string') summary;
}
