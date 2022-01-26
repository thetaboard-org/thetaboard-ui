import Component from '@glimmer/component';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
// Unfortunate usage of thetajs to get the EVM error
const thetajs = require("@thetalabs/theta-js");
const provider = new thetajs.providers.HttpProvider(thetajs.networks.ChainIds.Mainnet);


export default class DropComponent extends Component {
  @service session;
  @service utils;
  @service abi;

  get drop() {
    return this.args.drop;
  }

  get isAdmin() {
    return this.session.currentUser.user.scope === 'Admin'
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
  async concludeAuctions(drop) {
    try {
      const nfts = await drop.get('nfts');
      const auctions_nft = nfts.filter((x) => x.isAuction);
      if (auctions_nft.length === 0) {
        return this.utils.successNotify("No auction to conclude");
      }
      await Promise.all(auctions_nft.map(async (nft) => {
        const bidsInfo = await nft.blockChainInfo;
        if (!bidsInfo.concluded) {
          // get an ordered array with index order of highest to lowest bid
          const bidsValue = bidsInfo.bidsValue.map(Number);
          const bidsValueSorted = [...bidsValue].sort((a, b) => b - a);
          const indices = bidsValue.map(x => {
            const index = bidsValueSorted.indexOf(x);
            // once we picked an index we set it to null, to not pick it again.
            bidsValueSorted[index] = null;
            return index;
          });
          const account = await this.setupMetaMask();
          const NFTauctionContract = new window.web3.eth.Contract(this.abi.ThetaboardAuctionSell, nft.nftSellController);
          return NFTauctionContract.methods.concludeAuction(nft.nftContractId, indices).send({
            from: account
          });
        } else {
          return null;
        }
      }));
    } catch (e) {
      this.utils.errorNotify(e);
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
    window.web3 = new Web3(ethereum);
    const accounts = await ethereum.request({method: 'eth_requestAccounts'});
    return accounts[0];
  }


  async deployNFTsContracts(account, nfts_to_deploy) {
    const managerContract = new window.web3.eth.Contract(this.abi.ThetaboardDeploymentManager, this.abi.ThetaboardDeploymentManagerAddr);
    await Promise.all(nfts_to_deploy.map(async (nft) => {
      let sellAddress, contractFunction;
      if (nft.isAuction) {
        contractFunction = managerContract.methods.deployNFTandAuction;
        sellAddress = this.abi.ThetaboardAuctionSellAddr
      } else {
        contractFunction = managerContract.methods.deployNFTandSell;
        sellAddress = this.abi.ThetaboardDirectSellAddr
      }
      const minterRoles = ["0xBDfc0c687861a65F54211C55E4c53A140FE0Bf32", nft.drop.get('artist.walletAddr'), sellAddress];

      // name, url, toBeMinters[],
      // directSellContract, price, endDate,
      // editionNumber, artistWallet, split

      const params = [nft.name, `https://nft.thetaboard.io/nft/${nft.id}/`, minterRoles, sellAddress,
        nft.price,
        new Date(nft.drop.get('endDate') + 'Z').getTime() / 1000,
        nft.editionNumber || 0,
        nft.drop.get('artist.walletAddr'),
        90];
      return contractFunction(...params).send({from: account}).then((transaction)=>{
        nft.nftSellController = sellAddress;
        nft.nftContractId = transaction.events.NFTDeployed.returnValues.nftContract;
        return nft.save();
      })

    }));
  }

  // state for deployNFTs
  deployNFTLoading = false;

  @action
  async deployNFTs(drop) {
    this.deployNFTLoading = true;

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
        await this.deployNFTsContracts(account, nfts_to_deploy);
        this.utils.successNotify(`Successfully deployed ${nfts_to_deploy.length} NFTs`);
      } catch (e) {
        console.log(e);
        this.deployNFTLoading = false;
        return this.utils.errorNotify(`There was an error deploying the NFTs`);
      }
    }
    drop.isDeployed = true;
    await drop.save();
    this.deployNFTLoading = false;
  }
}
