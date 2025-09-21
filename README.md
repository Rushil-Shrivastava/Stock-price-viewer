Stock Price Viewer

A simple stock price viewer with live intraday charting and autocomplete search. The project consists of a FastAPI backend that serves stock symbols and intraday prices, and a frontend that displays the chart and allows searching for stocks.

Features
1. Fetches stock symbols from backend /symbols endpoint.
2. Autocomplete search with top matches.
3. Live intraday price chart using Chart.js.
4. Graceful fallback if backend data is empty.

Setup Instructions
1. Create a Python Virtual Environment
```
python3 -m venv .venv
source .venv/bin/activate       # macOS/Linux
.venv\Scripts\activate          # Windows
```

2. Install Dependencies
```
pip install -r requirements.txt
```

3. Start the Backend (FastAPI)
```
cd backend
uvicorn app:app --reload
```

The backend will be available at http://localhost:8000.

Endpoints:

/symbols → returns a list of stock symbols

/intraday?symbol=<SYMBOL> → returns intraday price data for a stock

4. Start the Frontend

You have two options:

Option 1: Live Server (VSCode recommended)

Open the frontend folder in VSCode.

Right-click index.html → Open with Live Server.

Option 2: Python HTTP Server
```
cd frontend
python3 -m http.server 3000
```

Open your browser at http://localhost:3000.

Usage

1. Start the backend server.
2. Open the frontend in your browser.
3. Type a stock symbol in the search input — top matches will appear dynamically.
4. Select a symbol and submit to view the intraday price chart.

Notes
1. The datalist is limited to top 20 matches to keep dropdowns manageable.
2. If the backend API fails or returns empty, a local CSV fallback ensures symbols are still available.
3. Chart.js is used for smooth line charts with interactive tooltips.