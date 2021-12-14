import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';
import moment from 'moment';
import * as thetajs from '@thetalabs/theta-js';

export default class DomainsBuyDomainComponent extends Component {
  constructor() {
    super(...arguments);
    this.initialize();
  }

  @service store;
  @service metamask;
  @service domain;
  @service utils;
  @service intl;
  @service store;
  @tracked commitingName;
  @tracked timerOn;
  @tracked canBuy;
  @tracked buyingName;
  @tracked commitBuyingName;
  @tracked currentStep = 1;
  @tracked nameCommited;
  @tracked nameBought;

  async initialize() {
    const commitNames = await this.store.query('commitName', {
      filter: {
        nameToCommit: this.domainName,
        account: this.metamask.currentAccount,
      },
    });

    if (commitNames.length) {
      const twentyFourHours = 86400000;
      const oneMinute = 60000;
      //TODO: use the getcommitment timestamp funciton here
      const orderedNames = await commitNames.sortBy('timestamp');
      this.nameCommited = orderedNames.lastObject;
      const timeDifference = moment(new Date()).diff(
        this.nameCommited.timestamp
      );
      if (timeDifference < twentyFourHours) {
        if (timeDifference < oneMinute) {
          this.startTimer();
        } else {
          this.canBuyDomain();
        }
      }
    }
  }

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
      const receipt = await this.domain.waitForTransaction(commitNameResult.tx.hash);
      if (receipt.success) {
        const timestamp = await this.domain.getCommitmentTimestamp(
          this.nameCommited
        );
        this.nameCommited.timestamp = new Date(timestamp);
        await this.nameCommited.save();
        return this.startTimer();
      } else {
        this.commitingName = false;
        return this.utils.errorNotify(
          this.intl.t('domain.error.problem_occured_check_metamask')
        );
      } 
    } else {
      this.commitingName = false;
      return this.utils.errorNotify(
        this.intl.t('domain.user_rejected_transaction')
      );
    }
  }

  startTimer() {
    this.commitingName = true;
    this.canBuy = false;
    this.currentStep = 2;
    this.timerOn = true;
    $('.progress-bar-inner')
      .stop()
      .css({ width: 0 })
      .animate({ width: '100%' }, 65000, 'linear', () => this.canBuyDomain());
  }

  async canBuyDomain() {
    this.canBuy = true;
    this.commitingName = false;
    this.timerOn = false;
    this.currentStep = 3;
  }

  @action
  async buyName() {
    this.commitBuyingName = true;
    const getCommitmentTimestamp = await this.domain.getCommitmentTimestamp(
      this.nameCommited
    );
    const timeDifference = moment(new Date()).diff(
      new Date(getCommitmentTimestamp)
    );
    const twentyFourHours = 86400000;
    const oneMinute = 60000;
    if (timeDifference < twentyFourHours) {
      if (timeDifference > oneMinute) {
        const accountBalance = await this.domain.getBalance();
        const price = await this.domain.getPrice(this.nameCommited.nameToCommit);
        const isBalanceEnough = accountBalance >= price;
        if (isBalanceEnough) {
          const result = await this.domain.buyDomain(this.nameCommited);
          if (result.tx) {
            this.buyingName = true
            const receipt = await this.domain.waitForTransaction(result.tx.hash);
            if (receipt.success) {
              this.nameBought = true;
              return this.utils.successNotify(
                this.intl.t('domain.domain_bought') +
                  this.nameCommited.nameToCommit
              );
            } else {
              this.buyingName = false;
              this.commitBuyingName = false;
              return this.utils.errorNotify(
                this.intl.t('domain.error.problem_occured_check_metamask')
              );
            } 
          } else {
            this.buyingName = false;
            this.commitBuyingName = false;
            return this.utils.errorNotify(
              this.intl.t('domain.user_rejected_transaction')
            );
          }
        } else {
          return this.utils.errorNotify(
            this.intl.t('domain.insufficient_funds')
          );
        }
      } else {
        this.buyingName = false;
        this.commitBuyingName = false;
        return this.utils.errorNotify(this.intl.t('domain.wait_a_minute'));
      }
    } else {
      return this.utils.errorNotify(this.intl.t('domain.registration_expired'));
    }
  }

  @action
  refreshPage() {
    return window.location.reload();
  }
  
}
