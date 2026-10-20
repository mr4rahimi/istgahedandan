#!/usr/bin/env python3
"""
Count sitemap URLs that no crawlable page links to ("orphans").

Crawls breadth-first from "/" following only <a href="/…"> links that are in
sitemap.xml (plus /mag/?page=N pagination), then reports sitemap entries that
received zero internal links. Uses only the standard library so it runs on the
server as-is:

    ssh -o BindInterface=wlo1 srv 'python3 - http://127.0.0.1:3004' < scripts/seo-orphans.py

or locally against `npm run start`:

    python3 scripts/seo-orphans.py http://localhost:3000
"""
import collections
import re
import statistics
import sys
import urllib.parse as up
import urllib.request

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:3004").rstrip("/")
HREF = re.compile(r'<a[^>]+href="(/[^"#]*)"')


def get(path: str) -> str:
    req = urllib.request.Request(BASE + path, headers={"Host": "istgahedandan.ir"})
    try:
        return urllib.request.urlopen(req, timeout=60).read().decode("utf8", "ignore")
    except Exception:
        return ""


def norm(path: str) -> str:
    """Percent-encoded, trailing-slashed path — the shape sitemap.xml uses."""
    p = up.quote(up.unquote(path.split("?")[0]))
    return p if p.endswith("/") else p + "/"


sitemap = [up.urlparse(u).path for u in re.findall(r"<loc>([^<]+)", get("/sitemap.xml"))]
in_sitemap = {norm(p) for p in sitemap}

inlinks: collections.Counter = collections.Counter()
seen: set = set()
queue = ["/"]
while queue:
    page = queue.pop(0)
    if page in seen:
        continue
    seen.add(page)
    for href in set(HREF.findall(get(page))):
        target = norm(href)
        inlinks[target] += 1
        follow = href if (href.startswith("/mag") and "page=" in href) else target
        if follow not in seen and (target in in_sitemap or follow.startswith("/mag")):
            queue.append(follow)

orphans = sorted(p for p in in_sitemap if inlinks[p] == 0)
print(f"sitemap URLs: {len(in_sitemap)}  pages crawled: {len(seen)}  orphans: {len(orphans)}")
for p in orphans:
    print("  ", up.unquote(p))
counts = [inlinks[p] for p in in_sitemap]
if counts:
    print(f"inlinks per sitemap URL — median {statistics.median(counts)}, min {min(counts)}")
