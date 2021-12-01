import Component from '@glimmer/component';
import {inject as service} from '@ember/service';

export default class MenuComponent extends Component {
  @service currentUser;
  @service intl;

  menuItems = [
    {
      name: 'menu.dashboard',
      icon: 'icon-chart-pie-36',
      route: 'dashboard',
    },
    {
      name: 'menu.wallet',
      icon: 'icon-wallet-43',
      route: 'wallet.explorer',
      children: [
        {name: 'menu.wallet', icon: 'icon-money-coins', route: 'wallet.explorer'},
        {name: 'menu.nft', icon: 'icon-image-02', route: 'wallet.nft'},
      ],
    },
    {
      name: 'menu.marketplace', icon: 'icon-refresh-02', route: 'marketplace.drops',
      children: [
        {name: 'menu.drops', icon: 'icon-app', route: 'marketplace.drops'},
      ],
    },
    {
      name: 'menu.staking', icon: 'icon-align-center', route: 'staking.tfuel',
      children: [
        {name: 'menu.tfuel', image: 'tfuel-white.png', route: 'staking.tfuel'},
        {name: 'menu.theta', image: 'theta-white.png', route: 'staking.theta'},
        {name: 'menu.tfuel_vip', image: 'tfuel-white.png', route: 'staking.tfuelvip'},
      ],
    },
    {
      name: 'menu.domain',
      icon: 'icon-book-bookmark',
      route: 'domain',
    },
    {name: 'menu.faq', icon: 'icon-compass-05', route: 'faq'},
    {
      name: 'menu.creators', icon: 'icon-align-center', route: 'creators.artists', scope: ['Admin', 'Creator'],
      children: [
        {name: 'menu.creators', image: 'tfuel-white.png', route: 'creators.artists'},
        {name: 'menu.drops', image: 'tfuel-white.png', route: 'creators.drops'}
      ],
    },
  ];
  @service router;

  get routeName() {
    if (this.router && this.router.currentRoute) {
      return this.router.currentRoute.name;
    }
    return '';
  }

  get menuItemList() {
    return this.menuItems.reduce((acc, x) => {
      // only show non-admins menus if not admin
      if (x.scope && !(this.currentUser.user && x.scope.includes(this.currentUser.user.scope))) {
        return acc;
      }
      const result = {
        name: x.name,
        classActive: this.routeName === x.route,
        icon: x.icon,
        route: x.route,
      };
      if (x.children) {
        result.children = x.children.map((child) => {
          return {
            name: child.name,
            classActive: this.routeName === child.route,
            icon: child.icon,
            image: child.image,
            route: child.route,
          };
        });
      }
      acc.push(result);
      return acc;
    }, []);
  }
}
