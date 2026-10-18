import os
import sys
import json
import time
import urllib.request
import re
import mimetypes
import html
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

# Force UTF-8 on Windows command prompts
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Ensure common MIME types are properly recognized
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('application/json', '.json')
mimetypes.add_type('image/svg+xml', '.svg')
mimetypes.add_type('application/pdf', '.pdf')
mimetypes.add_type('image/png', '.png')
mimetypes.add_type('image/jpeg', '.jpg')
mimetypes.add_type('image/jpeg', '.jpeg')
mimetypes.add_type('image/webp', '.webp')

# In-memory store for activity logs
_vle_activities = []

# In-memory cache for Google Drive Synced Forms
_drive_cache = {
    "files": [],
    "last_sync": 0
}

def fetch_live_drive_forms(force=False):
    global _drive_cache
    now = time.time()
    # Cache for 60 seconds unless forced
    if not force and _drive_cache["files"] and (now - _drive_cache["last_sync"] < 60):
        return _drive_cache["files"]
    try:
        folder_id = '1F7z-O5uxfMarZyJH8rsrEryuxVQEC6lX'
        url = f'https://drive.google.com/drive/folders/{folder_id}'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')
        pattern = r'aria-label=["\']([^"\']+?)\s+PDF\s+Shared["\'][^>]*?ssk=[\'"][^:\'"]*:[^:\'"]*:([^:\'"]+?)[\'"]'
        matches = re.findall(pattern, html)
        files = []
        seen = set()
        for name, raw_id in matches:
            clean_id = re.sub(r'-0(?:-\d+)?$', '', raw_id)
            fname = name.strip()
            if fname not in seen:
                seen.add(fname)
                files.append({
                    "name": fname,
                    "fileId": clean_id,
                    "previewUrl": f"https://drive.google.com/file/d/{clean_id}/preview",
                    "downloadUrl": f"https://drive.usercontent.google.com/download?id={clean_id}&export=download"
                })
        if files:
            _drive_cache["files"] = files
            _drive_cache["last_sync"] = now
            return files
    except Exception as e:
        print(f"[Drive Sync] Error fetching drive files: {e}")
    return _drive_cache["files"]

# In-memory cache for YouTube Training Videos
_training_cache = {
    "videos": [],
    "last_sync": 0
}

def categorize_youtube_video(title):
    t = title.lower()
    if any(k in t for k in ['yojana', 'pmay', 'kalia', 'subhadra', 'kanya', 'ayushman', 'kamdhenu', 'awas', 'swayam', 'suryaghar', 'surya ghar', 'pmsym', 'pmkmy', 'sumangala', 'nfdp']):
        return 'Government Schemes'
    elif any(k in t for k in ['farmer', 'krushak', 'challan', 'ration', 'labour', 'rose valley', 'encumbrance', 'ec online', 'igr', 'panjikaran']):
        return 'Government Services'
    elif any(k in t for k in ['bank', 'loan', 'pmkisan', 'pm kisan', 'pmkishan', 'mudra', 'statement', 'dbt', 'aggregator']):
        return 'Banking'
    elif any(k in t for k in ['apaar', 'pan', 'aadhaar', 'scholarship', 'navodaya', 'udise', 'ojee', 'rte', 'ucl']):
        return 'e-Governance'
    else:
        return 'CSC Training'

def fetch_live_youtube_videos(force=False):
    global _training_cache
    now = time.time()
    cache_file = os.path.join(DIRECTORY, "training_videos.json")

    # Load from disk if in-memory cache is empty
    if not _training_cache["videos"] and os.path.exists(cache_file):
        try:
            with open(cache_file, 'r', encoding='utf-8') as f:
                _training_cache["videos"] = json.load(f)
        except Exception as e:
            print(f"[YouTube Sync] Error loading cache file: {e}")

    # Return cached data if valid and not forced (cache 300s = 5 mins)
    if not force and _training_cache["videos"] and (now - _training_cache["last_sync"] < 300):
        return _training_cache["videos"], 0

    new_added = 0
    try:
        channel_url = 'https://www.youtube.com/channel/UCjxf06z3rx9DObtaTfaJfqg/videos'
        req = urllib.request.Request(channel_url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
        })
        html = urllib.request.urlopen(req, timeout=12).read().decode('utf-8', errors='ignore')
        match = re.search(r'var ytInitialData = ({.*?});</script>', html)
        if match:
            data = json.loads(match.group(1))
            scraped_videos = []
            seen_ids = set()

            def extract_from_json(obj):
                if isinstance(obj, dict):
                    if 'lockupViewModel' in obj:
                        lvm = obj['lockupViewModel']
                        vid = lvm.get('contentId')
                        if vid and vid not in seen_ids:
                            seen_ids.add(vid)
                            lmv = lvm.get('metadata', {}).get('lockupMetadataViewModel', {})
                            title = lmv.get('title', {}).get('content', '')
                            rows = lmv.get('metadata', {}).get('contentMetadataViewModel', {}).get('metadataRows', [])
                            views = '1K'
                            published = ''
                            if rows and len(rows) > 0:
                                parts = rows[0].get('metadataParts', [])
                                if len(parts) > 0:
                                    views = parts[0].get('accessibilityLabel', parts[0].get('text', {}).get('content', ''))
                                if len(parts) > 1:
                                    published = parts[1].get('accessibilityLabel', parts[1].get('text', {}).get('content', ''))
                            
                            duration = '10:00 min'
                            overlays = lvm.get('contentImage', {}).get('thumbnailViewModel', {}).get('overlays', [])
                            for ov in overlays:
                                badges = ov.get('thumbnailBottomOverlayViewModel', {}).get('badges', [])
                                for b in badges:
                                    tbvm = b.get('thumbnailBadgeViewModel', {})
                                    if 'text' in tbvm:
                                        duration = f"{tbvm['text']} min" if ':' in tbvm['text'] else tbvm['text']
                                        break
                            
                            clean_views = views.replace('views', '').replace('view', '').strip()
                            if not clean_views: clean_views = '1K'
                            cat = categorize_youtube_video(title)

                            scraped_videos.append({
                                'id': f"tr-{vid}",
                                'youtubeId': vid,
                                'title': title,
                                'titleOdia': title,
                                'category': cat,
                                'desc': f"{title} - Step-by-step Odia tutorial from Odia Digital Sikhya.",
                                'duration': duration,
                                'views': clean_views,
                                'badge': 'NEW' if any(w in published for w in ['day', 'week', 'month']) else 'Popular',
                                'link': f"https://www.youtube.com/watch?v={vid}",
                                'published': published,
                                'syncedAt': int(now * 1000)
                            })
                    for v in obj.values():
                        extract_from_json(v)
                elif isinstance(obj, list):
                    for it in obj:
                        extract_from_json(it)

            extract_from_json(data)

            if scraped_videos:
                # Deduplication: Map existing videos by youtubeId
                existing_map = { v.get('youtubeId'): v for v in _training_cache["videos"] if v.get('youtubeId') }
                merged = []
                
                # Check for brand new videos to prepend
                for sv in scraped_videos:
                    yid = sv['youtubeId']
                    if yid not in existing_map:
                        merged.append(sv)
                        new_added += 1
                
                # Append all existing videos (preserving any custom changes/additions)
                for ev in _training_cache["videos"]:
                    merged.append(ev)

                # Also add any scraped videos that were in scraped but not in merged
                merged_ids = { v.get('youtubeId') for v in merged if v.get('youtubeId') }
                for sv in scraped_videos:
                    if sv['youtubeId'] not in merged_ids:
                        merged.append(sv)
                        merged_ids.add(sv['youtubeId'])

                _training_cache["videos"] = merged
                _training_cache["last_sync"] = now

                # Persist to disk
                try:
                    with open(cache_file, 'w', encoding='utf-8') as f:
                        json.dump(merged, f, ensure_ascii=False, indent=2)
                except Exception as ef:
                    print(f"[YouTube Sync] Error writing cache file: {ef}")

                return merged, new_added
    except Exception as e:
        print(f"[YouTube Sync] Error scraping YouTube channel: {e}")

    # Fallback to existing
    _training_cache["last_sync"] = now
    return _training_cache["videos"], 0

# In-memory cache for Job Alerts
_jobs_cache = {
    "jobs": [],
    "last_sync": 0
}

def determine_job_category(title, org, qual, source_url=''):
    u = (source_url or '').lower()
    if 'odisha' in u:
        return 'Odisha Govt'
    elif 'railway' in u:
        return 'Railway'
    elif 'bank' in u:
        return 'Banking'
    elif 'police' in u or 'defence' in u or 'defense' in u:
        return 'Defense & Police'
    elif 'government-jobs' in u or 'ssc' in u or 'upsc' in u:
        return 'Central Govt'

    text = (title + " " + org + " " + qual).lower()
    if any(k in text for k in [
        'odisha', 'ossc', 'osssc', 'opsc', 'bhubaneswar', 'cuttack', 'rourkela', 'sambalpur',
        'puri', 'oav', 'anganwadi', 'jajpur', 'balasore', 'bhadrak', 'mayurbhanj', 'gajapati',
        'ganjam', 'berhampur', 'brahmapur', 'koraput', 'kendrapara', 'jagatsinghpur', 'khordha',
        'dhenkanal', 'angul', 'bolangir', 'balangir', 'kalahandi', 'nuapada', 'nabarangpur',
        'rayagada', 'malkangiri', 'bargarh', 'jharsuguda', 'sundargarh', 'keonjhar', 'kandhamal',
        'boudh', 'sonepur', 'subarnapur', 'nayagarh', 'deogarh', 'omc', 'gridco', 'optcl',
        'opgc', 'ouat', 'chse', 'bse odisha', 'ojee'
    ]):
        return 'Odisha Govt'
    elif any(k in text for k in ['rrb', 'railway', 'train', 'irctc', 'loco', 'ntpc', 'rites', 'ircon', 'kmrl', 'upmrc']):
        return 'Railway'
    elif any(k in text for k in ['bank', 'ibps', 'sbi', 'rbi', 'nabard', 'canara', 'baroda', 'pnb', 'uco', 'tmb']):
        return 'Banking'
    elif any(k in text for k in ['police', 'army', 'navy', 'airforce', 'crpf', 'bsf', 'cisf', 'itbp', 'defense', 'defence', 'agniveer', 'sepoy', 'constable', 'sainik school']):
        return 'Defense & Police'
    elif any(k in text for k in ['10th', '10 th', '8th', 'matric', '12th', '+2', 'intermediate']):
        return '10th & 12th Pass'
    else:
        return 'Central Govt'

def estimate_job_salary(title, qual):
    t = (title + " " + qual).lower()
    if any(k in t for k in ['officer', 'analyst', 'manager', 'executive', 'engineer', 'specialist', 'registrar', 'scientist', 'fellow']):
        return '₹35,400 - ₹1,12,400 (Level-9 / Level-10)'
    elif any(k in t for k in ['cgl', 'sub inspector', 'si', 'inspector', 'assistant section officer', 'aso', 'graduate']):
        return '₹35,400 - ₹1,12,400 (Level-9)'
    elif any(k in t for k in ['constable', 'technician', 'clerk', 'junior assistant', 'typist', 'chsl', 'apprentice']):
        return '₹19,900 - ₹63,200 (Level-4)'
    elif any(k in t for k in ['peon', 'helper', 'cook', 'mts', 'multitasking', 'attendant', '10th', '8th']):
        return '₹18,000 - ₹56,900 (Level-1)'
    else:
        return '₹21,700 - ₹69,100 (Level-3 / Standard Govt Scale)'

def get_job_documents_list(qual):
    q = qual.lower()
    docs = [
        "10th Class Board Certificate & Marksheet (Age & Identity Proof)",
        "Aadhaar Card (Mobile Linked for OTP)",
        "Recent Passport Size Color Photo (White Background, 20-50 KB)",
        "Candidate Signature (Black Ink on White Paper, 10-20 KB)",
        "Resident / Domicile Certificate (Odisha / Local Tehsildar)",
        "Caste Certificate (SC / ST / SEBC / OBC if applicable)"
    ]
    if any(k in q for k in ['graduate', 'b.tech', 'degree', 'masters', 'mca', 'b.a', 'b.sc', 'b.com']):
        docs.insert(1, "Graduation / Degree Certificate & Final Year Marksheet")
        docs.insert(2, "+2 / Higher Secondary Marksheet & Passing Certificate")
    elif any(k in q for k in ['12th', '+2', 'diploma', 'iti']):
        docs.insert(1, "+2 / Intermediate or ITI/Diploma Certificate & Marksheet")
    
    docs.append("Active Mobile Number & Active Email ID")
    return docs

DEFAULT_JOB_SOURCES = [
    {"id": 1, "name": "Portal 1 (Odisha Government Jobs)", "url": "https://www.freejobalert.com/odisha-government-jobs/", "active": True},
    {"id": 2, "name": "Portal 2 (Railway RRB Recruitment)", "url": "https://www.freejobalert.com/railway-jobs/", "active": True},
    {"id": 3, "name": "Portal 3 (Staff Selection & Central Govt Jobs)", "url": "https://www.freejobalert.com/government-jobs/", "active": True},
    {"id": 4, "name": "Portal 4 (Banking & IBPS Recruitment)", "url": "https://www.freejobalert.com/bank-jobs/", "active": True},
    {"id": 5, "name": "Portal 5 (Police & Defense Recruitment)", "url": "https://www.freejobalert.com/police-defence-jobs/", "active": True}
]

def is_safe_portal_url(url):
    if not url or not isinstance(url, str):
        return False
    u = url.strip()
    if not (u.startswith('http://') or u.startswith('https://')):
        return False
    lower = u.lower()
    blocked = [
        'localhost', '127.0.0.1', '0.0.0.0', '169.254.', '10.', '192.168.',
        '172.16.', '172.17.', '172.18.', '172.19.', '172.20.', '172.21.',
        '172.22.', '172.23.', '172.24.', '172.25.', '172.26.', '172.27.',
        '172.28.', '172.29.', '172.30.', '172.31.', '[::1]', 'metadata.google.internal'
    ]
    return not any(b in lower for b in blocked)

def get_job_sources():
    sources_file = os.path.join(DIRECTORY, "job_sources.json")
    if os.path.exists(sources_file):
        try:
            with open(sources_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list) and len(data) > 0:
                    return data
        except Exception as e:
            print(f"[Job Sources] Error loading: {e}")
    return DEFAULT_JOB_SOURCES

def fetch_live_job_alerts(force=False, custom_sources=None):
    global _jobs_cache
    now = time.time()
    cache_file = os.path.join(DIRECTORY, "job_alerts.json")

    # Load from disk if in-memory cache is empty
    if not _jobs_cache["jobs"] and os.path.exists(cache_file):
        try:
            with open(cache_file, 'r', encoding='utf-8') as f:
                _jobs_cache["jobs"] = json.load(f)
                _jobs_cache["last_sync"] = os.path.getmtime(cache_file)
        except Exception as e:
            print(f"[Jobs Cache] Error loading: {e}")

    # Return cached if within 30 minutes and not forced
    if not force and _jobs_cache["jobs"] and (now - _jobs_cache["last_sync"] < 1800):
        return _jobs_cache["jobs"], 0

    sources = custom_sources if (custom_sources and isinstance(custom_sources, list)) else get_job_sources()
    scraped_jobs = []
    new_added = 0

    # Scrape each active configured portal URL
    for src in sources:
        url = src.get('url', '').strip() if isinstance(src, dict) else str(src).strip()
        is_active = src.get('active', True) if isinstance(src, dict) else True
        if not url or not is_safe_portal_url(url) or not is_active:
            continue

        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            html_text = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')
            rows = re.findall(r'<tr[^>]*>(.*?)</tr>', html_text, re.S)

            for r in rows:
                cells = re.findall(r'<td[^>]*>(.*?)</td>', r, re.S)
                if len(cells) < 6:
                    continue

                clean = [re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', c))).strip() for c in cells]
                pdate = clean[0]
                if not pdate or not re.search(r'\d', pdate) or any(h in pdate.lower() for h in ['post date', 'date', 'advt']):
                    continue

                col1, col2, col3, col4, col5 = clean[1], clean[2], clean[3], clean[4], clean[5]

                # Check if table is Type A (Odisha state style where col3 is Vacancies and col4 is Qualification)
                # or Type B (Standard lattbl where col2 is Post Name – Vacancies and col3 is Qualification)
                is_odisha = False
                col3_lower = col3.lower()
                if re.search(r'^\d+[\s,0-9]*\s*(posts?)?$', col3, re.I) or (
                    'post' in col3_lower and not any(q in col3_lower for q in ['graduate', 'degree', 'pass', '10th', '12th', 'diploma', 'b.tech', 'iti', 'mbbs', 'ph.d', 'm.tech', 'b.ed'])
                ):
                    is_odisha = True

                if is_odisha:
                    board = re.sub(r'\s*(Vacancy|Recruitment)\s*\d{4}.*$', '', col1, flags=re.I).strip() or col1
                    post = col2
                    vacancies = col3
                    qual = col4
                    ldate = col5
                else:
                    board = col1
                    post_raw = col2
                    if '–' in post_raw:
                        parts = post_raw.split('–', 1)
                    elif '-' in post_raw and ('post' in post_raw.lower() or re.search(r'-\s*\d+', post_raw)):
                        parts = post_raw.rsplit('-', 1)
                    else:
                        parts = [post_raw]
                    post = parts[0].strip()
                    vacancies = parts[1].strip() if len(parts) > 1 else 'Check Notification'
                    if vacancies and 'post' not in vacancies.lower() and re.search(r'^\d+[\s,0-9]*$', vacancies):
                        vacancies += ' Posts'
                    qual = col3
                    ldate = col5

                if not post or not board:
                    continue

                # Extract proper detail / notification link
                links = re.findall(r'href=[\x27\x22]([^\x27\x22]+)[\x27\x22]', r)
                detail_link = url
                if links:
                    for lk in reversed(links):
                        if not lk.startswith('#') and 'javascript:' not in lk:
                            detail_link = lk
                            break
                if not detail_link.startswith('http'):
                    from urllib.parse import urljoin
                    detail_link = urljoin(url, detail_link)

                # Generate clean unique ID and title
                clean_board = board.split(' - ')[0].split('  ')[0].strip()
                clean_post = post.strip()
                title_str = f"{clean_board} - {clean_post}" if clean_post else clean_board
                raw_id_str = f"{clean_board}-{clean_post}-{ldate}"
                clean_id = "job-" + re.sub(r'[^a-zA-Z0-9]+', '-', raw_id_str).strip('-').lower()[:45]

                cat = determine_job_category(clean_post, clean_board, qual, url)
                salary = estimate_job_salary(clean_post, qual)
                docs = get_job_documents_list(qual)

                scraped_jobs.append({
                    "id": clean_id,
                    "title": title_str,
                    "titleOdia": title_str,
                    "organization": clean_board,
                    "post": clean_post,
                    "vacancies": vacancies,
                    "qualification": qual,
                    "ageLimit": "18 - 38 Years (Age relaxation as per Govt rules)",
                    "salary": salary,
                    "startDate": pdate,
                    "lastDate": ldate if ldate and ldate != '–' else 'Check Notification',
                    "category": cat,
                    "status": "Active",
                    "applyUrl": detail_link,
                    "notificationUrl": detail_link,
                    "officialUrl": detail_link,
                    "sourceUrl": detail_link,
                    "source": "Govt Recruitment Board",
                    "documents": docs,
                    "examFee": "Check official notification",
                    "featured": False,
                    "syncedAt": int(now * 1000)
                })
        except Exception as e:
            print(f"[Jobs Sync] Scrape error for {url}: {e}")

    if scraped_jobs:
        existing_map = { j.get('id'): j for j in _jobs_cache["jobs"] if j.get('id') }
        merged = []
        seen_ids = set()

        # Prepend new scraped jobs
        for sj in scraped_jobs:
            if sj['id'] not in seen_ids:
                merged.append(sj)
                seen_ids.add(sj['id'])
                if sj['id'] not in existing_map:
                    new_added += 1

        # Keep existing curated jobs with customized documents/featured status
        for ej in _jobs_cache["jobs"]:
            if ej.get('id') not in seen_ids:
                # Discard legacy uncleaned entries
                if '&#8211;' not in ej.get('title', '') and '&#8211;' not in ej.get('vacancies', ''):
                    if ej.get('featured') or ej.get('documents'):
                        merged.append(ej)
                        seen_ids.add(ej['id'])

        if not merged:
            merged = scraped_jobs

        _jobs_cache["jobs"] = merged
        _jobs_cache["last_sync"] = now

        try:
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(merged, f, ensure_ascii=False, indent=2)
        except Exception as ef:
            print(f"[Jobs Cache] Error writing disk cache: {ef}")

        return merged, new_added

    _jobs_cache["last_sync"] = now
    return _jobs_cache["jobs"], 0

class VuoHttpHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def handle_one_request(self):
        try:
            return super().handle_one_request()
        except Exception as e:
            import traceback
            sys.stdout.write(f"\n[EXCEPTION IN REQUEST]: {e}\n")
            traceback.print_exc(file=sys.stdout)
            sys.stdout.flush()
            raise

    def log_message(self, format, *args):
        # Clean logging
        sys.stdout.write("[%s] %s\n" % (self.log_date_time_string(), format % args))
        sys.stdout.flush()

    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-VUO-Auth')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')

    def do_OPTIONS(self):
        self.send_response(200, "OK")
        self.send_header('Content-Length', '0')
        self.end_headers()

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            # Protect against DoS memory exhaustion (limit 10MB)
            if content_length > 10 * 1024 * 1024:
                self.send_response(413)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(b'{"status":"error","message":"Payload exceeds 10MB limit"}')
                return
            body = self.rfile.read(content_length) if content_length > 0 else b''

            # Endpoint: /api/log-vle-activity
            if self.path.startswith('/api/log-vle-activity'):
                try:
                    payload = json.loads(body.decode('utf-8'))
                    _vle_activities.insert(0, payload)
                    if len(_vle_activities) > 100:
                        _vle_activities.pop()
                except Exception:
                    pass
                resp = json.dumps({"status": "success", "message": "Activity logged"}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(resp)))
                self.end_headers()
                self.wfile.write(resp)
                return

            # Endpoint: /api/upload-form
            if self.path.startswith('/api/upload-form'):
                resp = json.dumps({"status": "success", "message": "Form received"}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(resp)))
                self.end_headers()
                self.wfile.write(resp)
                return

            # Endpoint: /api/save-training-videos
            if self.path.startswith('/api/save-training-videos'):
                try:
                    payload = json.loads(body.decode('utf-8'))
                    if isinstance(payload, list):
                        _training_cache["videos"] = payload
                        _training_cache["last_sync"] = time.time()
                        cache_file = os.path.join(DIRECTORY, "training_videos.json")
                        with open(cache_file, 'w', encoding='utf-8') as f:
                            json.dump(payload, f, ensure_ascii=False, indent=2)
                except Exception as e:
                    print(f"[Save Videos] Error saving: {e}")
                resp = json.dumps({"status": "success", "message": "Training videos saved"}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(resp)))
                self.end_headers()
                self.wfile.write(resp)
                return

            # Endpoint: /api/save-job-alert
            if self.path.startswith('/api/save-job-alert'):
                try:
                    payload = json.loads(body.decode('utf-8'))
                    if isinstance(payload, dict) and payload.get('title'):
                        cache_file = os.path.join(DIRECTORY, "job_alerts.json")
                        jobs = []
                        if os.path.exists(cache_file):
                            with open(cache_file, 'r', encoding='utf-8') as f:
                                jobs = json.load(f)
                        # Replace if exists, else prepend
                        job_id = payload.get('id') or f"job-{int(time.time())}"
                        payload['id'] = job_id
                        idx = next((i for i, j in enumerate(jobs) if j.get('id') == job_id), -1)
                        if idx >= 0:
                            jobs[idx] = payload
                        else:
                            jobs.insert(0, payload)
                        _jobs_cache["jobs"] = jobs
                        _jobs_cache["last_sync"] = time.time()
                        with open(cache_file, 'w', encoding='utf-8') as f:
                            json.dump(jobs, f, ensure_ascii=False, indent=2)
                except Exception as e:
                    print(f"[Save Job Alert] Error: {e}")
                resp = json.dumps({"status": "success", "message": "Job alert saved successfully"}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(resp)))
                self.end_headers()
                self.wfile.write(resp)
                return

            # Endpoint: /api/delete-job-alert
            if self.path.startswith('/api/delete-job-alert'):
                try:
                    payload = json.loads(body.decode('utf-8'))
                    del_id = payload.get('id')
                    if del_id:
                        cache_file = os.path.join(DIRECTORY, "job_alerts.json")
                        jobs = []
                        if os.path.exists(cache_file):
                            with open(cache_file, 'r', encoding='utf-8') as f:
                                jobs = json.load(f)
                        jobs = [j for j in jobs if j.get('id') != del_id]
                        _jobs_cache["jobs"] = jobs
                        _jobs_cache["last_sync"] = time.time()
                        with open(cache_file, 'w', encoding='utf-8') as f:
                            json.dump(jobs, f, ensure_ascii=False, indent=2)
                except Exception as e:
                    print(f"[Delete Job Alert] Error: {e}")
                resp = json.dumps({"status": "success", "message": "Job alert deleted"}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(resp)))
                self.end_headers()
                self.wfile.write(resp)
                return

            # Endpoint: /api/save-job-sources
            if self.path.startswith('/api/save-job-sources'):
                try:
                    payload = json.loads(body.decode('utf-8'))
                    if isinstance(payload, list) and len(payload) > 0:
                        # Validate each portal source against SSRF
                        clean_sources = []
                        for s in payload:
                            if isinstance(s, dict):
                                s_url = s.get('url', '').strip()
                                if s_url and not is_safe_portal_url(s_url):
                                    continue
                                clean_sources.append(s)
                        if clean_sources:
                            sources_file = os.path.join(DIRECTORY, "job_sources.json")
                            with open(sources_file, 'w', encoding='utf-8') as f:
                                json.dump(clean_sources, f, ensure_ascii=False, indent=2)
                            jobs, new_added = fetch_live_job_alerts(force=True, custom_sources=clean_sources)
                            resp = json.dumps({"status": "success", "message": f"{len(clean_sources)} Job sources verified and sync completed", "count": len(jobs), "newAdded": new_added}).encode('utf-8')
                        else:
                            resp = json.dumps({"status": "error", "message": "All submitted URLs were invalid or blocked for security"}).encode('utf-8')
                    else:
                        resp = json.dumps({"status": "error", "message": "Invalid sources payload"}).encode('utf-8')
                except Exception as e:
                    print(f"[Save Job Sources] Error: {e}")
                    resp = json.dumps({"status": "error", "message": str(e)}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(resp)))
                self.end_headers()
                self.wfile.write(resp)
                return

            # Generic POST fallback
            resp = json.dumps({"status": "ok"}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(resp)))
            self.end_headers()
            self.wfile.write(resp)
        except Exception as err:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(err).encode('utf-8'))

    def do_GET(self):
        # API: /api/vle-activities
        if self.path.startswith('/api/vle-activities'):
            resp = json.dumps(_vle_activities).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(resp)))
            self.end_headers()
            self.wfile.write(resp)
            return

        # API: /api/sync-drive-forms
        if self.path.startswith('/api/sync-drive-forms'):
            force = 'force=true' in self.path
            files = fetch_live_drive_forms(force=force)
            resp = json.dumps({"status": "success", "count": len(files), "files": files}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(resp)))
            self.end_headers()
            self.wfile.write(resp)
            return

        # API: /api/training-videos
        if self.path.startswith('/api/training-videos'):
            force = 'force=true' in self.path
            videos, new_added = fetch_live_youtube_videos(force=force)
            resp = json.dumps({"status": "success", "count": len(videos), "newAdded": new_added, "videos": videos}, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(resp)))
            self.end_headers()
            self.wfile.write(resp)
            return

        # API: /api/sync-youtube-videos
        if self.path.startswith('/api/sync-youtube-videos'):
            videos, new_added = fetch_live_youtube_videos(force=True)
            resp = json.dumps({"status": "success", "count": len(videos), "newAdded": new_added, "videos": videos}, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(resp)))
            self.end_headers()
            self.wfile.write(resp)
            return

        # API: /api/job-alerts
        if self.path.startswith('/api/job-alerts'):
            force = 'force=true' in self.path
            jobs, new_added = fetch_live_job_alerts(force=force)
            resp = json.dumps({"status": "success", "count": len(jobs), "newAdded": new_added, "jobs": jobs}, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(resp)))
            self.end_headers()
            self.wfile.write(resp)
            return

        # API: /api/sync-job-alerts
        if self.path.startswith('/api/sync-job-alerts'):
            jobs, new_added = fetch_live_job_alerts(force=True)
            resp = json.dumps({"status": "success", "count": len(jobs), "newAdded": new_added, "jobs": jobs}, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(resp)))
            self.end_headers()
            self.wfile.write(resp)
            return

        # API: /api/job-sources
        if self.path.startswith('/api/job-sources'):
            sources = get_job_sources()
            resp = json.dumps({"status": "success", "count": len(sources), "sources": sources}, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(resp)))
            self.end_headers()
            self.wfile.write(resp)
            return

        # Clean query strings / hashes
        clean_path = self.path.split('?')[0].split('#')[0]

        # Block direct download of server scripts and configuration files
        FORBIDDEN_EXTENSIONS = ('.py', '.bat', '.cmd', '.sh', '.yaml', '.yml', '.env')
        if any(clean_path.lower().endswith(ext) for ext in FORBIDDEN_EXTENSIONS):
            self.send_response(403)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write(b"403 Forbidden: Direct access to source code is restricted.")
            return

        # If requesting root or empty, serve index.html
        if clean_path in ('', '/'):
            self.path = '/index.html'
        else:
            local_file = os.path.join(DIRECTORY, clean_path.lstrip('/'))
            if not os.path.exists(local_file) and not os.path.splitext(clean_path)[1]:
                # SPA routing fallback: route without extension falls back to index.html
                self.path = '/index.html'

        return super().do_GET()

    def end_headers(self):
        self.send_cors_headers()
        super().end_headers()

def run_server():
    env_port = os.environ.get('PORT')
    if env_port and env_port.isdigit():
        port = int(env_port)
    elif len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    else:
        port = PORT
    for attempt in range(10):
        try:
            server = ThreadingHTTPServer(('0.0.0.0', port), VuoHttpHandler)
            print("=================================================================")
            print("   VUO CSC HELP DESK - MULTI-THREADED WEB SERVER ACTIVE   ")
            print("=================================================================")
            print(f" >> Local Browser URL:    http://localhost:{port}")
            print(f" >> Localhost IP URL:     http://127.0.0.1:{port}")
            print(f" >> Passphoto Studio:     http://localhost:{port}#passphoto")
            print(f" >> Offline Forms:        http://localhost:{port}#forms")
            print(f" >> CSC Bills:            http://localhost:{port}#billmaker")
            print(f" >> Root Directory:       {DIRECTORY}")
            print("=================================================================")
            print(" Ready to serve requests. Press Ctrl+C to stop.")
            print("=================================================================")
            sys.stdout.flush()
            server.serve_forever()
        except OSError as e:
            # Error 10048 = Address already in use
            if getattr(e, 'errno', None) == 10048 or "10048" in str(e) or "already in use" in str(e).lower():
                print(f"Port {port} busy, switching to {port + 1}...")
                port += 1
            else:
                raise e

if __name__ == '__main__':
    run_server()
