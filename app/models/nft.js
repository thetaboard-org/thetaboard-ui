import Model, {attr, belongsTo, hasMany} from '@ember-data/model';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';


export default class NftModel extends Model {
  @service abi;

  @attr('string') smallDescription;
  @attr('string') description;
  @attr('string') name;
  @attr('string') image;
  @attr('string') nftContractId;
  @attr('string') nftSellController;
  @attr('number') editionNumber;
  @attr('number') price;
  @attr('string', {defaultValue: 'open'}) type;
  @attr('number') dropId;
  @attr('number') artistId;
  @belongsTo('artist') artist;
  @belongsTo('drop') drop;
  @hasMany('nft-asset', {
    async: false
  }) nftAssets;

  @computed('type')
  get isOpenEdition() {
    return this.type === 'open';
  }

  @computed('type')
  get isLimitedEdition() {
    return this.type === 'limited';
  }

  @computed('type')
  get isAuction() {
    return this.type === 'auction';
  }

  @computed('type')
  get isLimitedOrAuction() {
    return ['limited', 'auction'].includes(this.type);
  }

  get possibleTypes() {
    return ['open', 'limited', 'auction']
  }


  @computed('nftSellController', 'nftContractId')
  get blockChainInfo() {
    const fetchInfo = async () => {
      window.web3 = new Web3(this.abi.thetaRpc);
      let contractInfo;
      if (this.isAuction) {
        const NFTauctionContract = new window.web3.eth.Contract(this.abi.ThetaboardAuctionSell, this.nftSellController);
        contractInfo = await NFTauctionContract.methods.getNftAuction(this.nftContractId).call();
      } else {
        const NFTsellContract = new window.web3.eth.Contract(this.abi.ThetaboardDirectSell, this.nftSellController);
        contractInfo = await NFTsellContract.methods.getNftSell(this.nftContractId).call();
      }
      return contractInfo
    }
    return fetchInfo();
  }

  @computed('blockChainInfo')
  get blockChainInfoStr() {
    const getInfo = async () => {
      const contractInfo = await this.blockChainInfo;
      let keys = Object.keys(contractInfo);
      keys = keys.slice(keys.length / 2);
      return keys.map((x) => `${x} = ${contractInfo[x]}`).join('; ');
    }
    return getInfo();
  }

  @computed('nftContractId')
  get totalMinted() {
    const fetchInfo = async () => {
      window.web3 = new Web3(this.abi.thetaRpc);
      const NFTContract = new window.web3.eth.Contract(this.abi.ThetaboardNFT, this.nftContractId);
      return await NFTContract.methods.totalSupply().call();
    }
    return fetchInfo();
  }

  @computed('blockChainInfo')
  get minBid() {
    const fetchInfo = async () => {
      const contractInfo = await this.blockChainInfo;
      return contractInfo.minBid;
    }
    if (this.isAuction) {
      return fetchInfo();
    } else {
      return null;
    }
  }

  // used to be able to parse an id automatically
  @computed('price', 'id')
  get price_id() {
    return `${this.price}.${String("0000000" + this.id).slice(-7)}`
  }
}
