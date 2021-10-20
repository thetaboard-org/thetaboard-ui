import Controller from '@ember/controller';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';


export default class DropsController extends Controller {
  @service session;

  get isAdmin() {
    return this.session.currentUser.user.scope === 'Admin'
  }

  @action
  addNewDrop() {
    const newDrop = this.store.createRecord('drop');
    this.model.drop.toArray().push(newDrop);
  }

  @action
  async saveDrop(drop) {
    try {
      debugger
      await drop.save();
    } catch (e) {
      console.error(e);
    }
  }

  @action
  async uploadImage(drop, property, file) {
    try {
      file.name = 'drop/' + file.name;
      const response = await file.upload('/nft/assets/upload');
      drop[property] = response.body.fileUrl;
    } catch (e) {
      console.error(e);
    }
  }

  @action
  selectArtist(drop, artist) {
    debugger
  }
}
