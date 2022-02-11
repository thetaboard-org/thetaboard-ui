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
  getRawReverseName,
  setReverseName,
  getRegistrant,
  getController,
  getAddressRecord,
  registerDomain,
  getPrice,
  commitDomain,
  getCommitmentTimestamp,
  getTokenId,
  changeRegistrant,
  changeController,
  reclaimControl,
  setAddressRecord,
} from "thetaboard-tns";

export default class DomainService extends Service {
  @service metamask;
  @service utils;
  @service intl;
  @tracked addressLookup;
  @tracked inputAddress;
  @tracked inputDomain;

  @action
  async checkNameAvailable(domainName) {
    await this.metamask.initMeta();
    const checkNameAvailable = await isDomainAvailable(domainName, this.metamask.provider);
    if (checkNameAvailable.available) {
      const price = await this.getPrice(domainName, this.metamask.provider);
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
    await this.metamask.initMeta();
    const name = await getReverseName(domainName, this.metamask.provider);
    return name;
  }

  @action
  async getRawReverseName(domainName) {
    await this.metamask.initMeta();
    const name = await getRawReverseName(domainName, this.metamask.provider);
    return name;
  }

  @action
  async getRegistrant(domainName) {
    await this.metamask.initMeta();
    const registrant = await getRegistrant(domainName, this.metamask.provider);
    return registrant;
  }

  @action
  async changeRegistrant(domainName, address) {
    try {
      await this.metamask.initMeta();
      return await changeRegistrant(domainName.replace('.theta', ''), address, this.metamask.provider);
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  @action
  async changeController(domainName, address) {
    try {
      await this.metamask.initMeta();
      return await changeController(domainName.replace('.theta', ''), address, this.metamask.provider);
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  @action
  async getController(domainName) {
    await this.metamask.initMeta();
    const controller = await getController(domainName, this.metamask.provider);
    return controller;
  }

  @action
  async commitName(committedName) {
    try {
      await this.metamask.initMeta();
      return await commitDomain(committedName.nameToCommit, committedName.secret, this.metamask.provider);
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  @action
  async getCommitmentTimestamp(committedName) {
    try {
      await this.metamask.initMeta();
      const commitmentTimestamp = await getCommitmentTimestamp(
        committedName.nameToCommit,
        committedName.secret,
        this.metamask.provider
      );
      return commitmentTimestamp.commitmentTimestamp.toNumber() * 1000;
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  async getBalance() {
    await this.metamask.initMeta();
    if (!this.metamask.currentAccount) {
      return 0;
    }
    const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
    const accountBalance = await ethersProvider.getBalance(this.metamask.currentAccount);
    const balance = thetajs.utils.fromWei(accountBalance.toString());
    return Number(balance);
  }

  async getPrice(domain) {
    await this.metamask.initMeta();
    const price = await getPrice(domain, this.metamask.provider);
    return Number(price.price);
  }

  async getTokenId(domain) {
    try {
      const tokenId = await getTokenId(domain);
      return tokenId.tokenId;
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  async buyDomain(committedName) {
    try {
      await this.metamask.initMeta();
      return await registerDomain(committedName.nameToCommit, committedName.secret, this.metamask.provider);
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  async setReverseName(domain) {
    try {
      await this.metamask.initMeta();
      return await setReverseName(domain, this.metamask.currentAccount, this.metamask.provider);
    } catch (e) {
      return this.utils.errorNotify(this.intl.t('domain.error.not_owner'));
    }
  }

  async getAddrForDomain(domain) {
    try {
      await this.metamask.initMeta();
      return await getAddressRecord(domain, this.metamask.provider);
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  async reclaimControl(domain) {
    try {
      await this.metamask.initMeta();
      return await reclaimControl(domain.replace('.theta', ''), this.metamask.currentAccount, this.metamask.provider);
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  async setAddressRecord(domain, address) {
    try {
      await this.metamask.initMeta();
      return await setAddressRecord(domain.replace('.theta', ''), address, this.metamask.provider);
    } catch (e) {
      return this.utils.errorNotify(e.message);
    }
  }

  async waitForTransaction(hash) {
    const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
    const receipt = await ethersProvider.waitForTransaction(hash);
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

  @action
  async inputHandler(e) {
    e.preventDefault();
    this.addressLookup = '';
    let inputValue = e.currentTarget.value;
    if (inputValue.endsWith(".theta")) {
      const address = await this.getAddrForDomain(inputValue.replace(".theta", ""));
      if (
        address.addressRecord &&
        address.addressRecord != '0x0000000000000000000000000000000000000000'
      ) {
        const reverse = await this.getReverseName(address.addressRecord);
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
      const value = await this.getReverseName(inputValue);
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
