import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class DomainsConnectionToMetamaskComponent extends Component {
  @service metamask;
  @service isMobile;
}
