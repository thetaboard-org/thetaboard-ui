import Component from '@glimmer/component';

export default class MarketplaceNftAssetTileComponent extends Component {
  get nftAsset() {
    return this.args.nftAsset;
  }
}
