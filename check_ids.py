import re
import sys

with open('js/app.js', 'r') as f:
    js = f.read()

with open('index.html', 'r') as f:
    html = f.read()

ids = set(re.findall(r"document\.getElementById\(['\"]([^'\"]+)['\"]\)", js))

missing = []
for i in ids:
    if f'id="{i}"' not in html and f"id='{i}'" not in html:
        missing.append(i)

if missing:
    print("MISSING IDs: ", missing)
else:
    print("NO MISSING IDs")
