import Component from '@glimmer/component';
import {inject as service} from '@ember/service';

export default class MenuComponent extends Component {
  @service currentUser;
  @service intl
  menuItems = [
    {
      name: this.intl.t('menu.dashboard'),
      icon: 'icon-chart-pie-36',
      route: 'dashboard',
    },
    {
      name: this.intl.t('menu.wallet'),
      icon: 'icon-wallet-43',
      route: 'wallet',
    },
    {
      name: this.intl.t('menu.staking'), icon: 'icon-align-center', route: 'staking.tfuel',
      children: [
        { name: 'Tfuel', icon: 'tfuel-white.png', route: 'staking.tfuel' },
        { name: 'Theta', icon: 'theta-white.png', route: 'staking.theta' },
        { name: this.intl.t('menu.tfuel_vip'), icon: 'tfuel-white.png', route: 'staking.tfuelvip' },
      ],
    },
    {
      name: this.intl.t('menu.domain'),
      icon: 'icon-book-bookmark',
      route: 'domain',
    },
    { name: this.intl.t('menu.faq'), icon: 'icon-compass-05', route: 'faq' },
    { name: 'guardian', icon: 'icon-align-center', route: 'guardian', scope: 'Admin' },
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
      if (x.scope && !(this.currentUser.user && x.scope === this.currentUser.user.scope)) {
        return acc
      }
      const result = {
        name: x.name,
        classActive: this.routeName === x.name,
        icon: x.icon,
        route: x.route ? x.route : x.name
      };
      if (x.children) {
        result.children = x.children.map((child) => {
          return {
            name: child.name,
            classActive: this.routeName === child.route,
            icon: child.icon,
            route: child.route,
          };
        });
      }
      acc.push(result);
      return acc;
    }, []);
  }
}
