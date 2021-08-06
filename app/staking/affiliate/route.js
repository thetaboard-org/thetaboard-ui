import Route from '@ember/routing/route';

export default class AffiliateRoute extends Route {
  async model(params) {
    if (params.affiliate) {
      return this.store
        .queryRecord('affiliate', { name: params.affiliate })
        .then((affiliate) => {
          return this.store
            .query('publicEdgeNode', {
              affiliate: affiliate.name,
            })
            .then((publicEdgeNodes) => {
              return {
                affiliate: affiliate,
                affiliatePublicEdgeNodes: publicEdgeNodes,
              };
            });
        })
        .catch((err) => {
          return this.transitionTo('staking.tfuel');
        });
    } else {
      return this.transitionTo('staking.tfuel');
    }
  }
}
