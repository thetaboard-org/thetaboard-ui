import Component from "@glimmer/component";
import {inject as service} from '@ember/service';
import {action} from '@ember/object';
import {tracked} from "@glimmer/tracking";
import { ethers } from "ethers";

export default class NftActionComponent extends Component {
  @service utils;
  @service intl;
  @service abi;
  @service metamask;
  @service domain;

  @tracked transferPanel;
  @tracked addressLookup;
  @tracked inputDomain;
  @tracked inputAddress;
  @tracked commitingToTransfer;
  @tracked transfering;

  get nft() {
    return this.args.nft;
  }

  get enableTooltip() {
    $('[data-toggle="tooltip"]').tooltip();
    return;
  }

  get isOwner() {
    const checkOwner = async () => {
      if (typeof ethereum === 'undefined' || !ethereum.isConnected()) {
        return this.intl.t('notif.no_metamask');
      } else if (parseInt(ethereum.chainId) !== 361) {
        return this.intl.t('notif.not_theta_blockchain');
      } else {
        window.web3 = new Web3(window.web3.currentProvider);
        const account = this.metamask.currentAccount;
        const nft_contract = new window.web3.eth.Contract(this.abi.ThetaboardNFT, this.nft.contract_addr);
        const token_owner = await nft_contract.methods.ownerOf(this.nft.original_token_id).call();
        if (token_owner !== account) {
          setTimeout(() => {$('[data-toggle="tooltip"]').tooltip()}, 1000);
          return this.intl.t('domain.needs_to_own');
        }
        return true;
      }
    };
    return checkOwner();
  }

  @action
  toggleTransferPanel() {
    this.transferPanel = !this.transferPanel;
  }

  @action
  async transfer(event) {
    event.preventDefault();
    try {
      this.commitingToTransfer = true;
      const account = this.metamask.currentAccount;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const nft_contract = new ethers.Contract(this.nft.contract_addr, this.abi.ThetaboardNFT, signer)
      const transfer = await nft_contract.transferFrom(account, this.inputAddress, this.nft.original_token_id);
      if (transfer && transfer.hash) {
        this.transfering = true;
        const receipt = await this.domain.waitForTransaction(transfer.hash);
        if (receipt.success) {
          this.transfering = false;
          this.commitingToTransfer = false;
          this.transferPanel = false;
          return this.utils.successNotify(`${this.domainName} ${this.intl.t('domain.domain_transfered')} ${this.inputAddress}`);
        } else {
          this.commitingToTransfer = false;
          this.transfering = false;
          return this.utils.errorNotify(
            this.intl.t('domain.error.problem_occured_check_metamask')
          );
        }
      } else {
        this.commitingToTransfer = false;
        this.transfering = false;
        return this.utils.errorNotify(
          this.intl.t('domain.user_rejected_transaction')
        );
      }
    } catch (e) {
      this.commitingToTransfer = false;
      this.transfering = false;
      return this.utils.errorNotify(e.message);
    }
  }

  @action
  async inputHandler(e) {
    e.preventDefault();
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
