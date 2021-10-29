import Controller from '@ember/controller';
import {action, computed} from '@ember/object';
import {inject as service} from '@ember/service';


export default class ArtistsController extends Controller {
  @service session;
  @service utils;

  get isAdmin() {
    return this.session.currentUser.user.scope === 'Admin'
  }

  @computed('newArtist', 'model.artists.@each.isDeleted')
  get Artists() {
    const artists = this.model.artists.toArray().filter(x => !x.isDeleted);
    if (this.newArtist) {
      return [...artists, this.newArtist];
    } else {
      return artists;
    }
  }

  @action
  addNewArtist() {
    this.set('newArtist', this.store.createRecord('artist'));
  }

  @action
  async saveArtist(artist) {
    try {
      await artist.save();
      this.utils.successNotify("Artist saved successfully");
    } catch (e) {
      console.error(e);
      this.utils.errorNotify(e.errors.message);
    }
  }

  @action
  async uploadImage(artist, property, file) {
    try {
      file.name = 'artist/' + file.name;
      const response = await file.upload('/nft/assets/upload');
      artist[property] = response.body.fileUrl;
    } catch (e) {
      console.log(e)
      this.utils.errorNotify(e.errors.message);
    }
  }

  @action
  async delete(artist) {
    try {
      const deleted = await artist.destroyRecord();
      this.utils.successNotify("artist deleted successfully");
    } catch (e) {
      this.utils.errorNotify(e.errors.message);
    }
  }
}
