import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';

export default class PriceChartComponent extends Component {
  @tracked time_range = 'year';
  @service intl;
  @service('theta-sdk') thetaSdk;

  get chartData() {
    let historic_data = {};
    if (this.time_range === 'week') {
      historic_data = this.args.historic_price.dailyPrice
        .splice(this.args.historic_price.dailyPrice.length - 7, this.args.historic_price.dailyPrice.length);

    } else if (this.time_range === 'month') {
      historic_data = this.args.historic_price.dailyPrice
        .splice(this.args.historic_price.dailyPrice.length - 30, this.args.historic_price.dailyPrice.length);
    } else {
      historic_data = this.args.historic_price.dailyPrice;
    }
    const labels = historic_data.map((x) => x.date);
    const theta_price = historic_data.map((x) => x["theta-price"]);
    const tfuel_price = historic_data.map((x) => x["tfuel-price"]);
    const ratio = theta_price.map((n, i) => n / tfuel_price[i]);
    return {
      labels: labels,
      datasets: [
        {
          label: 'Theta',
          pointStyle: 'point',
          yAxisID: 'theta',
          radius: 0,
          borderColor: '#2BB7E5',
          pointBackgroundColor: '#2BB7E5',
          data: theta_price,
          borderWidth: 1,
        },
        {
          label: 'Tfuel',
          yAxisID: 'tfuel',
          pointStyle: 'point',
          radius: 0,
          borderColor: '#FFA500',
          pointBackgroundColor: '#FFA500',
          data: tfuel_price,
          borderWidth: 1,
        },
        {
          label: this.intl.t('global.ratio_theta_tfuel'),
          yAxisID: 'ratio',
          pointStyle: 'point',
          radius: 0,
          borderColor: '#5C5852FF',
          pointBackgroundColor: '#5C5852FF',
          data: ratio,
          borderWidth: 1,
        },
      ],
    };
  }

  @action
  setupChart() {
    moment.locale("nl");

    const element = document.getElementById('lineChartExample');
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    const gradientChartOptionsConfiguration = {
      maintainAspectRatio: false,
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          fontColor: '#ccc',
        },
      },
      tooltips: {
        callbacks: {
          title: (tooltipItem) => {
            return moment(new Date(tooltipItem[0].label)).format('LL');
          },
          label: (tooltipItem) => {
            if (tooltipItem.datasetIndex === 2) {
              return `1 Theta ${this.intl.t('price_chart.is_worth')} ${Math.round(Number(tooltipItem.yLabel), 1)} Tfuels`;
            }
            if (Number(tooltipItem.yLabel) > 0.01) {
              return formatter.format(Number(tooltipItem.yLabel));
            } else {
              return `$${Number(tooltipItem.yLabel)}`;
            }
          },
        },
        backgroundColor: '#fff',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: 'nearest',
        intersect: 0,
        position: 'nearest',
      },
      responsive: true,
      scales: {
        yAxes: [
          {
            id: 'theta',
            type: 'linear',
            ticks: {
              min: 0,
              fontColor: '#2BB7E5',
              beginAtZero: true,
              maxTicksLimit: 10,
              callback: function (value) {
                return formatter.format(Number(value.toString()));
              },
            },
          },
          {
            id: 'tfuel',
            type: 'linear',
            position: 'right',
            ticks: {
              min: 0,
              fontColor: '#FFA500',
              beginAtZero: true,
              maxTicksLimit: 10,
              callback: function (value) {
                return formatter.format(Number(value.toString()));
              },
            },
          },
          {
            id: 'ratio',
            display: false
          },
        ],
        xAxes: [
          {
            type: 'time',
            time: {
              unit: 'month',
            },
            ticks: {
              maxTicksLimit: 10,
              min: 0,
              fontColor: '#ccc',
              beginAtZero: true,
            },
          },
        ],
      },
      plugins: {
        datalabels: {
          display: () => {
            return null;
          }, // This is a hack so it doesn't display any label
        },
      },
    };
    const ctx = element.getContext('2d');
    const data = this.chartData;
    this.historic_data_chart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: gradientChartOptionsConfiguration,
    });
  }

  @action
  updateData() {
    this.historic_data_chart.data = this.chartData;
    if (this.time_range === 'week') {
      this.historic_data_chart.options.scales.xAxes[0].time.unit = 'day';
    } else if (this.time_range === 'month') {
      this.historic_data_chart.options.scales.xAxes[0].time.unit = 'week';
    } else {
      this.historic_data_chart.options.scales.xAxes[0].time.unit = 'month';
    }
    this.historic_data_chart.update();
  }

  @action
  updateTimeRange(value) {
    this.time_range = value;
    this.updateData();
  }
}
