export const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          return `${context.label}: ${context.raw}%`;
        }
      }
    }
  }
};

export const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value: any) {
          return '₹' + value.toLocaleString();
        }
      }
    }
  },
  plugins: {
    legend: {
      position: 'top' as const,
      align: 'end' as const,
      labels: {
        boxWidth: 8,
        usePointStyle: true,
        pointStyle: 'circle'
      }
    }
  }
};

export const chartColors = [
  '#0ea5e9', // primary
  '#6366f1', // secondary
  '#10b981', // success
  '#ef4444', // danger
  '#a855f7', // purple
  '#f59e0b'  // amber
];
