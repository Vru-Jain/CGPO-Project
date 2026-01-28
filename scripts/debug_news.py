import yfinance as yf
msft = yf.Ticker("MSFT")
news = msft.news
if news:
    print("Keys in first news item:", news[0].keys())
    print("First item:", news[0])
else:
    print("No news found.")
