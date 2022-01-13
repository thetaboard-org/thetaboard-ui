import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { ethers } from 'ethers';
import * as thetajs from '@thetalabs/theta-js';
import {
  isDomainAvailable,
  getReverseName,
  setReverseName,
  getRegistrant,
  getController,
  getAddressRecord,
  registerDomain,
  getPrice,
  commitDomain,
  getCommitmentTimestamp,
} from "thetaboard-tns";

export default class DomainService extends Service {
  @service metamask;
  @service utils;
  @service intl;
  @tracked ethersProvider;

  async initDomains() {
    this.ethersProvider = new ethers.providers.Web3Provider(this.metamask.provider);
  }

  @action
  async checkNameAvailable(domainName) {
    const checkNameAvailable = await isDomainAvailable(domainName);
    if (checkNameAvailable.available) {
      const price = await this.getPrice(domainName);
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
  async getReverseName(domainName) {
    const name = await getReverseName(domainName);
    return name;
  }

  @action
  async getRegistrant(domainName) {
    const registrant = await getRegistrant(domainName);
    return registrant;
  }

  @action
  async getController(domainName) {
    const controller = await getController(domainName);
    return controller;
  }

  @action
  async commitName(commitName) {
    try {
      return await commitDomain(commitName.nameToCommit, commitName.secret);
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  @action
  async getCommitmentTimestamp(commitName) {
    try {
      const commitmentTimestamp = await getCommitmentTimestamp(
        commitName.nameToCommit,
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
    const price = await getPrice(nameToCommit);
    return Number(price.price);
  }

  async buyDomain(commitName) {
    try {
      return await registerDomain(commitName.nameToCommit, commitName.secret);
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  async setReverseName(domain) {
    try {
      return await setReverseName(domain, this.metamask.currentAccount);
    } catch (e) {
      return this.utils.errorNotify(this.intl.t('domain.error.not_owner'));
    }
  }

  async getAddrForDomain(domain) {
    return await getAddressRecord(domain);
  }

  async waitForTransaction(hash) {
    const receipt = await this.ethersProvider.waitForTransaction(hash);
    if (receipt == null) {
      return await later(
        this,
        () => {
          this.getTransactionReceipt(hash);
        },
        500
      );
    } else {
      return { success: !!receipt.status };
    }
  }
}
