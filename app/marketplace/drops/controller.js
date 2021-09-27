import Controller from '@ember/controller';

export default class DropsController extends Controller {
  get dropList() {
    return this.model.drops;
  }
}
