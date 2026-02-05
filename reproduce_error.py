import requests
import traceback

print("Testing backend endpoint...")
try:
    response = requests.get("http://127.0.0.1:8000/market/benchmark?period=1mo")
    if response.status_code == 200:
        print("Success!")
        print(response.json().keys())
    else:
        print(f"Failed with status: {response.status_code}")
        print(response.text)
except Exception:
    traceback.print_exc()
