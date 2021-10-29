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
   this.store.createRecord('drop');
  }

  @action
  async saveDrop(drop) {
    try {
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
  async delete(drop) {
    await drop.deleteRecord();
    // TODO;  do something to refresh
  }
}
