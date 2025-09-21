const chartCtx = document.getElementById("price-chart");
const input = document.getElementById('stock-select');
const datalist = document.getElementById('suggestions');
let priceChart = null;

let allSymbols = [];

async function fetchSymbols() {
    try {
        const response = await fetch("http://localhost:8000/symbols");
        allSymbols = await response.json();
        
    } catch (error) {
        console.error("Failed to load symbols:", error);
    }
}

async function fetchAndDisplayPrice(symbol) {
    if (!symbol) return;

    try {
        const response = await fetch(`http://localhost:8000/intraday?symbol=${symbol}`);
        const data = response.json();

        const chartLabel = data.map(point => (
            [point.time]
        ));

        const chartData = data.map(point => (
            [point.close]
        ));

        if (priceChart) {
            priceChart.destroy();
        }
        console.log("Chart data:", chartData);
        priceChart = new Chart(chartCtx, {
            type: "line",
            data: {
                datasets: [{
                    labels: chartLabel,
                    data: chartData,
                    borderColor: "rgba(0, 123, 255, 0.7)",
                    backgroundColor: "rgba(0, 123, 255, 0.3)",
                    fill: true,
                    tension: 0.2,
                    pointRadius: 2 
                }]
            },
            options: {
                parsing: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            tooltipFormat: "yyyy-MM-dd HH:mm",
                            unit: 'minute'
                        },
                        title: { display: true, text: 'Time' }
                    },
                    y: {
                        beginAtZero: false,
                        title: { display: true, text: 'Price (USD)' }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Failed to load intraday stock price ", error);
    }
}


document.getElementById("stock-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const symbol = input.value;
    fetchAndDisplayPrice(symbol);
});

input.addEventListener('input', () => {
    const query = input.value.toLowerCase();

    const symbolsOnly = allSymbols.map(s => s?.symbol).filter(s => s);
    const filtered = symbolsOnly
        .filter(s => s.toLowerCase().startsWith(query))
        .concat(symbolsOnly.filter(s => s.toLowerCase().includes(query) && !s.toLowerCase().startsWith(query)))
        .slice(0, 5);

    datalist.innerHTML = '';

    filtered.forEach(symbol => {
        const option = document.createElement('option');
        option.value = symbol;
        datalist.appendChild(option);
    });
});

window.onload = fetchSymbols;
