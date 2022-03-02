import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NftInfoRoute extends Route {
  @service abi;
  @service domain;

  activate() {
    this._super(...arguments);
    // scroll to the top of the page
    window.scrollTo(0, 0);
  }

  async model(params) {
    const fetched = await fetch(`/api/explorer/wallet-info/${params.contractAddr}/${params.tokenId}`);
    const nftInfo = await fetched.json();
    // Some hack because we don't have an ember object but just a raw NFT
    if (
      !!Object.keys(nftInfo.properties).length &&
      nftInfo.properties.assets &&
      nftInfo.properties.assets.length !== 0 &&
      nftInfo.properties.assets[0].type === 'video'
    ) {
      nftInfo.isFirstAssetVideo = true;
      const asset = nftInfo.properties.assets.shift();
      nftInfo.firstAsset = asset.asset;
    }
    nftInfo.nftContractId = params.contractAddr;
    const tns = await this.domain.getReverseName(params.contractAddr);
    if (tns && tns.domain) {
      nftInfo.contractTns = tns.domain;
    }

    return { nft: this.store.createRecord('nft', nftInfo) };
  }
}
