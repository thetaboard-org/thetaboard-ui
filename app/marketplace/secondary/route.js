import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SecondaryRoute extends Route {
  @service abi;

  async model(params) {
    const fetched = await fetch(`/api/marketplace/`);
    const fetchedJSON = await fetched.json();
    debugger
  }
}
