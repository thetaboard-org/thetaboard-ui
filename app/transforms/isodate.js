import Transform from '@ember-data/serializer/transform';


export default class isodate extends Transform {
  deserialize(serialized, options) {
    const [date, minutes, secs] = serialized.split('.')[0].split(':');
    return `${date}:${minutes}`
  }

  serialize(deserialized, options) {
    return deserialized;
  }
}
