import Controller from '@ember/controller';
import {action, computed} from '@ember/object';
import {inject as service} from '@ember/service';


export default class DropsController extends Controller {
  @service session;
  @service utils;
  @service abi;

  newDrop = null;

  get isAdmin() {
    return this.session.currentUser.user.scope === 'Admin'
  }

  @computed('newDrop', 'model.drops.@each.isDeleted')
  get Drops() {
    const drops = this.model.drops.toArray().filter(x => !x.isDeleted && !!x.id);
    if (this.newDrop) {
      return [...drops, this.newDrop];
    } else {
      return drops;
    }
  }

  @action
  addNewDrop() {
    this.set('newDrop', this.store.createRecord('drop', {
      artist: this.model.artists.firstObject
    }));
  }

  @action
  async saveDrop(drop) {
    try {
      await drop.save();
      this.utils.successNotify("Drop saved successfully");
    } catch (e) {
      console.error(e);
      this.utils.errorNotify(e.errors.message);
    }
  }

  @action
  async uploadImage(drop, property, file) {
    try {
      file.name = 'drop/' + file.name;
      const response = await file.upload('/nft/assets/upload');
      drop[property] = response.body.fileUrl;
    } catch (e) {
      console.error(e);
    }
  }

  @action
  async delete(drop) {
    try {
      const deleted = await drop.destroyRecord();
      this.utils.successNotify("Drop deleted successfully");
    } catch (e) {
      this.utils.errorNotify(e.errors.message);
    }
  }

  @action
  async deployDrop(drop) {
    // web3/metamask
    window.web3 = new Web3(window.web3.currentProvider);
    const NFTcontract = new window.web3.eth.Contract(this.abi.ThetaboardNFT);
    const accounts = await ethereum.request({method: 'eth_requestAccounts'});
    const account = accounts[0];
    // prep contracts :
    const nfts = await drop.get('nfts');
    debugger
    const contractData = NFTcontract.deploy({
      data: this.abi.ThetaboardNFTByteCode,
      arguments: ["Thetaboard 2021 NFT", "TB", "https://nft.thetaboard.io/nft/2/"]
    })
    const contractData2 = NFTcontract.deploy({
      data: this.abi.ThetaboardNFTByteCode,
      arguments: ["Thetaboard 2021 NFT", "TB", "https://nft.thetaboard.io/nft/2/"]
    })
    const newContractInstance = await Promise.all([contractData.send({from: account}), contractData2.send({from: account})]);
    debugger
  }
}
