import Service from '@ember/service';
import { action } from '@ember/object';

export default class UtilsService extends Service {
  formatNumber(number, maximumFractionDigits) {
    let finalVal = 0;
    let value = Number(number) || 0;

    if (!value) {
      return finalVal;
    }

    if (maximumFractionDigits !== null && maximumFractionDigits !== undefined) {
      finalVal = Number(value).toFixed(maximumFractionDigits);
    } else {
      finalVal = value;
    }
    let parts = finalVal.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  randomHexa(length) {
    let result = '';
    const characters = '0123456789abcdef';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  @action
  copyToClipboard(inputId, message) {
    const copyText = document.querySelector(`#${inputId}`);
    const text = copyText.value || copyText.text.trim("\n");
    navigator.clipboard.writeText(text)

    $.notify(
      {
        icon: 'glyphicon glyphicon-success-sign',
        title: '',
        message: message,
      },
      {type: 'success'}
    );
  }

  @action
  errorNotify(message) {
    $.notify(
      {
        icon: 'glyphicon glyphicon-success-sign',
        title: '',
        message: message,
      },
      { type: 'danger' }
    );
  }

  @action
  successNotify(message) {
    $.notify(
      {
        icon: 'glyphicon glyphicon-success-sign',
        title: '',
        message: message,
      },
      { type: 'success' }
    );
  }
}
