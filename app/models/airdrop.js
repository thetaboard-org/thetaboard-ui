import Model, {attr, belongsTo} from '@ember-data/model';

export default class AirdropModel extends Model {
  @attr('number') count
  @attr('boolean') isDeployed;
  @attr('string') winners;
  @attr('number') sourceNftId;
  @attr('number') artistId;
  @attr('number') giftNftId;
  @belongsTo('nft') sourceNft // which NFT is the winning one
  @belongsTo('nft') giftNft; // nft that will be given
  @belongsTo('artist') artist;
}
