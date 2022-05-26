import Component from '@glimmer/component';
import {inject as service} from '@ember/service';
import {action} from '@ember/object';
import {tracked} from "@glimmer/tracking";
import {ethers} from "ethers";

export default class NftActionsTransferComponent extends Component {
  @service utils;
  @service intl;
  @service metamask;
  @service domain;
  @service abi;

  @tracked transferPanel;
  @tracked commitingToTransfer = false;
  @tracked transfering = false;
  @tracked addressLookup;
  @tracked inputDomain;
  @tracked inputAddress;

  get nft() {
    return this.args.nft;
  }

  @action
  toggleTransferPanel() {
    this.args.setTooltip();
    this.transferPanel = !this.transferPanel;
  }

  @action
  async transfer(event) {
    event.preventDefault();
    try {
      this.commitingToTransfer = true;
      this.args.setTooltip();
      const account = this.metamask.currentAccount;
      const signer = this.metamask.provider.getSigner();
      const nft_contract = new ethers.Contract(this.nft.contract_addr, this.abi.ThetaboardNFT, signer)
      const transfer = await nft_contract.transferFrom(account, this.inputAddress, this.nft.original_token_id);
      this.transfering = true;
      await transfer.wait();
      this.transfering = false;
      this.commitingToTransfer = false;
      this.transferPanel = false;
      this.args.setTooltip();
      return this.utils.successNotify(`${this.domainName} ${this.intl.t('domain.domain_transfered')} ${this.inputAddress}`);
    } catch (e) {
      this.commitingToTransfer = false;
      this.transfering = false;
      this.args.setTooltip();
      return this.utils.errorNotify(e.message);
    }
  }

  @action
  async inputHandler(e) {
    e.preventDefault();
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
        if (reverse.domain == this.domain.sanitizeTNS(inputValue)) {
          this.addressLookup = address.addressRecord;
          this.inputDomain = this.domain.sanitizeTNS(inputValue);
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
        this.addressLookup = value.domain;
      }
      this.inputAddress = inputValue;
      this.inputDomain = this.addressLookup;
    } else {
      this.inputAddress = '';
      this.inputDomain = '';
    }
  }
}
