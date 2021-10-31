import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { ethers } from 'ethers';
import * as thetajs from '@thetalabs/theta-js';
import {
  BaseRegistrarImplementation,
  ENSRegistry,
  ETHRegistrarController,
  PublicResolver,
  ReverseRegistrar
} from 'thetaboard_domains_js';

export default class DomainService extends Service {
  @service metamask;
  @service utils;
  @tracked ethersProvider;
  @tracked ethRegistrarController;

  @action
  async initDomain() {
    const provider = this.metamask.provider;
    this.ethersProvider = new ethers.providers.Web3Provider(provider);
    const ethersSigner = this.ethersProvider.getSigner(this.metamask.currentAccount);
    const networkId = this.metamask.networkId;

    this.ethRegistrarController = new ETHRegistrarController({
      provider,
      networkId,
      ethersSigner,
    });
  }

  @action
  async checkNameAvailable(nameToRegister) {
    const checkNameAvailable = await this.ethRegistrarController.checkNameAvailable(nameToRegister);
    console.log(checkNameAvailable.available);
    if (checkNameAvailable.available) {
      const price = await this.ethRegistrarController.costName(nameToRegister);
      const accountBalance = await this.ethersProvider.getBalance(this.metamask.currentAccount);
      return {
        available: checkNameAvailable.available,
        price: price.cost.toString(),
        isBalanceEnough:
          Number(thetajs.utils.fromWei(accountBalance.toString())) >=
          Number(price.cost.toString()),
      };
    } else {
      return {
        available: false,
      };
    }
  }

  @action
  async commitName(commitName) {
    try {
      return await this.ethRegistrarController.commitName(commitName.nameToCommit, commitName.account, commitName.secret);
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  @action
  async getCommitmentTimestamp(commitName) {
    try {
      return await this.ethRegistrarController.getCommitmentTimestamp(commitName.nameToCommit, commitName.account, commitName.secret);
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }
}
