import Component from '@glimmer/component';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';


export default class AirdropComponent extends Component {
  @service session;
  @service utils;
  @service abi;
  @service store;
  @service metamask;

  get nfts() {
    return this.args.nfts;
  }

  get airdrop() {
    return this.args.airdrop;
  }

  @action
  async saveAirdrop() {
    try {
      const giftNft = await this.airdrop.get('giftNft');
      await giftNft.save();
      this.airdrop.giftNftId = giftNft.get('id');
      const sourceNft = await this.airdrop.get("sourceNft");
      this.airdrop.sourceNftId = sourceNft.get('id');
      //Objects are saved, get address and do deployment
      this.airdrop.winners = await sourceNft.getRandomOwners(this.airdrop.count);
      await this.airdrop.save();
      this.utils.successNotify("Airdrop saved successfully");
    } catch (e) {
      console.error(e);
      this.utils.errorNotify(e.errors.message);
    }
  }

  @action
  async uploadImage(file) {
    try {
      file.name = 'nft/' + file.name;
      const response = await file.upload('/nft/assets/upload');
      const nft = await this.airdrop.get('giftNft');
      nft.image = response.body.fileUrl;
      this.utils.successNotify("Successfully uploaded");
    } catch (e) {
      console.error(e);
      this.utils.errorNotify("upload failed");
      this.utils.errorNotify(e.errors.message);
    }
  }

  async deployAirdrop() {
    const signer = this.metamask.provider.getSigner();
    const giftNft = await this.airdrop.get('giftNft');
    if (!giftNft.nftContractId) {
      const factory = new ethers.ContractFactory(this.abi.ThetaboardNFT, this.abi.ThetaboardNFTByteCode, signer)
      const contract = await factory.deploy(giftNft.name, `TB`, `https://nft.thetaboard.io/nft/${giftNft.id}/`);
      giftNft.nftContractId = contract.address;
      await giftNft.save();
      this.utils.successNotify("NFT deployed");
    }
    const NFTcontract = new ethers.Contract(giftNft.nftContractId, this.abi.ThetaboardNFT, signer);
    await Promise.all(this.airdrop.winners.split(',').map(async (x)=>{
      return NFTcontract.mint(x);
    }));
    this.airdrop.isDeployed = true;
    await this.airdrop.save()

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
