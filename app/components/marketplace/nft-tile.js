import Component from '@glimmer/component';

export default class MarketplaceNftTileComponent extends Component {
  get nft() {
    return this.args.nft;
  }

  get availableNft() {
    const getInfo = async () => {
      const totalMinted = await this.nft.totalMinted;
      return this.nft.editionNumber - totalMinted;
    }
    return getInfo();
  }

  get drop() {
    return this.args.drop;
  }

}
