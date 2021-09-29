import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class MarketplaceNftTileComponent extends Component {
  @service currency;

  get nft() {
    return this.args.nft;
  }

  get drop() {
    return this.args.drop;
  }
}
