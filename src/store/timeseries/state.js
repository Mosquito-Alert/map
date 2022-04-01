export default function () {
  return {
    dates: [],
    data: [],
    chart: {
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        elements: {
          point: {
            borderWidth: 0,
            radius: 0
          }
        },
        scales: {
          y: {
            grid: {
              drawBorder: false,
              lineWidth: 0.5
            }
          },
          x: {
            bounds: 'data',
            grid: {
              display: false
            },
            ticks: {
              autoSkip: false
            },
            type: 'time',
            time: {
              unit: 'month',
              displayFormats: {
                month: 'MMM YY',
                day: 'DD MMM YYYY'
              }
            }
          }
        }
      }
    }
  }
}
