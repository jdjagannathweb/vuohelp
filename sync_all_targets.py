import os
import shutil
import hashlib

WORKSPACE = r"C:\Users\Jagannath\.gemini\antigravity\scratch\vuo-csc-help"

# Ensure 200.html is exact clone of index.html
shutil.copyfile(os.path.join(WORKSPACE, "index.html"), os.path.join(WORKSPACE, "200.html"))

# 1. Update HOW_TO_UPLOAD.txt
how_to_content = """========================================================
VUO CSC HELP DESK - GITHUB UPLOAD INSTRUCTIONS
========================================================

Nayi Job Alert Service, 5 Website Auto-Sync Portals aur latest features ke liye ye files update hui hain:

ROOT FOLDER FILES (Root directory me upload karein):
1. index.html            (Main website with Job Alert Desk & Admin 5 Portals)
2. 200.html              (SPA routing - byte-for-byte clone of index.html)
3. server.py             (5-Portal multi-source scraper & REST API)
4. job_alerts.json       (Curated & cached Govt Job database)
5. job_sources.json      (5 Configured website portals for auto-sync)
6. render.yaml           (Render hosting configuration)
7. requirements.txt      (Python configuration)

CSS FOLDER FILES (GitHub me 'css' folder khol kar upload karein):
1. css/custom.css        (A4 layout, print rules, styles)

JS FOLDER FILES (GitHub me 'js' folder khol kar upload karein):
1. js/resumemaker.js     (Resume & Biodata A4 builder, pagination & PDF engine)
2. js/jobalert.js        (Job Alert UI & multi-source sync module)
3. js/admin.js           (Admin control center with 5 portal configs & job publisher)
4. js/app.js             (App router, search & module dispatcher)
5. js/passphoto.js       (Passport photo studio)
6. js/whatsapp-resizer.js (WhatsApp image resizer & darkness clear)

--------------------------------------------------------
KAISE UPLOAD KAREIN (STEP-BY-STEP DIRECT GITHUB WEB PE):
--------------------------------------------------------
1. GitHub me apna repo kholein (vuo-csc-help / vuohelpdesk).
2. 'Add file' -> 'Upload files' par click karein.
3. GITHUB_UPLOAD_FILES folder se:
   - index.html
   - 200.html
   - server.py
   - job_alerts.json
   - job_sources.json
   - render.yaml
   - requirements.txt
   ko drag and drop karein.
4. Niche 'Commit changes' par click karein.
5. Ab repo ke andar 'css' folder par click karein (ya create karein).
   Waha GITHUB_UPLOAD_FILES/css/custom.css upload karein aur Commit karein.
6. Ab repo ke andar 'js' folder par click karke open karein.
7. Waha 'Add file' -> 'Upload files' par click karein.
8. GITHUB_UPLOAD_FILES/js folder se:
   - resumemaker.js
   - jobalert.js
   - admin.js
   - app.js
   - passphoto.js
   - whatsapp-resizer.js
   ko drag and drop karein aur 'Commit changes' karein.
9. Render / GitHub Pages automatically 1-2 minute me live update kar dega!
========================================================
"""

with open(os.path.join(WORKSPACE, "HOW_TO_UPLOAD.txt"), "w", encoding="utf-8") as f:
    f.write(how_to_content)

FILES_FOR_GITHUB = [
    ("index.html", "index.html"),
    ("200.html", "200.html"),
    ("css/custom.css", "css/custom.css"),
    ("server.py", "server.py"),
    ("job_alerts.json", "job_alerts.json"),
    ("job_sources.json", "job_sources.json"),
    ("render.yaml", "render.yaml"),
    ("requirements.txt", "requirements.txt"),
    ("HOW_TO_UPLOAD.txt", "HOW_TO_UPLOAD.txt"),
    ("js/resumemaker.js", "js/resumemaker.js"),
    ("js/jobalert.js", "js/jobalert.js"),
    ("js/admin.js", "js/admin.js"),
    ("js/app.js", "js/app.js"),
    ("js/passphoto.js", "js/passphoto.js"),
    ("js/whatsapp-resizer.js", "js/whatsapp-resizer.js"),
]

GITHUB_TARGET_DIRS = [
    r"C:\Users\Jagannath\Desktop\GITHUB_UPLOAD_FILES",
    r"C:\Users\Jagannath\OneDrive\Desktop\GITHUB_UPLOAD_FILES",
    r"C:\Users\Jagannath\Downloads\GITHUB_UPLOAD_FILES",
]

FULL_PROJECT_TARGET_DIRS = [
    r"C:\Users\Jagannath\Desktop\vuo-csc-help",
    r"C:\Users\Jagannath\OneDrive\Desktop\vuo-csc-help",
    r"C:\Users\Jagannath\Downloads\vuo-csc-help",
]

print("=== SYNCING GITHUB_UPLOAD_FILES ===")
for target in GITHUB_TARGET_DIRS:
    os.makedirs(target, exist_ok=True)
    os.makedirs(os.path.join(target, "js"), exist_ok=True)
    for src_rel, dst_rel in FILES_FOR_GITHUB:
        src = os.path.join(WORKSPACE, src_rel)
        dst = os.path.join(target, dst_rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copyfile(src, dst)
    print(f"Synced {len(FILES_FOR_GITHUB)} files -> {target}")

print("\n=== FULL PROJECT SYNC ===")
for target in FULL_PROJECT_TARGET_DIRS:
    os.makedirs(target, exist_ok=True)
    copied_count = 0
    for root, dirs, files in os.walk(WORKSPACE):
        # Skip git or cache dirs
        if any(ignored in root for ignored in [".git", "__pycache__", ".idea", ".vscode"]):
            continue
        rel_dir = os.path.relpath(root, WORKSPACE)
        dest_dir = os.path.join(target, rel_dir) if rel_dir != "." else target
        os.makedirs(dest_dir, exist_ok=True)
        for f in files:
            if f.endswith(('.pyc', '.tmp')):
                continue
            src_f = os.path.join(root, f)
            dst_f = os.path.join(dest_dir, f)
            shutil.copyfile(src_f, dst_f)
            copied_count += 1
    print(f"Synced {copied_count} files -> {target}")

# Verification of MD5 hashes
def get_md5(p):
    return hashlib.md5(open(p, "rb").read()).hexdigest()

print("\n=== MD5 INTEGRITY CHECK ===")
idx_hash = get_md5(os.path.join(WORKSPACE, "index.html"))
spa_hash = get_md5(os.path.join(WORKSPACE, "200.html"))
print(f"Workspace index.html : {idx_hash}")
print(f"Workspace 200.html   : {spa_hash}")
assert idx_hash == spa_hash, "index.html and 200.html MD5 mismatch!"

for target in GITHUB_TARGET_DIRS:
    t_idx = get_md5(os.path.join(target, "index.html"))
    t_spa = get_md5(os.path.join(target, "200.html"))
    assert t_idx == idx_hash, f"Mismatch at {target} index.html"
    assert t_spa == spa_hash, f"Mismatch at {target} 200.html"
    print(f"Verified {target}: MD5 MATCH OK")

print("\nALL SYNC & INTEGRITY VERIFICATIONS PASSED SUCCESSFULLY!")
