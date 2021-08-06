import Service from '@ember/service';
import * as thetajs from '@thetalabs/theta-js';
import { getOwner } from '@ember/application';

export default class EnvManagerService extends Service {
  get thetaSdk() {
    return getOwner(this).lookup('service:theta-sdk');
  }

  get contract() {
    return getOwner(this).lookup('service:contract');
  }

  get utils() {
    return getOwner(this).lookup('service:utils');
  }

  get currentUser() {
    return getOwner(this).lookup('service:current-user');
  }

  get wallet() {
    return getOwner(this).lookup('service:wallet');
  }

  get intl() {
    return getOwner(this).lookup('service:intl');
  }

  config = {
    env: '',
    explorerEndpoint: '',
    queryParams: '',
    thetaNetwork: '',
    contractAddress: ''
  };

  async setParameters(params) {
    if (params && params.env) {
      this.config.env = params.env;
      if (params.env === 'testnet') {
        this.config.queryParams = '?env=testnet';
        this.config.thetaNetwork = thetajs.networks.ChainIds.Testnet;
        this.config.explorerEndpoint =
          'https://guardian-testnet-explorer.thetatoken.org';
        this.config.contractAddress = '0xe53ce9d69ca8718a1528cb0d7cf25fef9e8f4337';
      } else if (params.env === 'smart-contracts') {
        this.config.queryParams = '?env=smart-contracts';
        this.config.thetaNetwork = thetajs.networks.ChainIds.Privatenet;
        this.config.explorerEndpoint =
          'https://smart-contracts-sandbox-explorer.thetatoken.org';
        this.config.contractAddress = '0xe53ce9d69ca8718a1528cb0d7cf25fef9e8f4337';
      }
    } else {
      this.config.queryParams = '';
      this.config.thetaNetwork = thetajs.networks.ChainIds.Mainnet;
      this.config.env = '';
      this.config.explorerEndpoint = 'https://explorer.thetatoken.org';
      this.config.contractAddress = '0x5191de7a7f17dfcbb0e4e552188450abb13ff14b';
    }
    if (params && params.wa) {
      const wa = params.wa;
      if (wa.length == 42 && wa.substr(1, 1).toLocaleLowerCase() == 'x') {
        await this.thetaSdk.getWalletsInfo('wallet', [wa]);
      } else {
        const nameToAddress = await this.contract.getNameToAddress(wa);
        if (
          nameToAddress.length &&
          nameToAddress['ownerAddr'] !=
            '0x0000000000000000000000000000000000000000'
        ) {
          await this.thetaSdk.getWalletsInfo('wallet', [nameToAddress['ownerAddr']]);
        } else {
          this.utils.errorNotify(this.intl.t('notif.invalid_address'));
          this.contract.domainName = '';
        }
      }
    }

    if (params && params.group) {
      await this.thetaSdk.getWalletsInfo('group', params.group);
    }
    return this.config;
  }
}
