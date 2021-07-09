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

  element.innerText = finalVal.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
});
