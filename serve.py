"""Serveur local avec URL propres (comme sur Vercel) : /produits -> produits.html.

Usage : python serve.py [port]   (port par défaut : 5173)
"""
import http.server
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))


class CleanUrlHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def translate_path(self, path):
        clean = path.split("?", 1)[0].split("#", 1)[0]
        if clean not in ("", "/") and "." not in os.path.basename(clean):
            candidate = os.path.join(ROOT, clean.lstrip("/") + ".html")
            if os.path.isfile(candidate):
                return candidate
        return super().translate_path(path)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
    print(f"M'foods : http://localhost:{port}")
    http.server.ThreadingHTTPServer(("", port), CleanUrlHandler).serve_forever()
