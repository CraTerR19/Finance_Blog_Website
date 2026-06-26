document.addEventListener('DOMContentLoaded', () => {
  
  // Elements: Sliders
  const sliderInvestment = document.getElementById('sliderInvestment');
  const sliderRate = document.getElementById('sliderRate');
  const sliderYears = document.getElementById('sliderYears');

  // Elements: Number Inputs
  const inputInvestment = document.getElementById('inputInvestment');
  const inputRate = document.getElementById('inputRate');
  const inputYears = document.getElementById('inputYears');

  // Elements: Results
  const resInvested = document.getElementById('resInvested');
  const resReturns = document.getElementById('resReturns');
  const resTotal = document.getElementById('resTotal');

  let sipChart;

  // Formatter for Indian Rupees
  const currencyFormatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  });

  function syncInputs(source) {
    if (source === 'slider') {
      inputInvestment.value = sliderInvestment.value;
      inputRate.value = sliderRate.value;
      inputYears.value = sliderYears.value;
    } else if (source === 'input') {
      // Basic validation bounds
      let invVal = Math.max(500, Math.min(1000000, parseFloat(inputInvestment.value) || 500));
      let rateVal = Math.max(1, Math.min(30, parseFloat(inputRate.value) || 1));
      let yearsVal = Math.max(1, Math.min(40, parseFloat(inputYears.value) || 1));

      sliderInvestment.value = invVal;
      sliderRate.value = rateVal;
      sliderYears.value = yearsVal;
    }
    updateCalculator();
  }

  function formatCompactNumber(number) {
    if (number >= 10000000) {
      return '₹' + (number / 10000000).toFixed(2) + 'Cr';
    } else if (number >= 100000) {
      return '₹' + (number / 100000).toFixed(2) + 'L';
    } else if (number >= 1000) {
      return '₹' + (number / 1000).toFixed(1) + 'K';
    }
    return '₹' + number.toString();
  }

  function updateCalculator() {
    const P = parseFloat(sliderInvestment.value);
    const expectedRate = parseFloat(sliderRate.value);
    const years = parseFloat(sliderYears.value);

    // SIP Math
    const i = (expectedRate / 100) / 12;
    const n = years * 12;

    const totalInvested = P * n;
    
    let fv = 0;
    if (i === 0) {
      fv = totalInvested;
    } else {
      fv = P * (Math.pow(1 + i, n) - 1) / i * (1 + i);
    }
    
    const estimatedReturns = fv - totalInvested;

    // Update UI Results
    resInvested.innerText = '₹' + currencyFormatter.format(Math.round(totalInvested));
    resReturns.innerText = '₹' + currencyFormatter.format(Math.round(estimatedReturns));
    resTotal.innerText = '₹' + currencyFormatter.format(Math.round(fv));

    // Update Center Text
    document.getElementById('chartCenterText').innerText = formatCompactNumber(Math.round(fv));

    // Update Chart
    updateChart(Math.round(totalInvested), Math.round(estimatedReturns));
  }

  function updateChart(invested, returns) {
    const ctx = document.getElementById('sipChart').getContext('2d');
    
    // Create Gradients for a premium look
    let gradientMint = ctx.createLinearGradient(0, 0, 0, 400);
    gradientMint.addColorStop(0, 'rgba(188, 239, 204, 1)'); // var(--primary-color)
    gradientMint.addColorStop(1, 'rgba(188, 239, 204, 0.4)');

    let gradientGold = ctx.createLinearGradient(0, 0, 0, 400);
    gradientGold.addColorStop(0, 'rgba(242, 208, 124, 1)'); // var(--secondary-color)
    gradientGold.addColorStop(1, 'rgba(242, 208, 124, 0.4)');

    if (sipChart) {
      sipChart.destroy();
    }
    
    sipChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Invested Amount', 'Est. Returns'],
        datasets: [{
          data: [invested, returns],
          backgroundColor: [gradientGold, gradientMint],
          borderColor: [
            'rgba(10, 18, 21, 1)', // Dark background to create spacing
            'rgba(10, 18, 21, 1)'
          ],
          borderWidth: 4,
          hoverOffset: 10,
          borderRadius: 5 // Rounded edges on the doughnut segments
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%', // Thinner ring for a sleeker look
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#a0a5b5',
              font: {
                family: "'Outfit', sans-serif",
                size: 13,
                weight: '500'
              },
              padding: 25,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(10, 18, 21, 0.9)',
            titleColor: '#fff',
            bodyColor: '#bcefcc',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed !== null) {
                  label += '₹' + currencyFormatter.format(context.parsed);
                }
                return label;
              }
            }
          }
        }
      }
    });
  }

  // Event Listeners for Sliders
  sliderInvestment.addEventListener('input', () => syncInputs('slider'));
  sliderRate.addEventListener('input', () => syncInputs('slider'));
  sliderYears.addEventListener('input', () => syncInputs('slider'));

  // Event Listeners for Number Inputs (trigger on input and change)
  inputInvestment.addEventListener('input', () => syncInputs('input'));
  inputRate.addEventListener('input', () => syncInputs('input'));
  inputYears.addEventListener('input', () => syncInputs('input'));
  
  // To handle edge cases where user leaves field empty or types bad data
  inputInvestment.addEventListener('change', () => syncInputs('input'));
  inputRate.addEventListener('change', () => syncInputs('input'));
  inputYears.addEventListener('change', () => syncInputs('input'));

  // Initialize
  updateCalculator();

});
