import Controller from '@ember/controller';

export default class DropController extends Controller {
  get drop() {
    return this.model.drop;
  }

  get nfts(){
    if(!this.model.drop.get('nfts')){
      return []
    } else {
      return this.model.drop.get('nfts').sortBy('price').reverse();
    }
  }
}
