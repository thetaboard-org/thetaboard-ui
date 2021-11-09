import Controller from '@ember/controller';
import {action, computed} from '@ember/object';
import {inject as service} from '@ember/service';


export default class DropsController extends Controller {
  @service session;
  @service utils;

  newDrop = null;

  get isAdmin() {
    return this.session.currentUser.user.scope === 'Admin'
  }

  @computed('newDrop', 'model.drops.@each.isDeleted')
  get Drops() {
    const drops = this.model.drops.toArray().filter(x => !x.isDeleted && !!x.id);
    if (this.newDrop) {
      return [...drops, this.newDrop];
    } else {
      return drops;
    }
  }

  @action
  addNewDrop() {
    this.set('newDrop', this.store.createRecord('drop', {
      artist: this.model.artists.firstObject
    }));
  }

  @action
  async saveDrop(drop) {
    try {
      await drop.save();
      this.utils.successNotify("Drop saved successfully");
    } catch (e) {
      console.error(e);
      this.utils.errorNotify(e.errors.message);
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
    try {
      const deleted = await drop.destroyRecord();
      this.utils.successNotify("Drop deleted successfully");
    } catch (e) {
      this.utils.errorNotify(e.errors.message);
    }
  }

  @action
  async deployDrop(drop){
    debugger
  }
}
