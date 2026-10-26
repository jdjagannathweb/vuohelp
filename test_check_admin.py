import os

ws = r"C:\Users\Jagannath\.gemini\antigravity\scratch\vuo-csc-help"
admin_file = os.path.join(ws, "js", "admin.js")

with open(admin_file, "r", encoding="utf-8") as f:
    code = f.read()

# Let's inspect where parseJobFromUrl is in js/admin.js
idx = code.find("parseJobFromUrl(rawUrl)")
if idx != -1:
    print("Found parseJobFromUrl in js/admin.js at index:", idx)
else:
    print("Not found!")
