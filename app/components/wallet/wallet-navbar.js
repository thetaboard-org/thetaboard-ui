import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class WalletWalletNavbarComponent extends Component {
  constructor(...args) {
    super(...args);
  }
  @service session;
  @service intl;
  @service wallet;
  @service group;
  @service thetaSdk;
  @service isMobile;
  @service metamask;
  @service domain;

  @action
  async selectWallet(wallet) {
    if (wallet.address) {
      await this.thetaSdk.getWalletsInfo('wallet', [wallet.address]);
      this.args.onRouteChange(wallet.address);
    }
  }

  @action
  async selectGroup(group) {
    if (group.uuid) {
      await this.thetaSdk.getWalletsInfo('group', group);
      this.args.onRouteChange(group.uuid, 'group');
    }
  }

  get getWalletLabel() {
    const walletLabel = async () => {
      let result = {
        name: '',
        address: '',
        walletName: '',
      };
      if (this.wallet.isSearchedWalletOwned) {
        result.walletName = this.wallet.isSearchedWalletOwned.name;
        result.address = this.wallet.isSearchedWalletOwned.address;
      } else if (this.thetaSdk.currentAccount) {
        result.address = this.thetaSdk.currentAccount.firstObject;
      }

      await this.metamask.initMeta();
      if (result.address) {
        const reverse = await this.domain.getReverseName(result.address);
        if (reverse.domain) {
          result.name = reverse.domain + ".theta";
        }
      }
      return result;
    };

    return walletLabel();
  }
}
