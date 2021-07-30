import Model, { attr } from '@ember-data/model';

export default class TransactionHistoryModel extends Model {
  @attr('string') walletAddress;
  @attr('string') blockHash
  @attr('number') blockHeight
  @attr('string') txnHash
  @attr('number') type
  @attr('string') fromAddress
  @attr('string') toAddress
  @attr('string') contractAddress
  @attr('date') txTimestamp
  @attr('number') status
  @attr('number') theta
  @attr('number') tfuel
  @attr('number') feeTheta
  @attr('number') feeTfuel
  @attr('number') gasLimit
  @attr('number') gasPrice
  @attr('number') gasUsed
  @attr('number') duration
  @attr('number') splitBasisPoint
  @attr('number') paymentSequence
  @attr('number') reserveSequence
  @attr('string') resourceIds
  @attr('string') resourceId

  //transaction list component
  @attr('string') inOrOut
  @attr() values
}
