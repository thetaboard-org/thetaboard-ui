import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default class TransactionHistoryModel extends Model {
  @service intl;
  @service thetaSdk;

  @attr('string') walletAddress;;
  @attr('string') blockHash;
  @attr('number') blockHeight;
  @attr('string') txnHash;
  @attr('number') type;
  @attr('string') fromAddress;
  @attr('string') toAddress;
  @attr('string') contractAddress;
  @attr('date') txTimestamp;
  @attr('number') status;
  @attr('number') theta;
  @attr('number') tfuel;
  @attr('number') feeTheta;
  @attr('number') feeTfuel;
  @attr('number') gasLimit;
  @attr('number') gasPrice;
  @attr('number') gasUsed;
  @attr('number') duration;
  @attr('number') splitBasisPoint;
  @attr('number') paymentSequence;
  @attr('number') reserveSequence;
  @attr('string') resourceIds;
  @attr('string') resourceId;
  @attr('number') thetaAmount;
  @attr('number') tfuelAmount;

  //transaction list component
  @attr('string') inOrOut

  @computed('thetaAmount', 'thetaSdk.prices.theta.price')
  get thetaValue() {
    return this.thetaSdk.prices.theta.price * this.thetaAmount;
  }

  @computed('tfuelAmount', 'thetaSdk.prices.tfuel.price')
  get tfuelValue() {
    return this.thetaSdk.prices.tfuel.price * this.tfuelAmount;
  }

  @computed('type')
  get typeName() {
    if (this.type == 0) {
      return this.intl.t('global.reward');
    } else if (this.type == 2) {
      return this.intl.t('global.transfer');
    } else if (this.type == 3) {
      return this.intl.t('global.reserve_fund');
    } else if (this.type == 5) {
      return this.intl.t('global.service_payment');
    } else if (this.type == 6) {
      return this.intl.t('global.split_contract');
    } else if (this.type == 7) {
      return this.intl.t('global.smart_contract');
    } else if (this.type == 9) {
      return this.intl.t('global.withdraw_stake');
    } else if (this.type == 10) {
      return this.intl.t('global.deposit_stake');
    } else if (this.type == 11) {
      return this.intl.t('global.stake_reward_distribution');
    }
    return '';
  }
}