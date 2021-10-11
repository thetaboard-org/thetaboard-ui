import Route from '@ember/routing/route';

export default class NftInfoRoute extends Route {
  async model(params) {
    const fetched = await fetch(`/explorer/wallet-info/${params.contractAddr}/${params.tokenId}`);
    const nftInfo = await fetched.json();
    return { nft: nftInfo };
  }
}
