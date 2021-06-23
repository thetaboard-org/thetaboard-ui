import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class MenuComponent extends Component {
  menuItems = [
    { name: 'dashboard', icon: 'icon-chart-pie-36' },
    { name: 'wallet', icon: 'icon-wallet-43' },
    { name: 'staking', icon: 'icon-align-center', children: 
      [
        { name: 'Tfuel', icon: 'tfuel-white.png', route: 'staking' },
        { name: 'Theta', icon: 'theta-white.png', route: 'guardian' },
      ],
    },
    { name: 'domain', icon: 'icon-book-bookmark' },
    { name: 'faq', icon: 'icon-compass-05' },
  ];
  @service router;

  get routeName() {
    if (this.router && this.router.currentRoute) {
      return this.router.currentRoute.name;
    }
    return '';
  }

  get menuItemList() {
    const finalList = [];
    finalList.push(
      ...this.menuItems.map((x) => {
        let result = {
          name: x.name,
          classActive: this.routeName === x.name,
          icon: x.icon,
        };
        if (x.children) {
          result.children = [];
          x.children.map((child) => {
            result.children.push({
              name: child.name,
              classActive: this.routeName === child.route,
              icon: child.icon,
              route: child.route,
            });
          });
        }
        return result;
      })
    );
    return finalList;
  }
}
