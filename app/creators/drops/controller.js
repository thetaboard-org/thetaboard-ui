import Controller from '@ember/controller';
import {action, computed} from '@ember/object';
import {inject as service} from '@ember/service';

export default class DropsController extends Controller {
  @service session;
  @service utils;
  @service abi;

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

  @computed('Drops')
  get upcomingDrops() {
    return this.Drops.filter((x) => {
      return !x.isDeployed || new Date(x.startDate + 'Z') > new Date();
    });
  }

  @computed('Drops')
  get liveDrops() {
    return this.Drops.filter((x) => {
      return x.isDeployed
        && new Date(x.startDate + 'Z') < new Date()
        && new Date(x.endDate + 'Z') > new Date();
    });
  }

  @computed('Drops')
  get pastDrops() {
    return this.Drops.filter((x) => {
      return x.isDeployed
        && new Date(x.endDate + 'Z') < new Date();
    });
  }

  @action
  addNewDrop() {
    this.set('newDrop', this.store.createRecord('drop', {
      artist: this.model.artists.firstObject
    }));
  }
}
