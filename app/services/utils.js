import Service from '@ember/service';
import { action } from '@ember/object';

export default class UtilsService extends Service {
  @action
  copyToClipboard(inputId, message) {
    var copyText = document.querySelector(`#${inputId}`);
    copyText.select();
    document.execCommand("copy");


    $.notify(
      {
        icon: 'glyphicon glyphicon-success-sign',
        title: 'Success!!',
        message: message,
      },
      { type: 'success' }
    );
  }

  @action
  errorNotify(message) {
    $.notify(
      {
        icon: 'glyphicon glyphicon-success-sign',
        title: 'Error',
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
        title: 'Success!',
        message: message,
      },
      { type: 'success' }
    );
  }
}
