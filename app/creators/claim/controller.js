import Controller from '@ember/controller';
import {action, computed, set} from '@ember/object';
import {inject as service} from '@ember/service';
import {tracked} from '@glimmer/tracking';


export default class ClaimController extends Controller {
  @service session;
  @service utils;

  @tracked artist = this.model.artists.firstObject;
  @tracked addresses = "";
  @tracked claimNFTForm = false;

  @computed("model.NFTs")
  get NFTs() {
    return this.model.NFTs;
  }

  get isAdmin() {
    return this.session.currentUser.user.scope === 'Admin'
  }

  @action
  async changeArtist(artist) {
    this.artist = artist;
    const NFTs = await this.store.query('NFT', {artistId: artist.id});
    set(this.model, "NFTs", NFTs);
  }


  @action
  async showNFTForm() {
    this.claimNFTForm = true;
  }

  @action
  async claimNFTs(e) {
    e.preventDefault();
    const addressesArray = this.addresses.split(',');
    let errorGettingNFTs = false;
    const TNT721s = await Promise.all(addressesArray.map(async (addr) => {
      const fetched = await fetch(`/explorer/wallet-info/${addr}/${0}`);
      if (fetched.status === 204) {
        errorGettingNFTs = true;
        return this.utils.errorNotify(`NFT doesn't exists: ${addr}`);
      }
      const nft = await fetched.json();
      if (nft.properties.artist) {
        errorGettingNFTs = true;
        return this.utils.errorNotify(`NFT already claimed: ${addr}`);
      } else
        return nft
    }));

    if (errorGettingNFTs) {
      return;
    }
    await Promise.all(TNT721s.map(async (nft) => {
      nft.artistId = this.artist.id;
      nft.nftContractId = nft.contract_addr;
      return this.store.createRecord('NFT', nft).save();
    }));
    this.addresses = "";
    this.claimNFTForm = false;
    // call change artist to refresh model
    this.changeArtist(this.artist);

  }

  @action
  async delete(nft) {
    try {
      await nft.destroyRecord();
      this.utils.successNotify("NFT deleted successfully");
    } catch (e) {
      this.utils.errorNotify(e.errors.message);
    }
  }
}
