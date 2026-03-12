from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []

    def handle_starttag(self, tag, attrs):
        if tag not in ['img', 'br', 'hr', 'input', 'meta', 'link']:
            self.tags.append(tag)

    def handle_endtag(self, tag):
        if tag not in ['img', 'br', 'hr', 'input', 'meta', 'link']:
            if not self.tags:
                print(f"Extra closing tag: {tag}")
                return
            last = self.tags.pop()
            if last != tag:
                print(f"Mismatched tag: expected {last}, got {tag}")

with open('index.html', 'r') as f:
    parser = MyHTMLParser()
    parser.feed(f.read())
    if parser.tags:
        print(f"Unclosed tags at end: {parser.tags}")
    else:
        print("HTML tags match perfectly!")
