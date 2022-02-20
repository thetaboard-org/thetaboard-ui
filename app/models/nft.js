import Model, {attr, belongsTo, hasMany} from '@ember-data/model';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';
import {ethers} from "ethers";


export default class NftModel extends Model {
  @service abi;
  @service metamask;

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


  @computed('nftSellController', 'nftContractId', 'metamask.provider')
  get blockChainInfo() {
    const fetchInfo = async () => {
      await this.metamask.initMeta();
      let contractInfo;
      let modifiableContract = {};
      if (this.isAuction) {
        const NFTauctionContract = new ethers.Contract(this.nftSellController, this.abi.ThetaboardAuctionSell, this.metamask.provider);
        contractInfo = await NFTauctionContract.getNftAuction(this.nftContractId);
        Object.assign(modifiableContract, contractInfo);
        if (Number(contractInfo.minBid) !== this.price) {
          modifiableContract.minBid = window.web3.utils.fromWei(contractInfo.minBid.toString());
        }
        modifiableContract.bidsValue = contractInfo.bidsValue.map(x => window.web3.utils.fromWei(x.toString()))
      } else {
        const NFTsellContract = new ethers.Contract(this.nftSellController, this.abi.ThetaboardDirectSell, this.metamask.provider);
        contractInfo = await NFTsellContract.getNftSell(this.nftContractId);
        Object.assign(modifiableContract, contractInfo);
      }
      return modifiableContract

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
      await this.metamask.initMeta();
      const NFTContract = new ethers.Contract(this.nftContractId, this.abi.ThetaboardNFT, this.metamask.provider);
      return await NFTContract.totalSupply();
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

  @computed()
  get isFirstAssetVideo() {
    try {
      return this.nftAssets.firstObject.isVideo;
    } catch (e) {
      return false
    }
  }

  @computed()
  get firstAsset() {
    return this.nftAssets.firstObject.asset;
  }
}

