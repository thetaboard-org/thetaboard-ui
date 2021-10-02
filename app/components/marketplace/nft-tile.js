import Component from '@glimmer/component';

export default class MarketplaceNftTileComponent extends Component {
  get nft() {
    return this.args.nft;
  }

  get drop() {
    return this.args.drop;
  }
}
