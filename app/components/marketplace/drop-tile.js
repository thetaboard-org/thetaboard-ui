import Component from '@glimmer/component';

export default class MarketplaceDropTileComponent extends Component {
  get drop() {
    return this.args.drop;
  }
}
