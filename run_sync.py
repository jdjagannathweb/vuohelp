import os
import shutil
import zipfile

src_dir = r"C:\Users\Jagannath\.gemini\antigravity\scratch\vuohelp"
dest_folder = r"C:\Users\Jagannath\Downloads\vuohelp_synced"
zip_path = r"C:\Users\Jagannath\Downloads\vuohelp_synced.zip"

changed_dest_folder = r"C:\Users\Jagannath\Downloads\vuohelp_changed_files"
changed_zip_path = r"C:\Users\Jagannath\Downloads\vuohelp_changed_files.zip"

artifact_synced_zip = r"C:\Users\Jagannath\.gemini\antigravity\brain\376289d7-bbf5-4fa2-b6d7-88779e394e6a\vuohelp_synced.zip"
artifact_changed_zip = r"C:\Users\Jagannath\.gemini\antigravity\brain\376289d7-bbf5-4fa2-b6d7-88779e394e6a\vuohelp_changed_files.zip"

ignore_patterns = {'.git', '__pycache__', '.pytest_cache', '.vscode', '.idea'}
ignore_exts = {'.pyc'}

# 1. Clean and sync full folder
if os.path.exists(dest_folder):
    shutil.rmtree(dest_folder, ignore_errors=True)
os.makedirs(dest_folder, exist_ok=True)

total_files = 0
total_bytes = 0

for root, dirs, files in os.walk(src_dir):
    dirs[:] = [d for d in dirs if d not in ignore_patterns]
    rel_root = os.path.relpath(root, src_dir)
    target_root = os.path.join(dest_folder, rel_root) if rel_root != '.' else dest_folder
    os.makedirs(target_root, exist_ok=True)
    
    for f in files:
        if any(f.endswith(ext) for ext in ignore_exts) or f.startswith('.'):
            continue
        s_file = os.path.join(root, f)
        d_file = os.path.join(target_root, f)
        shutil.copy2(s_file, d_file)
        total_files += 1
        total_bytes += os.path.getsize(s_file)

print(f"✓ Copied {total_files} files ({total_bytes / (1024*1024):.2f} MB) to {dest_folder}")

# 2. Create vuohelp_synced.zip in Downloads
if os.path.exists(zip_path):
    os.remove(zip_path)

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(dest_folder):
        for f in files:
            full = os.path.join(root, f)
            arcname = os.path.relpath(full, dest_folder)
            zf.write(full, arcname)

zip_size_mb = os.path.getsize(zip_path) / (1024*1024)
print(f"✓ Created FULL SYNC ZIP: {zip_path} ({zip_size_mb:.2f} MB)")

# 3. Copy vuohelp_synced.zip to artifact dir
shutil.copy2(zip_path, artifact_synced_zip)

# 4. Prepare vuohelp_changed_files
if os.path.exists(changed_dest_folder):
    shutil.rmtree(changed_dest_folder, ignore_errors=True)
os.makedirs(changed_dest_folder, exist_ok=True)

key_files = [
    'index.html',
    '200.html',
    'admin.js',
    'js/admin.js',
    'vlestore.js',
    'js/vlestore.js',
    'server.py',
    'css/custom.css',
    'js/app.js',
    'js/passphoto.js',
    'js/jobalert.js',
    'js/resumemaker.js',
    'js/whatsapp-resizer.js',
    'js/pdftools.js',
    'js/imagetools.js'
]

for kf in key_files:
    sf = os.path.join(src_dir, kf.replace('/', os.sep))
    if os.path.exists(sf):
        df = os.path.join(changed_dest_folder, kf.replace('/', os.sep))
        os.makedirs(os.path.dirname(df), exist_ok=True)
        shutil.copy2(sf, df)

if os.path.exists(changed_zip_path):
    os.remove(changed_zip_path)

with zipfile.ZipFile(changed_zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(changed_dest_folder):
        for f in files:
            full = os.path.join(root, f)
            arcname = os.path.relpath(full, changed_dest_folder)
            zf.write(full, arcname)

shutil.copy2(changed_zip_path, artifact_changed_zip)
print(f"✓ Created CHANGED FILES ZIP: {changed_zip_path} ({os.path.getsize(changed_zip_path) / 1024:.1f} KB)")
