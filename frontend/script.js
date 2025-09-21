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
        const response = await fetch(`http://localhost:8000/intraday/${symbol}`);
        const datajson = await response.json(); 

        console.log(datajson);

        const chartLabel = datajson.map(point => (
            point.time
        ));

        const chartData = datajson.map(point => (
            point.close
        ));

        const data = {
            labels: chartLabel,
            datasets: [{
                label: symbol,
                data: chartData,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };

        if (priceChart) {
            priceChart.destroy();
        }

        priceChart = new Chart(chartCtx, {
            type: "line",
            data: data,
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute',
                            displayFormats: {
                                minute: 'HH:mm'
                            },
                            tooltipFormat: 'yyyy-LL-dd HH:mm'
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
