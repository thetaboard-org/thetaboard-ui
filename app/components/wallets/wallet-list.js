import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class WalletListComponent extends Component {
  @service('env-manager') envManager;
  @service('theta-sdk') thetaSdk;
  @service('store') store;
  @service('currency') currency;

  get explorerEndpoint() {
    return this.envManager.config.explorerEndpoint;
  }
}
