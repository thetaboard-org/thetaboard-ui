import Component from '@glimmer/component';
import {later} from '@ember/runloop';
import {tracked} from '@glimmer/tracking';

export default class MarketplaceDropStatusComponent extends Component {
  constructor(...args) {
    super(...args);
    this.countDownCall;
    this.countDown = '';
    if (this.drop.get('isStartingInLessThan24Hours')) {
      this.countDownTime(this.drop.startDate);
    } else if (this.drop.get('isEndingInLessThan24Hours')) {
      this.countDownTime(this.drop.endDate);
    }
  }

  @tracked countDown;

  countDownTime(date) {
    this.countDownCall = later(
      this,
      function () {
        const countDownDate = new Date(date + 'Z').getTime();
        const now = new Date().getTime();
        const distance = countDownDate - now;
        let hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);
        this.countDown =
          ('0' + hours).slice(-2) +
          ':' +
          ('0' + minutes).slice(-2) +
          ':' +
          ('0' + seconds).slice(-2);
        if (distance < 0) {
          this.countDown = '00:00:00';
        } else {
          return this.countDownTime(date);
        }
      },
      1000
    );
    return;
  }

  get drop() {
    return this.args.drop;
  }
}
