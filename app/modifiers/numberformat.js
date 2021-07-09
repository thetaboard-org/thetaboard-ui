import { modifier } from 'ember-modifier';

export default modifier(function numberformat(element, params) {
  let finalVal = 0;
  let value = params[0] || 0;
  let maximumFractionDigits = params[1];

  if (!value) {
    element.innerText = finalVal;
  }

  if (maximumFractionDigits !== null && maximumFractionDigits !== undefined) {
    finalVal = Number(value).toFixed(maximumFractionDigits);
  } else {
    finalVal = value;
  }
  let parts = finalVal.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  element.innerText = parts.join('.');
  // element.innerText = finalVal.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
});
