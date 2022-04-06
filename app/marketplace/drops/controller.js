import Controller from '@ember/controller';
import {tracked} from "@glimmer/tracking";
import {inject as service} from '@ember/service';

import {action, computed} from '@ember/object';


export default class DropsController extends Controller {
  @service store;

  @computed('model.sponsored')
  get sponsored() {
    return this.model.sponsored;
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

  // Manage pages
  @tracked currentSponsoredPage = 1;
  @tracked currentLivePage = 1;
  @tracked currentComingPage = 1;
  @tracked currentEndedPage = 1;


  @computed('sponsored.meta.count')
  get totalSponsoredPage() {
    return Math.ceil(this.sponsored.meta.total / 6);
  }

  @computed('live.meta.total')
  get totalLivePage() {
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
  async pageChangedSponsored(page) {
    this.currentSponsoredPage = page;
    this.set('model.sponsored', await this.store.query('drop', {
      isLive: 1,
      isSponsored: 1,
      isPublic: 1,
      sortBy: "endDate",
      pageNumber: page,
    }));
  }

  @action
  async pageChangedLive(page) {
    this.currentLivePage = page;
    this.set('model.live', await this.store.query('drop', {
      isLive: 1,
      isSponsored: 0,
      sortBy: "endDate",
      pageNumber: page,
      isPublic: 1,
    }));
  }

  @action
  async pageChangedComing(page) {
    this.currentComingPage = page;
    this.set('model.isComing', await this.store.query('drop', {
      isEnded: 1,
      isPublic: 1,
      sortBy: "endDate",
      pageNumber: page
    }));
  }

  @action
  async pageChangedEnded(page) {
    this.currentEndedPage = page;
    this.set('model.ended', await this.store.query('drop', {
      isEnded: 1,
      isPublic: 1,
      sortBy: "endDate",
      pageNumber: page
    }));
  }
}
