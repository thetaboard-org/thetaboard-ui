import Component from '@glimmer/component';

export default class MarketplaceArtistTileComponent extends Component {
  get artist() {
    return this.args.artist;
  }
}
