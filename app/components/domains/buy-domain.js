import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';

export default class DomainsBuyDomainComponent extends Component {
  @service store;
  @service metamask;
  @service domain;
  @service utils;
  @service intl;
  @tracked commitingName;
  @tracked timerOn;
  @tracked canBuy;
  @tracked currentStep = 1;
  @tracked nameCommited;

  get domainName() {
    return this.args.domainName;
  }

  get price() {
    return this.args.price;
  }

  get isBalanceEnough() {
    return this.args.isBalanceEnough;
  }

  get isStep1() {
    return this.currentStep == 1;
  }

  get isStep2() {
    return this.currentStep == 2;
  }

  get isStep3() {
    return this.currentStep == 3;
  }

  @action
  async commitName() {
    this.commitingName = true;
    const secret = '0x' + this.utils.randomHexa(64);
    let nameToCommit = this.store.createRecord('commitName', {
      nameToCommit: this.domainName,
      account: this.metamask.currentAccount,
      secret: secret,
    });
    const commitNameResult = await this.domain.commitName(nameToCommit);
    if (commitNameResult.tx) {
      this.nameCommited = nameToCommit;
      this.getCurrentCommitmentTimestamp();
    } else {
      this.commitingName = false;
      return this.utils.errorNotify(
        this.intl.t('domain.user_rejected_transaction')
      );
    }
  }

  async nameCommitedTransaction(timeStamp) {
    this.nameCommited.timestamp = new Date(timeStamp);
    this.canBuy = false;
    this.currentStep = 2;
    await this.nameCommited.save();
    this.timerOn = true;
    $('.progress-bar-inner')
      .stop()
      .css({ width: 0 })
      .animate({ width: '100%' }, 65000, 'linear', () => this.canBuyDomain());
  }

  async getCurrentCommitmentTimestamp() {
    const commitmentTimestamp = await this.domain.getCommitmentTimestamp(
      this.nameCommited
    );
    if (commitmentTimestamp.commitmentTimestamp.toString() == '0') {
      return later(this, this.getCurrentCommitmentTimestamp, 1000);
    } else {
      const timeStamp = commitmentTimestamp.commitmentTimestamp.toNumber() * 1000;
      return this.nameCommitedTransaction(timeStamp);
    }
  }

  async canBuyDomain() {
    const getCommitmentTimestamp = await this.domain.getCommitmentTimestamp(this.nameCommited);
//TODO:
//Check localstorage
//check timestamp is less than 24 hours
//if so 
  //check timestamp is more than a minute
  //if so go to step 3
  //else go to step2
//else go to step 1

    this.canBuy = true;
    this.commitingName = false;
    this.timerOn = false;
    this.currentStep = 3;
  }

  @action
  buyName() {
    console.log('canbuy');
  }
}
