import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import config from 'thetaboard-ui/config/environment';

export default class TransactionsExportComponent extends Component {
  constructor(...args) {
    super(...args);
    this.initDate();
  }

  @service currency;
  @service thetaSdk;
  @service utils;
  @service intl;
  @service i18n;
  @service isMobile;

  @tracked showComponent = false;
  @tracked minStartDate = '2021-01-01';
  @tracked minDate = '2021-01-01';
  @tracked maxEndDate = 'today';
  @tracked maxDate = 'today';
  @tracked startDate;
  @tracked endDate;

  @action
  showComp() {
    this.initDate();
    this.showComponent = true;
  }

  @action
  resetComp() {
    this.initDate();
    this.showComponent = false;
  }

  @action
  onStartDateChange(_selectedDates, _dateStr) {
    if (!_selectedDates[0] || _selectedDates[0] < new Date('2021-01-01:00:00:00')) {
      this.utils.errorNotify(this.intl.t('export.date_incorrect'));
      this.minDate = '2021-01-01';
      this.startDate = '2021-01-01';
      return;
    }
    this.minDate = _dateStr;
    this.startDate = _dateStr;
  }

  @action
  onEndDateChange(_selectedDates, _dateStr) {
    if (!_selectedDates[0] || _selectedDates[0] > new Date()) {
      this.utils.errorNotify(this.intl.t('export.date_incorrect'));
      this.maxDate = 'today';
      this.endDate = this.formatDate();
      return;
    }
    this.maxDate = _dateStr;
    this.endDate = _dateStr;
  }

  @action
  submit() {
    const params = {
      startDate: this.startDate,
      endDate: this.endDate,
      currency: this.currency.currentCurrency.name,
      wallets: this.walletList,
    };
    const queryString = Object.keys(params)
      .map((key) => key + '=' + params[key])
      .join('&');
    let self = this;
    document.getElementById('my_iframe').onload = function () {
      var that = $(this)[0];
      that.contentDocument;
      self.utils.errorNotify(self.intl.t('export.nedd_fifty_percent'));
    };
    const url = `${config.downloadCsvUrl}?${queryString}`;
    document.getElementById('my_iframe').src = url;
    this.utils.successNotify(this.intl.t('export.generating'));
  }

  get canSubmit() {
    return this.startDate && this.endDate;
  }

  get walletList() {
    const allWallets = this.thetaSdk.walletList.map((x) => x.wallet_address.toLowerCase());
    return [...new Set(allWallets)];
  }

  initDate() {
    this.endDate = this.formatDate();
    this.startDate = '2021-01-01';
  }

  formatDate(date) {
    const d = date ? new Date(date) : new Date(),
      year = d.getFullYear();
    let month = '' + (d.getMonth() + 1),
      day = '' + d.getDate();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }
}
