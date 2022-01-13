import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DomainSearchController extends Controller {
  queryParams = ['tns'];
  @tracked tns = null;

  @action
  setTns(value) {
    this.tns = value;
  }
}
