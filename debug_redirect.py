import urllib.request
import urllib.error

url = "https://vrushabhjain2016--cgpo-backend-serve.modal.run/health"

class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        print(f"REDIRECT INTERCEPTED:")
        print(f"Code: {code}")
        print(f"Message: {msg}")
        print(f"Location: {newurl}")
        return None  # Stop redirecting

opener = urllib.request.build_opener(NoRedirectHandler)
req = urllib.request.Request(url)

try:
    response = opener.open(req, timeout=10)
    print(f"Success: {response.getcode()}")
    print(response.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.headers)
except Exception as e:
    print(f"Other Error: {e}")
