import Route from '@ember/routing/route';

export default class DropsRoute extends Route {
  async model() {
    const drops = await this.store.query('drop', {
      isPublic: 1
    });
    return {drops: drops};
  }
}
