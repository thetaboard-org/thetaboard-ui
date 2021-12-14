import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { ethers } from 'ethers';
import * as thetajs from '@thetalabs/theta-js';
import {
  BaseRegistrarImplementation,
  ENSRegistry,
  ETHRegistrarController,
  PublicResolver,
  ReverseRegistrar,
} from 'thetaboard_domains_js';

export default class DomainService extends Service {
  @service metamask;
  @service utils;
  @service intl;
  @tracked ethersProvider;
  @tracked ethRegistrarController;
  @tracked publicResolver;
  @tracked baseRegistrarImplementation;
  @tracked ensRegistry;
  @tracked reverseRegistrar;

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

    this.publicResolver = new PublicResolver({
      provider,
      networkId,
    });

    this.baseRegistrarImplementation = new BaseRegistrarImplementation({
      provider,
      networkId,
      ethersSigner,
    });

    this.ensRegistry = new ENSRegistry({
      provider,
      networkId,
      ethersSigner,
    });

    this.reverseRegistrar = new ReverseRegistrar({
      provider,
      networkId,
      ethersSigner,
    });
  }

  @action
  async checkNameAvailable(nameToRegister) {
    const checkNameAvailable = await this.ethRegistrarController.checkNameAvailable(nameToRegister);
    if (checkNameAvailable.available) {
      const price = await this.getPrice(nameToRegister);
      const balance = await this.getBalance();
      return {
        available: checkNameAvailable.available,
        price: price,
        isBalanceEnough: Number(balance) >= Number(price),
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
      return await this.ethRegistrarController.commitName(
        commitName.nameToCommit,
        commitName.account,
        commitName.secret
      );
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  @action
  async getCommitmentTimestamp(commitName) {
    try {
      const commitmentTimestamp = await this.ethRegistrarController.getCommitmentTimestamp(
        commitName.nameToCommit,
        commitName.account,
        commitName.secret
      );
      return commitmentTimestamp.commitmentTimestamp.toNumber() * 1000;
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  async getBalance() {
    const accountBalance = await this.ethersProvider.getBalance(this.metamask.currentAccount);
    const balance = thetajs.utils.fromWei(accountBalance.toString());
    return Number(balance);
  }

  async getPrice(nameToCommit) {
    const weiPrice = await this.ethRegistrarController.costName(nameToCommit);
    const price = thetajs.utils.fromWei(weiPrice.cost.toString());
    return Number(price);
  }

  async buyDomain(commitName) {
    try {
      const price = await this.getPrice(commitName.nameToCommit);
      const weiPrice = thetajs.utils.toWei(price);
      return await this.ethRegistrarController.buyNewDomain(
        commitName.nameToCommit,
        commitName.account,
        commitName.secret,
        weiPrice,
        4000000000000
      );
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  async setReverseName(nameForRegister) {
    const ownerAccount = await this.publicResolver.getAddrForDomain(nameForRegister + ".theta");
    debugger
    if (
      ownerAccount &&
      ownerAccount.address &&
      ownerAccount.address.toLowerCase() == this.metamask.currentAccount.toLowerCase()
    ) {
      const setReverseNameReturn = await this.reverseRegistrar.setReverseName(
        nameForRegister + '.theta',
        this.metamask.currentAccount,
        4000000000000
      );
      return setReverseNameReturn;
    } else {
      return this.utils.errorNotify(this.intl.t('domain.error.not_owner'));
    }
  }

  async getAddrForDomain(nameForRegister) {
    return await this.publicResolver.getAddrForDomain(nameForRegister + ".theta");
  }

  async getNameForAddress(account) {
    return await this.publicResolver.getNameForAddress(account);
  }

  async getDomainOwner(nameForRegister) {
    // return await this.ensRegistry.getDomainOwner(nameForRegister + ".theta");
    const test = await this.baseRegistrarImplementation.ownerOf(nameForRegister);
    const test1 = await this.ensRegistry.getDomainOwner(nameForRegister + ".theta");
    const test2 = await this.publicResolver.getAddrForDomain(nameForRegister + ".theta");

    debugger
    return test1;
  }

  async getOwnerOf(nameForRegister) {
    return await this.baseRegistrarImplementation.ownerOf(nameForRegister);
  }

  async transferDomain(nameForRegister, accountTo) {
    try {
      const ownerAccount = await this.publicResolver.getAddrForDomain(nameForRegister + ".theta");
      if (
        ownerAccount &&
        ownerAccount.address &&
        ownerAccount.address.toLowerCase() == this.metamask.currentAccount.toLowerCase()
      ) {
        const transfer = await this.baseRegistrarImplementation.transferFrom(
          this.metamask.currentAccount,
          accountTo,
          nameForRegister,
          4000000000000
        );
        return transfer;
      } else {
        return this.utils.errorNotify(this.intl.t('domain.error.not_owner'));
      }
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  async reclaimOwnership(nameToClaim) {
    debugger
    const currentOwner = await this.baseRegistrarImplementation.ownerOf(nameToClaim);
    if (
      currentOwner &&
      currentOwner.address &&
      currentOwner.address.toLowerCase() == this.metamask.currentAccount.toLowerCase()
    ) {
      const transferFromReturn = await this.baseRegistrarImplementation.reclaimOwnership(
        nameToClaim,
        this.metamask.currentAccount,
        4000000000000
      );
      return transferFromReturn;
    }
  }

  async waitForTransaction(hash) {
    const receipt = await this.ethersProvider.waitForTransaction(hash);
    if (receipt == null) {
      return await later(this, () => {this.getTransactionReceipt(hash)}, 500);
    } else {
      return { success: !!receipt.status }
    }
  }
}
