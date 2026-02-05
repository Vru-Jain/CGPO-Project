from core.data_loader import MarketDataLoader
import pandas as pd

print("Initializing Loader...")
loader = MarketDataLoader(["AAPL"])

print("Testing Valid Call...")
try:
    res = loader.get_benchmark_performance("1mo")
    print("Valid Call Result Keys:", res.keys())
except Exception as e:
    print("Valid Call Failed:", e)

print("\nTesting Mock Fallback (Forcing failure)...")
# Monkey patch fetch_benchmark to raise error
def raise_err(*args, **kwargs):
    raise Exception("Forced Failure")

loader.fetch_benchmark = raise_err

try:
    res = loader.get_benchmark_performance("1mo")
    print("Fallback Call Result Keys:", res.keys())
    print("SPY Data:", res['SPY'].keys())
except Exception as e:
    print("Fallback Call Failed:", e)
    import traceback
    traceback.print_exc()
