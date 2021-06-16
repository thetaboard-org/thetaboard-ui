import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class MyWalletsController extends Controller {
  @tracked walletAddress;
  @tracked stakeAmount;
  // @service currentUser;

  // @action
  // submitStake() {
  //   e.preventDefault();
  //   this.errorMessages = [];
  //   let tfuelStake = this.store.createRecord('tfuelstake', this.getProperties('walletAddress', 'stakeAmount'));
  //   debugger
  //   tfuelStake.user = this.currentUser.user;
  //   try {
  //     await tfuelStake.save();
  //     this.transitionToRoute('registered');
  //   } catch (adapterError) {
  //     this.errorMessages.pushObject(adapterError.errors);
  //   }
  // }
}
