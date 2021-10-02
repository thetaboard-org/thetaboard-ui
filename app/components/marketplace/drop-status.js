import Component from '@glimmer/component';

export default class MarketplaceDropStatusComponent extends Component {
  get drop() {
    return this.args.drop;
  }
}
