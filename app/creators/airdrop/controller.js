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

  @computed('model.airdrops')
  get airdrops() {
    return this.model.airdrops;
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

  @computed('airdrops.meta.total')
  get totalAirdropPage() {
    if (this.model.airdrops.meta) {
      return Math.ceil(this.model.airdrops.meta.total / 6);
    }
    return 0
  }

  @action
  async pageChanged(page) {
    this.currentPage = page;
    const filter = {pageNumber: page}
    if (this.isAdmin) {
      filter.artistId = this.model.artists.firstObject.id
    }

    this.set('model.airdrop', await this.store.query('airdrop', filter));
  }
}
