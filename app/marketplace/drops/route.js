import Route from '@ember/routing/route';

export default class DropsRoute extends Route {
  async model() {
    const drops = await this.store.query('drop', {
      isPublic: 1
    });
    const drops_sorted = [
      ...drops.filterBy('isDropLive').sortBy('endDate'),
      ...drops.filter((x)=>!x.isDropStarted).sortBy('startDate'),
      ...drops.filterBy('isDropEnded').sortBy('endDate')]
    return {drops: drops_sorted};
  }
}
