import os
import re
import json
import time
import urllib.request

WORKSPACE = os.path.dirname(os.path.abspath(__file__))
CHANNEL_URL = 'https://www.youtube.com/@Odiadigitalsikhya/videos'
CACHE_FILE = os.path.join(WORKSPACE, 'training_videos.json')
DATA_JS = os.path.join(WORKSPACE, 'js', 'data.js')

def categorize_title(title):
    t = (title or '').lower()
    if any(k in t for k in ['yojana', 'pmay', 'kalia', 'subhadra', 'kanya', 'ayushman', 'kamdhenu', 'awas', 'swayam', 'suryaghar', 'sparsh', 'certificate']):
        return 'Government Schemes'
    elif any(k in t for k in ['farmer', 'krushak', 'challan', 'ration', 'labour', 'panjikaran', 'encumbrance']):
        return 'Government Services'
    elif any(k in t for k in ['bank', 'loan', 'pmkisan', 'mudra', 'dbt', 'aggregator']):
        return 'Banking'
    elif any(k in t for k in ['apaar', 'pan', 'aadhaar', 'scholarship', 'navodaya', 'udise', 'ojee', 'ucl']):
        return 'e-Governance'
    return 'CSC Training'

def main():
    print(f"Scraping latest videos from: {CHANNEL_URL}")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    req = urllib.request.Request(CHANNEL_URL, headers=headers)
    with urllib.request.urlopen(req, timeout=20) as resp:
        html = resp.read().decode('utf-8', errors='ignore')

    m = re.search(r'var ytInitialData\s*=\s*({.+?});</script>', html)
    if not m:
        print("ytInitialData not found")
        return False

    data = json.loads(m.group(1))
    tabs = data.get('contents', {}).get('twoColumnBrowseResultsRenderer', {}).get('tabs', [])
    scraped = []
    for tab in tabs:
        grid = tab.get('tabRenderer', {}).get('content', {}).get('richGridRenderer', {})
        items = grid.get('contents', [])
        for item in items:
            lum = item.get('richItemRenderer', {}).get('content', {}).get('lockupViewModel', {})
            if lum:
                vid = lum.get('contentId', '')
                meta = lum.get('metadata', {}).get('lockupMetadataViewModel', {})
                title = meta.get('title', {}).get('content', '')
                if vid and title:
                    scraped.append((vid, title))

    if not scraped:
        print("No videos parsed")
        return False

    print(f"Found {len(scraped)} videos from channel. Top: {scraped[0]}")

    existing_videos = []
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            existing_videos = json.load(f)

    existing_map = { v.get('youtubeId'): v for v in existing_videos if v.get('youtubeId') }
    new_found = False

    for idx, (vid, title) in enumerate(scraped):
        if vid not in existing_map:
            print(f"NEW VIDEO FOUND: [{vid}] {title}")
            new_found = True
            cat = categorize_title(title)
            existing_map[vid] = {
                "id": f"tr-{vid}",
                "youtubeId": vid,
                "title": title,
                "titleOdia": title,
                "category": cat,
                "desc": f"{title} - Step-by-step Odia tutorial from Odia Digital Sikhya.",
                "duration": "Full Tutorial",
                "views": "Latest",
                "badge": "LATEST" if idx == 0 else "NEW",
                "link": f"https://www.youtube.com/watch?v={vid}",
                "published": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "publishedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "publishedTimestamp": int(time.time() * 1000),
                "isCustom": False,
                "syncedAt": int(time.time() * 1000)
            }

    # Re-order according to scraped order
    ordered = []
    seen = set()
    for vid, _ in scraped:
        if vid in existing_map and vid not in seen:
            ordered.append(existing_map[vid])
            seen.add(vid)
    for v in existing_videos:
        vid = v.get('youtubeId')
        if vid and vid not in seen:
            ordered.append(v)
            seen.add(vid)

    if ordered:
        ordered[0]['badge'] = 'LATEST'
        for i in range(1, min(5, len(ordered))):
            if ordered[i].get('badge') == 'LATEST':
                ordered[i]['badge'] = 'NEW'

    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(ordered, f, ensure_ascii=False, indent=2)
    print(f"Updated {CACHE_FILE} with {len(ordered)} videos.")

    if os.path.exists(DATA_JS):
        with open(DATA_JS, 'r', encoding='utf-8') as f:
            js_txt = f.read()
        marker = '  // Training Videos - Official "Odia Digital Sikhya" Channel (Jagannath Dash) - Auto-Sorted Newest First\n  trainingVideos: '
        s_idx = js_txt.find(marker)
        if s_idx != -1:
            e_idx = js_txt.find('\n  // Latest Announcements / News Ticker', s_idx)
            if e_idx != -1:
                js_str = json.dumps(ordered, ensure_ascii=False, indent=2)
                new_js = js_txt[:s_idx + len(marker)] + js_str + ',\n' + js_txt[e_idx:]
                with open(DATA_JS, 'w', encoding='utf-8') as f:
                    f.write(new_js)
                print(f"Updated {DATA_JS}")

    return new_found

if __name__ == '__main__':
    main()
