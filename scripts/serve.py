#!/usr/bin/env python3
"""Static server for the prototype, with caching switched off.

`python3 -m http.server` sends Last-Modified and no cache directives, so
browsers hold on to stale JS and CSS between edits — which makes "did my change
work?" unanswerable without a hard reload every time. This sends no-store on
everything instead.

    python3 scripts/serve.py [port]      # default 8150
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):  # quieter output
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8150
    handler = partial(NoCacheHandler, directory=".")
    print(f"Serving http://localhost:{port}/index.html (no-store)")
    ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()
