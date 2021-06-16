import { camelize } from '@ember/string';
import JSONAPISerializer from '@ember-data/serializer/json-api';
import { dasherize } from '@ember/string';

export default class ApplicationSerializer extends JSONAPISerializer {
  keyForAttribute(attr, method) {
    if (method == 'deserialize') {
      return dasherize(attr);
    }
    return camelize(attr);
  }
}