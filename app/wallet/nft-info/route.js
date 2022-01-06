import Route from '@ember/routing/route';

export default class NftInfoRoute extends Route {

  activate() {
    this._super(...arguments);
    // scroll to the top of the page
    window.scrollTo(0, 0);
  }

  async model(params) {
    const fetched = await fetch(`/explorer/wallet-info/${params.contractAddr}/${params.tokenId}`);
    const nftInfo = await fetched.json();
    // Some hack because we don't have an ember object but just a raw NFT
    if(nftInfo.properties.assets.length !== 0 && nftInfo.properties.assets[0].type === "video"){
      nftInfo.isFirstAssetVideo = true;
      const asset = nftInfo.properties.assets.shift();
      nftInfo.firstAsset = asset.asset;
    }

    return {nft: nftInfo};
  }
}
