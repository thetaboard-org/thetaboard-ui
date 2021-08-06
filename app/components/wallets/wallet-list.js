import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class WalletListComponent extends Component {
  @service envManager;
  @service thetaSdk;
  @service store;
  @service currency;

  get explorerEndpoint() {
    return this.envManager.config.explorerEndpoint;
  }
}
