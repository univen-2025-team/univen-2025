
import requests
from bs4 import BeautifulSoup

def fetch_google_rss(query="VNINDEX"):
    # URL encode query
    import urllib.parse
    q = urllib.parse.quote(query)
    url = f"https://news.google.com/rss/search?q={q}&hl=vi&gl=VN&ceid=VN:vi"
    
    print(f"Fetching Google RSS for {query}...")
    try:
        r = requests.get(url, timeout=10)
        print("Status:", r.status_code)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, 'html.parser')
            items = soup.find_all('item')
            print(f"Found {len(items)} items")
            if items:
                print("Title:", items[0].title.text)
                desc = items[0].find('description')
                if desc:
                    print(f"Desc Preview: {desc.text[:300]}")
                    if '&lt;img' in desc.text or '<img' in desc.text:
                        print("FOUND IMAGE TAG")
                    else:
                        print("NO IMAGE TAG in description")
        else:
            print("Error:", r.text[:200])

    except Exception as e:
        print(e)

if __name__ == "__main__":
    # Test Google
    # fetch_google_rss("Chứng khoán Việt Nam") 
    
    # Test CafeF
    def fetch_cafef_rss():
        url = "https://cafef.vn/thi-truong-chung-khoan.rss"
        print(f"Fetching CafeF RSS...")
        try:
             r = requests.get(url, timeout=10)
             print("Status:", r.status_code)
             soup = BeautifulSoup(r.text, 'html.parser')
             items = soup.find_all('item')
             print(f"Found {len(items)} items")
             if items:
                 print("Title:", items[0].title.text)
                 print("Raw Date:", items[0].find('pubdate').text if items[0].find('pubdate') else "No Date")
                 desc = items[0].find('description')
                 if desc:
                     print(f"Desc Preview: {desc.text[:300]}")
                     if '&lt;img' in desc.text or '<img' in desc.text:
                         print("FOUND IMAGE TAG IN CAFEF")
        except Exception as e:
            print(e)

    fetch_cafef_rss()
