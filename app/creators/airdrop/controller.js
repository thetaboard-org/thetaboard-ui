import Controller from '@ember/controller';
import {action, computed} from '@ember/object';
import {inject as service} from '@ember/service';
import {tracked} from "@glimmer/tracking";

export default class DropsController extends Controller {
  @service session;
  @service utils;
  @service abi;

  @tracked currentPage = 1;

  newAirdrop = null;

  get isAdmin() {
    return this.session.currentUser.user.scope === 'Admin'
  }

  @action
  addNewAirdrop() {
    this.set('newAirdrop', this.store.createRecord('airdrop', {
      artist: this.model.artists.firstObject,
      nft: this.store.createRecord('NFT')
    }));
  }

  @computed('this.airdrops')
  get totalAirdropPage() {
    return Math.ceil(this.model.airdrops.length / 6);
  }

  @action
  async pageChangedLive(page) {
    this.currentLivePage = page;
    this.set('model.airdrop', await this.store.query('airdrop', {
      isLive: 1,
      sortBy: "endDate",
      pageNumber: page,
      artistId: this.isAdmin ? null : this.model.artists.firstObject.id
    }));
  }
}
