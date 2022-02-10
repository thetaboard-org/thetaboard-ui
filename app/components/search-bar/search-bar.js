import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SearchBarSearchBarComponent extends Component {
  @service thetaSdk;
  @service utils;
  @service intl;
  @service metamask;
  @service domain;

  @tracked addressLookup;
  @tracked inputDomain;
  @tracked inputAddress;
  @tracked invalidAddress;

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
    this.invalidAddress = false;
    let inputVal = this.inputAddress || this.walletAddress;
    if (inputVal.length == 42 && inputVal.toLowerCase().startsWith('0x')) {
      await this.thetaSdk.getWalletsInfo('wallet', [inputVal]);
      this.args.onRouteChange(inputVal);
      $('#searchModal').modal('hide');
      return;
    } else if (inputVal.endsWith(".theta")) {
      if (this.metamask.isConnected) {
        const address = await this.domain.getAddrForDomain(inputVal.replace(".theta", ""));
        if (
          address.addressRecord &&
          address.addressRecord != '0x0000000000000000000000000000000000000000'
        ) {
          const reverse = await this.domain.getReverseName(address.addressRecord);
          if (reverse.domain == inputVal.replace(".theta", "")){
            await this.thetaSdk.getWalletsInfo('wallet', [address.addressRecord]);
            this.args.onRouteChange(address.addressRecord);
            $('#searchModal').modal('hide');
            return;
          }
        }
      }
    }
    this.invalidAddress = true;
    this.utils.errorNotify(this.intl.t('notif.invalid_address'));
  }

  @action
  async inputHandler(e) {
    e.preventDefault();
    if (e.key !== 'Enter') {
      this.invalidAddress = false;
    }
    if (!this.metamask.isConnected) {
      return;
    }
    this.addressLookup = '';
    let inputValue = e.currentTarget.value;
    if (inputValue.endsWith(".theta")) {
      const address = await this.domain.getAddrForDomain(inputValue.replace(".theta", ""));
      if (
        address.addressRecord &&
        address.addressRecord != '0x0000000000000000000000000000000000000000'
      ) {
        const reverse = await this.domain.getReverseName(address.addressRecord);
        if (reverse.domain == inputValue.replace(".theta", "")) {
          this.addressLookup = address.addressRecord;
          this.inputDomain = inputValue;
        } else {
          this.addressLookup = '';
          this.inputDomain = '';
        }
      } else {
        this.inputDomain = '';
      }
      this.inputAddress = this.addressLookup;
    } else if (
      inputValue.toLowerCase().startsWith('0x') &&
      inputValue.length == '42'
    ) {
      const value = await this.domain.getReverseName(inputValue);
      if (value.domain) {
        this.addressLookup = value.domain + ".theta";
      }
      this.inputAddress = inputValue;
      this.inputDomain = this.addressLookup;
    } else {
      this.inputAddress = '';
      this.inputDomain = '';
    }
  }
}
