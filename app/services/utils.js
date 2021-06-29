import Service from '@ember/service';
import { action } from '@ember/object';

export default class UtilsService extends Service {
  @action
  copyToClipboard(textToCopy, message) {
    var textarea = document.createElement('textarea');
    textarea.textContent = textToCopy;
    document.body.appendChild(textarea);
    var selection = document.getSelection();
    var range = document.createRange();
    range.selectNode(textarea);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
    document.body.removeChild(textarea);
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
