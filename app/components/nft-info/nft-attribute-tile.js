import Component from '@glimmer/component';

export default class NftInfoNftAttributeTileComponent extends Component {
  get attribute() {
    return this.args.attribute;
  }

  get hasValue() {
    return (
      !!this.args.attribute.value && this.args.attribute.trait_type !== 'style'
    );
  }

  get isValueAnObject() {
    return (
      typeof this.args.attribute.value === 'object' &&
      !Array.isArray(this.args.attribute.value) &&
      this.args.attribute.value !== null
    );
  }
}
