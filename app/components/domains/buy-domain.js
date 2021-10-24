import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DomainsBuyDomainComponent extends Component {
  @tracked commitingName;
  @tracked canBuy;

  get domainName() {
    return this.args.domainName;
  }

  @action
  commitName() {
    this.commitingName = true;
    this.canBuy = false;
    $('.progress-bar-inner')
      .stop()
      .css({ width: 0 })
      .animate({ width: '100%' }, 6000, 'linear', () => {
        this.canBuy = true;
        this.commitingName = false;
      });
  }

  @action
  buyName() {
    console.log('canbuy')
  }
}
