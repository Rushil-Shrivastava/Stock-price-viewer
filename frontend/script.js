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

    ////////// CHECK IF THE TAG ALREADY EXISTS
    const exists = priceChart && priceChart.data.datasets.some(ds => ds.label === symbol);
    if (exists) {
        console.log(`Symbol ${symbol} already on chart, skipping.`);
        return;
    }

    try {
        const response = await fetch(`http://localhost:8000/intraday/${symbol}`);
        const datajson = await response.json(); 

        ////////// PREPARE THE CHART DATA
        const chartLabel = datajson.map(point => (point.time));
        const chartData = datajson.map(point => (point.close));
        const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;


        ////////// APPEND THE INNER HTML WITH PERCENTAGE CHANGE
        const lastPrice = chartData[chartData.length - 1];
        const firstPrice = chartData[0];
        const changePct = (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2);
        
        const infoDiv = document.getElementById("stock-info");
        const stockLine = document.createElement("h5");
        stockLine.innerHTML = `${symbol}: $${lastPrice.toFixed(2)} (${changePct}%)`;
        document.getElementById("label-percentage").innerHTML = "Percentage change in stocks"

        infoDiv.appendChild(stockLine);

        ////////// CREATE THE CHART
        if (!priceChart) {
            priceChart = new Chart(chartCtx, {
                type: "line",
                data: {
                    labels: chartLabel,
                    datasets: []
                },
                options: {
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'minute',
                                displayFormats: { minute: 'HH:mm' },
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
        }

        ////////// PUSH THE NEW DATA INTO THE PRICE CHART
        priceChart.data.datasets.push({
            label: symbol,
            data: chartData,
            borderColor: color,
            backgroundColor: color,
            fill: false,
            tension: 0.1
        });

        priceChart.update();

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
