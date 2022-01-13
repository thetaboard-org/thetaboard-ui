import Model, { attr } from '@ember-data/model';

export default class CommitNameModel extends Model {
  @attr('string') nameToCommit;
  @attr('string') account;
  @attr('string') secret;
  @attr('date') timestamp;
}
