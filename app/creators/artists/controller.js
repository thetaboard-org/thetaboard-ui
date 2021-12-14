import Controller from '@ember/controller';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';


export default class ArtistsController extends Controller {
  @service session;

  get isAdmin() {
    return this.session.currentUser.user.scope === 'Admin'
  }

  @action
  addNewArtist() {
    const newArtist = this.store.createRecord('artist');
    this.model.artists.toArray().push(newArtist);
  }

  @action
  async saveArtist(artist) {
    try {
      await artist.save();
    } catch (e) {
      console.error(e);
    }
  }

  @action
  async uploadImage(artist, property, file) {
    try {
      file.name = 'artist/' + file.name;
      const response = await file.upload('/nft/assets/upload');
      artist[property] = response.body.fileUrl;
    } catch (e) {
      console.error(e);
    }
  }
}
