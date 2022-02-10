import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DomainsNftInfoTnsComponent extends Component {
  constructor() {
    super(...arguments);
    this.initComponent();
  }
  @service metamask;
  @service domain;
  @tracked isOwner;
  @tracked isController;
  @tracked isAddressRecord;
  @tracked isReverseName;
  @tracked canReverseName;
  @tracked canReclaimController;
  @tracked canEditAddressRecord;
  @tracked rawReverseName;
  @tracked addressRecord;
  @tracked canUlink;

  get tnsLabel() {
    return this.nft.name.replace('.theta', '');
  }

  get nft() {
    return this.args.nft;
  }

  @action
  async initComponent() {
    this.isOwner = false;
    this.isController = false;
    this.isAddressRecord = false;
    this.isReverseName = false;
    this.canReverseName = false;
    this.canReclaimController = false;
    this.canEditAddressRecord = false;
    this.rawReverseName = '';
    this.canUlink = false;

    let currentAddress = this.metamask.currentAccount;
    if (!currentAddress) {
      await this.metamask.connect();
      currentAddress = this.metamask.currentAccount;
    }

    const registrant = await this.domain.getRegistrant(this.tnsLabel);
    //Check if owner of NFT
    if (currentAddress == registrant.registrant) {
      this.isOwner = true;

      //check domain raw reverse name
      this.rawReverseName = await this.domain.getRawReverseName(currentAddress);
      if (this.rawReverseName.domain == this.tnsLabel) {
        this.isReverseName = true;
      }

      //check address record
      let addressRecord = await this.domain.getAddrForDomain(this.tnsLabel);
      this.addressRecord = addressRecord.addressRecord;
      if (currentAddress == this.addressRecord) {
        this.isAddressRecord = true;
      }

      //Check if controller of NFT
      const controller = await this.domain.getController(this.tnsLabel);
      if (currentAddress == controller.controller) {
        this.isController = true;

        //Check if address record match controller and registrant
        if (currentAddress == addressRecord.addressRecord) {
          //check domain reverse name
          const reverseName = await this.domain.getReverseName(
            addressRecord.addressRecord
          );

          if (reverseName.domain == this.tnsLabel) {
            this.canUlink = true;
            //can unlink the addressRecord (set to "")
          }
        } else {
          //Not controller of NFT, can reclaim control
          this.canEditAddressRecord = true;
        }
      } else {
        //Not controller of NFT, can reclaim control
        this.canReclaimController = true;
      }
    }
  }
}
