import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SearchBarSearchBarComponent extends Component {
  @service thetaSdk;
  @service utils;
  @service intl;
  @service contract;
  walletAddress = '';

  @action
  setupEventListener() {
    $('#searchModal').on('shown.bs.modal', () => {
      $('#searchInput').focus();
    });
    $('#searchModal').on('hidden.bs.modal', () => {
      $('#searchInput').blur();
    });
  }

  @action
  async search(event) {
    event.preventDefault();
    if (
      this.walletAddress.length == 42 &&
      this.walletAddress.toLowerCase().startsWith('0x')
    ) {
      await this.thetaSdk.getWalletsInfo('wallet', [this.walletAddress]);
      // this.contract.domainName
      //   ? this.args.onRouteChange(this.contract.domainName)
      //   : this.args.onRouteChange(this.walletAddress);
    } else {
      // const nameToAddress = await this.contract.getNameToAddress(
      //   this.walletAddress
      // );
      // if (
      //   nameToAddress.length &&
      //   nameToAddress['ownerAddr'] !=
      //     '0x0000000000000000000000000000000000000000'
      // ) {
      //   await this.thetaSdk.getWalletsInfo('wallet', [nameToAddress['ownerAddr']]);
      //   this.args.onRouteChange(this.walletAddress);
      // } else {
        this.utils.errorNotify(this.intl.t('notif.invalid_address'));
      //   this.args.onRouteChange('');
      //   this.contract.domainName = '';
      // }
    }
    $('#searchModal').modal('hide');
  }
}
