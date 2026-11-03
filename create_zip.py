import os
import zipfile
import shutil

source_dir = r"C:\Users\Jagannath\.gemini\antigravity\scratch\vuohelp"
target_downloads_synced = r"C:\Users\Jagannath\Downloads\vuohelp_synced.zip"
target_downloads_default = r"C:\Users\Jagannath\Downloads\vuohelp.zip"
target_artifacts = r"C:\Users\Jagannath\.gemini\antigravity\brain\376289d7-bbf5-4fa2-b6d7-88779e394e6a\vuohelp_synced.zip"

excluded_dirs = {'.git', '__pycache__', '.pytest_cache', '.vscode', '.idea'}
excluded_files = {'.DS_Store'}

print(f"Creating zip archive from {source_dir}...")

with zipfile.ZipFile(target_downloads_synced, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zipf:
    for root, dirs, files in os.walk(source_dir):
        # Exclude directories in-place
        dirs[:] = [d for d in dirs if d not in excluded_dirs]
        for file in files:
            if file in excluded_files:
                continue
            full_path = os.path.join(root, file)
            # Store relative to vuohelp
            rel_path = os.path.relpath(full_path, source_dir)
            zipf.write(full_path, arcname=rel_path)

file_size_mb = os.path.getsize(target_downloads_synced) / (1024 * 1024)
print(f"Successfully created: {target_downloads_synced} ({file_size_mb:.2f} MB)")

# Copy to vuohelp.zip in Downloads
shutil.copy2(target_downloads_synced, target_downloads_default)
print(f"Copied to: {target_downloads_default}")

# Copy to artifacts directory
shutil.copy2(target_downloads_synced, target_artifacts)
print(f"Copied to artifacts: {target_artifacts}")
