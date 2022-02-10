import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class SearchBarLabelOwnedGroupComponent extends Component {
  @service group;
  @service intl;
}
