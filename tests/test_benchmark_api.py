
import requests
import json

def test_benchmark_api():
    base_url = "http://127.0.0.1:8000"
    
    # Test 1: Default (SPY, QQQ) - Legacy behavior (though we changed implementation, it should still work if no ticker param?? wait, we changed logic)
    # Actually, my code: `tickers = [ticker] if ticker else None`. 
    # If None, loader defaults to SPY/QQQ.
    try:
        print("Testing Default Benchmark...")
        res = requests.get(f"{base_url}/market/benchmark?period=5d")
        if res.status_code == 200:
            print("Success (Default):", list(res.json()['benchmarks'].keys()))
        else:
            print("Failed (Default):", res.status_code, res.text)
    except Exception as e:
        print(f"Connection failed: {e}")

    # Test 2: Custom Ticker (Nifty 50: ^NSEI)
    try:
        print("\nTesting Custom Benchmark (^NSEI)...")
        # Need to URL encode? requests handles params usually.
        res = requests.get(f"{base_url}/market/benchmark", params={"period": "5d", "ticker": "^NSEI"})
        if res.status_code == 200:
            data = res.json()
            if "^NSEI" in data['benchmarks']:
                 print("Success (Custom): Found ^NSEI data")
            else:
                 print("Failed (Custom): ^NSEI key missing in response", list(data['benchmarks'].keys()))
        else:
            print("Failed (Custom):", res.status_code, res.text)
            
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    test_benchmark_api()
