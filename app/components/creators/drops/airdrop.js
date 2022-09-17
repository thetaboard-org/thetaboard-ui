import Component from '@glimmer/component';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';


export default class AirdropComponent extends Component {
  @service session;
  @service utils;
  @service abi;

  get artists() {
    return this.args.artists;
  }

  get nfts() {
    return this.args.nfts;
  }

  get isAdmin() {
    return this.session.currentUser.user.scope === 'Admin'
  }

  @action
  async saveAirdrop(airdrop) {
    try {
      await airdrop.save();
      this.utils.successNotify("Drop saved successfully");
    } catch (e) {
      console.error(e);
      this.utils.errorNotify(e.errors.message);
    }
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
      return contractFunction(...params).send({from: account}).then((transaction) => {
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
