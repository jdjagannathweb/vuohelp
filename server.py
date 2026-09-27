import os
import sys
import json
import time
import urllib.request
import re
import mimetypes
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

# Force UTF-8 on Windows command prompts
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 8000
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
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')

    def do_OPTIONS(self):
        self.send_response(200, "OK")
        self.send_header('Content-Length', '0')
        self.end_headers()

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
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

        # Clean query strings / hashes
        clean_path = self.path.split('?')[0].split('#')[0]

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
