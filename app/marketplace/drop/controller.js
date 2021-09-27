import Controller from '@ember/controller';

export default class DropController extends Controller {
  get drop() {
    return this.model.drop;
  }
}
