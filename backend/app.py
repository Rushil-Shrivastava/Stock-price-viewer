from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import pandas as pd
from io import StringIO
import os

app = FastAPI()

API_KEY = "08SGVBYBX04UFJ7H"
LISTING_URL = f"https://www.alphavantage.co/query?function=LISTING_STATUS&apikey={API_KEY}"
BASE_URL = "https://www.alphavantage.co/query"
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

symbol_cache = None

@app.get("/symbols")
def get_symbols(force_refresh: bool = False):
    global symbol_cache
    if symbol_cache and not force_refresh:
        return symbol_cache
    
    df = None
    try:
        response = requests.get(LISTING_URL, timeout=10)
        response.raise_for_status()
        df = pd.read_csv(StringIO(response.text), encoding='utf-8-sig')
        if 'assetType' in df.columns:
            df['assetType'] = df['assetType'].astype(str).str.replace(r'\s+', '', regex=True)
            df = df[df['assetType'].str.lower() == 'stock']
    except Exception as e:
        df = None
        print("API fetch failed:", e)

    if df is None or df.empty:
        local_csv_path = os.path.join(os.path.dirname(__file__), "listing_status.csv")
        if not os.path.exists(local_csv_path):
            raise HTTPException(status_code=500, detail="No symbols available and local CSV not found")
        df = pd.read_csv(local_csv_path, encoding='utf-8-sig')
        if 'assetType' in df.columns:
            df['assetType'] = df['assetType'].astype(str).str.replace(r'\s+', '', regex=True)
            df = df[df['assetType'].str.lower() == 'stock']

    df = df.where(pd.notnull(df), None)

    columns_to_use = [col for col in ['symbol', 'name'] if col in df.columns]
    symbols = df[columns_to_use].to_dict(orient='records')

    symbol_cache = symbols
    print(f"Returning {len(symbols)} symbols")
    return symbols

@app.get("/intraday/{symbol}")
def get_intraday_prices(symbol: str, interval: str = "5min"):
    url = "https://www.alphavantage.co/query"
    params = {
        "function": "TIME_SERIES_INTRADAY",
        "symbol": symbol,
        "interval": interval,
        "apikey": API_KEY,
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()

    time_series_key = f"Time Series ({interval})"
    time_series = data.get(time_series_key, {})

    processed_data = [
        {"time": pd.to_datetime(timestamp).isoformat(), "close": float(values["4. close"])}
        for timestamp, values in sorted(time_series.items())
    ]

    return processed_data
