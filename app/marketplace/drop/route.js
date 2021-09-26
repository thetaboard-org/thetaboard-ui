import Route from '@ember/routing/route';

export default class DropRoute extends Route {
  async model() {
    const drops = await this.store.findAll('drop');
    return { drops: drops };
  }
}
