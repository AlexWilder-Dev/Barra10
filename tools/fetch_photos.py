"""Downloads free-licence Unsplash photo candidates plus their credits into photos/."""
import json
import os
import re
import time
import urllib.parse
import urllib.request

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
PER_QUERY = 6
WIDTH = 1400
os.makedirs("photos", exist_ok=True)


def get(url, accept="application/json"):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": accept})
    with urllib.request.urlopen(req, timeout=60) as res:
        return res.read()


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def is_free(r):
    return not r.get("premium") and not r.get("plus") and "plus.unsplash.com" not in r["urls"]["raw"]


index = []
seen = set()


def save(r, tag, n):
    pid = r["id"]
    if pid in seen:
        return False
    raw = r["urls"]["raw"]
    sep = "&" if "?" in raw else "?"
    fn = f"photos/{tag}-{n:02d}-{pid}.jpg"
    try:
        data = get(f"{raw}{sep}w={WIDTH}&q=80&fm=jpg&fit=max", accept="image/*")
    except Exception as e:  # noqa: BLE001
        print("download failed", pid, e)
        return False
    with open(fn, "wb") as f:
        f.write(data)
    seen.add(pid)
    index.append(
        {
            "tag": tag,
            "id": pid,
            "file": fn,
            "photographer": r["user"]["name"],
            "username": r["user"]["username"],
            "page": r["links"]["html"],
            "alt": r.get("alt_description") or r.get("description"),
            "width": r.get("width"),
            "height": r.get("height"),
        }
    )
    print("saved", fn)
    return True


for pid in [l.strip() for l in open("known-ids.txt") if l.strip()]:
    try:
        r = json.loads(get(f"https://unsplash.com/napi/photos/{urllib.parse.quote(pid)}"))
    except Exception as e:  # noqa: BLE001
        print("lookup failed", pid, e)
        continue
    if is_free(r):
        save(r, "known", 0)
    else:
        print("skip premium", pid)
    time.sleep(0.5)

for q in [l.strip() for l in open("photo-queries.txt") if l.strip()]:
    url = "https://unsplash.com/napi/search/photos?" + urllib.parse.urlencode({"query": q, "per_page": 20})
    try:
        data = json.loads(get(url))
    except Exception as e:  # noqa: BLE001
        print("search failed", q, e)
        continue
    n = 0
    for r in data.get("results", []):
        if not is_free(r):
            continue
        if save(r, slug(q), n):
            n += 1
        if n >= PER_QUERY:
            break
        time.sleep(0.3)

with open("photos/index.json", "w") as f:
    json.dump(index, f, indent=1)
print("total", len(index))
