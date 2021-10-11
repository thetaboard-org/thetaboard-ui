import Component from '@glimmer/component';

export default class NftInfoNftAssetTileComponent extends Component {
  get nftAsset() {
    return this.args.nftAsset;
  }

  get isImage() {
    return this.args.nftAsset.type == 'image';
  }

  get isVideo() {
    return this.args.nftAsset.type == 'video';
  }
}
