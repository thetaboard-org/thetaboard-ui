import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class DropController extends Controller {
  get dropList() {
    return this.model.drops;
  }
}
