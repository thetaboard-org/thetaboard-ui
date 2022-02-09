import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

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
      };
      if (this.thetaSdk.currentAccount) {
        result.address = this.thetaSdk.currentAccount.firstObject;
        if (!this.metamask.currentAccount) {
          return result;
        }
        const reverse = await this.domain.getReverseName(result.address);
        result.name = reverse.domain + ".theta";
      }
      return result;
    };

    return walletLabel();
  }
}
