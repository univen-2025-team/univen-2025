
import requests
from bs4 import BeautifulSoup

url = "https://blogtienao.com/kien-thuc/phan-tich-ky-thuat/"
response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(response.content, 'html.parser')

# Find a known relevant link
target_href = "https://blogtienao.com/chi-bao-cci/"
link = soup.find('a', href=target_href)

if link:
    print(f"Found link: {target_href}")
    # Print parents to find the best container
    for parent in link.parents:
        if parent.name == 'div':
            classes = parent.get('class')
            id_ = parent.get('id')
            print(f"Parent: {parent.name}, Class: {classes}, ID: {id_}")
            # Stop if we hit a generic container
            if classes and ('td-container' in classes or 'td-main-content' in classes):
                print("--- Potential Container Hit ---")
                
else:
    print("Could not find target link. Dumping all links to see what resides where.")
    for a in soup.find_all('a', href=True)[:20]:
        print(a['href'])
