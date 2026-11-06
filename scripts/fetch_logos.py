"""Fetch brand SVG paths from Simple Icons CDN and generate a TSX module."""
import urllib.request
import re
import json

SLUGS = {
    "postgresql": None,   # None = use brand color from CDN
    "snowflake": None,
    "databricks": None,
    "attio": None,
    "crewai": None,
    "metabase": None,
    "langchain": "#7Ce3b1",  # too dark on dark bg otherwise
    "notion": "#e9e7dc",     # white-ish for dark bg
}

FALLBACK_COLORS = {
    "postgresql": "#4169E1",
    "snowflake": "#29B5E8",
    "databricks": "#FF3621",
    "attio": "#FCA121",
    "crewai": "#F5A623",
    "metabase": "#509EE3",
}

out = {}
for slug, override in SLUGS.items():
    urls = [
        (f"https://cdn.simpleicons.org/{slug}", {}),
        (f"https://unpkg.com/simple-icons@15/icons/{slug}.svg",
         {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"}),
    ]
    svg = None
    for url, headers in urls:
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=20) as r:
                svg = r.read().decode("utf-8")
            print(f"  source: {url.split('/')[2]}")
            break
        except Exception as e:
            print(f"  miss {url.split('/')[2]}: {e}")
    if svg is None:
        print(f"FAIL {slug}")
        continue
    try:
        m = re.search(r'd="([^"]+)"', svg)
        c = re.search(r'fill="([^"]+)"', svg)
        if not m:
            raise ValueError("no path found")
        color = override or (c.group(1) if c else FALLBACK_COLORS.get(slug, "#e9e7dc"))
        out[slug] = {"d": m.group(1), "color": color}
        print(f"OK  {slug:12s} color={color} pathLen={len(m.group(1))}")
    except Exception as e:
        print(f"FAIL {slug}: {e}")

with open("/tmp/logos.json", "w") as f:
    json.dump(out, f, indent=1)
print(f"\n{len(out)} logos fetched -> /tmp/logos.json")
