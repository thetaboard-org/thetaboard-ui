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

  get airdrops() {
    return this.model.airdrops.filter(x => !!x.id);
  }

  @action
  addNewAirdrop() {
    this.set('newAirdrop', this.store.createRecord('airdrop', {
      artistId: this.model.artists.firstObject.id,
      giftNft: this.store.createRecord('NFT', {
        artistId: this.model.artists.firstObject.id
      })
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
      pageNumber: page
    }));
  }
}
