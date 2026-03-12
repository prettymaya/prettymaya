import re
with open('js/app.js', 'r') as f:
    text = f.read()

for i, line in enumerate(text.split('\n')):
    if 'addEventListener' in line:
        match = re.search(r'([a-zA-Z0-9_\[\]]+)\.addEventListener', line)
        if match:
            objName = match.group(1)
            # if object looks like els.whatever, let's extract 'whatever'
        match_els = re.search(r'els\.([a-zA-Z0-9_]+)\.addEventListener', line)
        if match_els:
            key = match_els.group(1)
            if f'{key}:' not in text and f'{key} :' not in text:
                print(f"Line {i+1}: els.{key} is attached but NOT DECLARED IN els!")

