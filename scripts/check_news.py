import yfinance as yf
tickers = ["AAPL", "MSFT"]
msft = yf.Ticker("MSFT")
print("News for MSFT:")
try:
    news = msft.news
    for n in news[:3]:
        print(n)
except Exception as e:
    print("Error fetching news:", e)
