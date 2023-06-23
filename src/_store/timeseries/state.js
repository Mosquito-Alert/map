export default function () {
  return {
    toggling: false,
    graphIsVisible: false,
    completeDatesRange: {},
    // dates: [],
    // data: [],
    cache: {
      dates: [],
      data: []
    },
    Data: {
      dates: [],
      data: []
    },
    chart: {
      options: {
        animation: {},
        responsive: true,
        plugins: {
          legend: { display: false },
          zoom: {
            pan: {
              modifierKey: 'shift',
              enabled: true,
              mode: 'x'
            },
            zoom: {
              mode: 'x',
              drag: {
                enabled: true,
                backgroundColor: 'rgba(239, 165, 1, 0.3)'
              },
              pinch: {
                enabled: true
              }
            }
          }
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
              // autoSkip: true
            },
            type: 'time',
            time: {
              unit: 'month',
              displayFormats: {
                month: 'MMM YY',
                day: 'DD MMM YY'
              }
            }
          }
        }
      }
    }
  }
}
