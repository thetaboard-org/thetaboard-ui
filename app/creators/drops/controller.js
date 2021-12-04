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


  // TODO this should be in a service
  async setupMetaMask() {
    if (typeof ethereum === 'undefined' || !ethereum.isConnected()) {
      return this.utils.errorNotify(this.intl.t('notif.no_metamask'));
    } else if (parseInt(ethereum.chainId) !== 361) {
      return this.utils.errorNotify(this.intl.t('notif.not_theta_blockchain'));
    }
    window.web3 = new Web3(window.web3.currentProvider);
    const accounts = await ethereum.request({method: 'eth_requestAccounts'});
    return accounts[0];
  }


  async deployNFTsContract(account, nfts_to_deploy) {
    const NFTcontract = new window.web3.eth.Contract(this.abi.ThetaboardNFT);
    // deploy contracts :
    const contracts = await Promise.all(nfts_to_deploy.map(async (nft) => {
      return NFTcontract.deploy({
        data: this.abi.ThetaboardNFTByteCode,
        arguments: [nft.name, "TB", `https://nft.thetaboard.io/nft/${nft.id}/`]
      }).send({from: account});
    }));
    // save contracts addresses
    await Promise.all(nfts_to_deploy.map((nft, idx) => {
      nft.nftContractId = contracts[idx]._address;
      return nft.save();
    }));
  }

  async deployNFTsSell(account, nfts_to_sell) {
    const nftDirectSell = "0x0d2bD4F9b8966D026a07D9Dc97C379AAdD64C912";
    const nftAuctionSell = "0xa061Aa177bC383369AaC266939C8A845DeF51d30";
    const thetaboard_wallet = "0xBDfc0c687861a65F54211C55E4c53A140FE0Bf32";

    const auction_nfts = nfts_to_sell.filter((x) => x.isAuction);
    const sell_nfts = nfts_to_sell.filter((x) => !x.isAuction);

    const NFTsellContract = new window.web3.eth.Contract(this.abi.ThetaboardDirectSell, nftDirectSell);
    const NFTauctionContract = new window.web3.eth.Contract(this.abi.ThetaboardAuctionSell, nftAuctionSell);

    this.utils.successNotify(`Will deploy ${sell_nfts.length} direct sell Contracts`);
    await Promise.all(sell_nfts.map(async (nft) => {
      const NFTcontract = new window.web3.eth.Contract(this.abi.ThetaboardNFT, nft.nftContractId);
      const minter_role = await NFTcontract.methods.MINTER_ROLE().call();


      // _nftAddress, _nftPrice, _maxDate, _maxMint, _artistWallet, _artistSplit
      const params = [
        nft.nftContractId,
        nft.price,
        new Date(nft.drop.get('endDate') + 'Z').getTime() / 1000,
        nft.editionNumber || 0,
        nft.drop.get('artist.walletAddr'),
        90]
      nft.nftSellController = nftDirectSell;
      return Promise.all([
        NFTcontract.methods.grantRole(minter_role, nftDirectSell).send({from: account}),
        NFTcontract.methods.grantRole(minter_role, thetaboard_wallet).send({from: account}),
        NFTsellContract.methods.newSell(...params).send({from: account})
      ]);
    }));

    this.utils.successNotify(`Will deploy ${auction_nfts.length} auctions Contracts`);
    await Promise.all(auction_nfts.map(async (nft) => {
      const NFTcontract = new window.web3.eth.Contract(this.abi.ThetaboardNFT, nft.nftContractId);
      const minter_role = await NFTcontract.methods.MINTER_ROLE().call();

      const params = [
        nft.nftContractId,
        nft.price,
        new Date(nft.drop.get('endDate') + 'Z').getTime() / 1000,
        nft.editionNumber || 0,
        nft.drop.get('artist.walletAddr'),
        90];
      nft.nftSellController = nftAuctionSell;
      return Promise.all([
        NFTcontract.methods.grantRole(minter_role, nftAuctionSell).send({from: account}),
        NFTcontract.methods.grantRole(minter_role, thetaboard_wallet).send({from: account}),
        NFTauctionContract.methods.newAuction(...params).send({from: account})
      ]);
    }));
  }

  // state for deployNFTs
  deployNFTLoading = false;

  @action
  async deployNFTs(drop) {
    this.set('deployNFTLoading', true);

    // get NFTs
    const nfts = await drop.get('nfts');
    // get metamask
    const account = await this.setupMetaMask();

    // check State for NFT deployment and deploy what is needed
    const nfts_to_deploy = nfts.filter((x) => !x.nftContractId)
    if (nfts_to_deploy.length === 0) {
      this.utils.successNotify("All NFTs are already deployed");
    } else {
      this.utils.successNotify(`Will deploy ${nfts_to_deploy.length} NFTs`);
      try {
        await this.deployNFTsContract(account, nfts_to_deploy);
        this.utils.successNotify(`Successfully deployed ${nfts_to_deploy.length} NFTs`);
      } catch (e) {
        console.log(e);
        this.set('deployNFTLoading', false);
        return this.utils.errorNotify(`There was an error deploying the NFTs`);
      }
    }

    // check state for sell Contracts and deploy what is needed
    const nfts_to_sell = nfts.filter((x) => !x.nftSellController);
    if (!drop.get('endDate') || new Date(drop.get('endDate')) < new Date()) {
      this.set('deployNFTLoading', false);
      return this.utils.errorNotify(`The drop end date is invalid`);
    } else if (!drop.get('artist.walletAddr')) {
      this.set('deployNFTLoading', false);
      return this.utils.errorNotify(`Artist need a wallet address`);
    } else if (nfts_to_sell.length === 0) {
      this.utils.successNotify("All NFTs are already ready to be sold");
    } else {
      try {
        await this.deployNFTsSell(account, nfts_to_sell);
        await Promise.all(nfts_to_sell.map((nft) => nft.save()));
        this.utils.successNotify(`Successfully deployed ${nfts_to_sell.length} Sell Contracts`);
      } catch (e) {
        console.log(e);
        this.set('deployNFTLoading', false);
        return this.utils.errorNotify(`There was an error deploying the Sell Contracts`);
      }
    }
    this.set('deployNFTLoading', false);
  }
}
