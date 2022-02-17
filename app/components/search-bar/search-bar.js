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
    await this.metamask.initMeta();
    this.invalidAddress = false;
    let inputVal = this.inputAddress;
    if (inputVal.length == 42 && inputVal.toLowerCase().startsWith('0x')) {
      await this.thetaSdk.getWalletsInfo('wallet', [inputVal]);
      this.inputDomain
        ? this.args.onRouteChange(this.inputDomain)
        : this.args.onRouteChange(this.inputVal);
      $('#searchModal').modal('hide');
      return;
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
    this.addressLookup = '';
    let inputValue = e.currentTarget.value;
    await this.metamask.initMeta();
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
