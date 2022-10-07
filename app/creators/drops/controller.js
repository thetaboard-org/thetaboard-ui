import Controller from '@ember/controller';
import {action, computed} from '@ember/object';
import {inject as service} from '@ember/service';
import {tracked} from "@glimmer/tracking";

export default class DropsController extends Controller {
  @service session;
  @service utils;
  @service abi;

  newDrop = null;

  get isAdmin() {
    return this.session.currentUser.user.scope === 'Admin'
  }

  @computed('model.live')
  get live() {
    return this.model.live;
  }

  @computed('model.isComing')
  get isComing() {
    return this.model.isComing;
  }

  @computed('model.ended')
  get ended() {
    return this.model.ended;
  }

  @action
  addNewDrop() {
    this.set('newDrop', this.store.createRecord('drop', {
      artist: this.model.artists.firstObject
    }));
  }


  @tracked currentLivePage = 1;
  @tracked currentComingPage = 1;
  @tracked currentEndedPage = 1;

  @computed('live.meta.total')
  get totalLivePage() {
    debugger
    return Math.ceil(this.live.meta.total / 6);
  }

  @computed('isComing.meta.total')
  get totalComingPage() {
    return Math.ceil(this.isComing.meta.total / 6);
  }

  @computed('ended.meta.total')
  get totalEndedPage() {
    return Math.ceil(this.ended.meta.total / 6);
  }


  @action
  async pageChangedLive(page) {
    this.currentLivePage = page;
    this.set('model.live', await this.store.query('drop', {
      isLive: 1,
      sortBy: "endDate",
      pageNumber: page,
      artistId: this.isAdmin ? null : this.model.artists.firstObject.id
    }));
  }

  @action
  async pageChangedComing(page) {
    this.currentComingPage = page;
    this.set('model.isComing', await this.store.query('drop', {
      isComing: 1,
      sortBy: "startDate",
      pageNumber: page,
      artistId: this.isAdmin ? null : this.model.artists.firstObject.id
    }));
  }

  @action
  async pageChangedEnded(page) {
    this.currentEndedPage = page;
    this.set('model.ended', await this.store.query('drop', {
      isEnded: 1,
      sortBy: "endDate",
      pageNumber: page,
      artistId: this.isAdmin ? null : this.model.artists.firstObject.id
    }));
  }

}
