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


  // state for deployNFTs
  deployNFTLoading = false;
  @action
  async deployNFTs(drop) {
    // web3/metamask
    const nfts = await drop.get('nfts');
    const nfts_to_deploy = nfts.filter((x)=> !x.nftContractId)
    if(nfts_to_deploy.length === 0){
      return this.utils.successNotify("All NFTs are already deployed");
    }
    this.set('deployNFTLoading', true);
    try{
      window.web3 = new Web3(window.web3.currentProvider);
      const NFTcontract = new window.web3.eth.Contract(this.abi.ThetaboardNFT);
      const accounts = await ethereum.request({method: 'eth_requestAccounts'});
      const account = accounts[0];
      // deploy contracts :
      const contracts = await Promise.all(nfts_to_deploy.map(async (nft)=>{
        return NFTcontract.deploy({
          data: this.abi.ThetaboardNFTByteCode,
          arguments: [nft.name, "TB", `https://nft.thetaboard.io/nft/${nft.id}/`]
        }).send({from: account});
      }));
      // save contracts addresses
      await Promise.all(nfts_to_deploy.map((nft, idx)=>{
        nft.nftContractId = contracts[idx]._address;
        return nft.save();
      }));
      this.utils.successNotify("NFTs successfully deployed");
    } catch (e) {
      console.error(e);
      this.utils.errorNotify(e);
    }
    this.set('deployNFTLoading', false);
  }
}
