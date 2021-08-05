import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class HoldingPieComponent extends Component {
  @service('theta-sdk') thetaSdk;
  @service('currency') currency;
  @service('utils') utils;

  get setUpChart() {
    if (this.thetaSdk.walletList.length) {
      this.setupChart();
    }
  }

  @action
  setupChart() {
    let element = document.getElementById('pieChartExample');
    if (!element) return;
    element.remove(); // this is my <canvas> element
    $('#holding-container').append('<canvas id="pieChartExample" height="300"></canvas>');
    element = document.getElementById('pieChartExample');

    const numberWithCommas = function(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const guardian = this.thetaSdk.guardianWallets;
    let guardian_value = 0;
    let guardian_amount = 0;
    if (guardian.length > 0) {
      guardian_value = guardian.reduce((a, b) => a + b.value, 0);
      guardian_amount = guardian.reduce((a, b) => a + b.amount, 0);
    }

    const eliteEdgeNodes = this.thetaSdk.eliteEdgeNodeWallets;
    let een_value = 0;
    let een_amount = 0;
    if (eliteEdgeNodes.length > 0) {
      een_value = eliteEdgeNodes.reduce((a, b) => a + b.value, 0);
      een_amount = eliteEdgeNodes.reduce((a, b) => a + b.amount, 0);
    }

    let theta_value = this.thetaSdk.walletList.filter((x) => x.type === 'wallet' && x.currency === 'theta').reduce((a, b) => a + b.value, 0);
    let theta_amount = this.thetaSdk.walletList.filter((x) => x.type === 'wallet' && x.currency === 'theta').reduce((a, b) => a + b.amount, 0);
    let tfuel_value = this.thetaSdk.walletList.filter((x) => x.type === 'wallet' && x.currency === 'tfuel').reduce((a, b) => a + b.value, 0);
    let tfuel_amount = this.thetaSdk.walletList.filter((x) => x.type === 'wallet' && x.currency === 'tfuel').reduce((a, b) => a + b.amount, 0);
    const types = [
      {
        label: `EEN (${numberWithCommas(een_amount.toFixed(2))})`,
        value: een_value,
        color: '#ff7710',
      },
      {
        label: `Guardian (${numberWithCommas(guardian_amount.toFixed(2))})`,
        value: guardian_value,
        color: '#0f9fce',
      },
      {
        label: `Theta (${numberWithCommas(theta_amount.toFixed(2))})`,
        value: theta_value,
        color: '#58d8f5',
      },
      {
        label: `Tfuel (${numberWithCommas(tfuel_amount.toFixed(2))})`,
        value: tfuel_value,
        color: '#ffa113',
      },
    ];
    // this.thetaSdk.walletList.map((x) => x.value);
    let data = {
      datasets: [
        {
          data: types.map((x) => x.value),
          backgroundColor: types.map((x) => x.color),
          hoverOffset: 4,
          borderWidth: 1,
          borderColor: '#ddd',
        },
      ],

      // These labels appear in the legend and in the tooltips when hovering different arcs
      labels: types.map((x) => x.label),
    };
    const ctx = element.getContext('2d');
    // const data = this.chartData
    const myPieChart = new Chart(ctx, {
      type: 'pie',
      data: data,
      options: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            fontColor: '#ccc',
            usePointStyle: true,
            padding: 20,
          },
        },
        maintainAspectRatio: false,
        tooltips: {
          mode: 'label',
          callbacks: {
            label: (tooltipItem, data) => {
              const indice = tooltipItem.index;
              return (
                data.labels[indice] +
                ': ' +
                this.currency.currentCurrency.symbol +
                '' +
                this.utils.formatNumber(
                  Number(data.datasets[0].data[indice]),
                  2
                ) +
                ''
              );
            },
          },
        },
        plugins: {
          datalabels: {
            color: 'black',
            display: function (context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const curr_value = context.dataset.data[context.dataIndex];
              return (100 * curr_value) / total > 1;
            },
            font: {
              weight: 'bold',
            },
            formatter: (value, context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              return `
                ${this.currency.currentCurrency.symbol}${this.utils.formatNumber(Number(value), 2)}
                ${((100 * value) / total).toFixed(2)}%
              `;
            },
          },
        },
      },
    });
  }
}
