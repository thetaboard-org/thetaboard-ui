import Model, {attr, belongsTo} from '@ember-data/model';

export default class AirdropModel extends Model {
  @attr('string') sourceNFT
  @attr('number') count
  @attr('boolean') isDeployed;
  @belongsTo('nft') nft; // nft that will be given
  @belongsTo('artist') artist;

  get possibleTypes() {
    return ['all', 'random'];
  }

}
