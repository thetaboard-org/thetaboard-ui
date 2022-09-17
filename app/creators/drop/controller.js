import Controller from '@ember/controller';
import {action, computed} from '@ember/object';
import {inject as service} from '@ember/service';

export default class DropsController extends Controller {
  @service session;
  @service utils;
  @service abi;

  newNft = null;

  @computed('newNft', 'model.nfts.@each.isDeleted')
  get NFTs() {
    const nfts = this.model.nfts.toArray().filter(x => !x.isDeleted && !!x.id);
    if (this.newNft) {
      return [...nfts, this.newNft];
    } else {
      return nfts;
    }
  }

  get isAdmin() {
    return this.session.currentUser.user.scope === 'Admin'
  }

  @action
  async addNewNft() {
    this.set('newNft', await this.store.createRecord('NFT', {
      dropId: this.model.drop.get('id'),
    }));
  }





}
