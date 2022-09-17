import Component from '@glimmer/component';
import {action} from '@ember/object';


export default class NftComponent extends Component {
  get nft(){
    return this.args.nft
  }

  @action
  async saveNFT(nft) {
    try {
      await nft.save();
      // adding the NFT id is required for newly created NFTs
      nft.nftAssets = nft.nftAssets.map((asset) => {
        asset.nftId = nft.get('id');
        return asset;
      });
      await nft.nftAssets.save();
      this.utils.successNotify("NFT saved successfully");
    } catch (e) {
      console.error(e);
      this.utils.errorNotify(e.errors.message);
    }
  }

  @action
  async uploadImage(drop, property, file) {
    try {
      file.name = 'nft/' + file.name;
      const response = await file.upload('/nft/assets/upload');
      drop[property] = response.body.fileUrl;
      this.utils.successNotify("Successfully uploaded");
    } catch (e) {
      console.error(e);
      this.utils.errorNotify("upload failed");
      this.utils.errorNotify(e.errors.message);
    }
  }

  @action
  async delete(nft) {
    try {
      await nft.destroyRecord();
      this.utils.successNotify("NFT deleted successfully");
    } catch (e) {
      this.utils.errorNotify(e.errors.message);
    }
  }


  @action
  async deleteAsset(asset) {
    try {
      await asset.destroyRecord();
      this.utils.successNotify("Asset deleted successfully");
    } catch (e) {
      this.utils.errorNotify(e.errors.message);
    }
  }


  @action
  async newAsset(nft) {
    const newAsset = await this.store.createRecord('NFT-asset', {
      nftId: nft.get('id')
    });
    nft.nftAssets.addObject(newAsset)
  }

}
