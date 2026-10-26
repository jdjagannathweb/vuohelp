import subprocess
import os

html_path = os.path.abspath(r"C:\Users\Jagannath\.gemini\antigravity\scratch\vuo-csc-help\index.html").replace("\\", "/")

# Let's create a test harness that logs window.onerror and console errors to the DOM
harness_html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<div id="debug-log"></div>
<script>
  window.collectedErrors = [];
  window.onerror = function(msg, url, line, col, error) {{
    window.collectedErrors.push('ONERROR: ' + msg + ' at ' + url + ':' + line + ':' + col);
  }};
  const origError = console.error;
  console.error = function(...args) {{
    window.collectedErrors.push('CONSOLE.ERROR: ' + args.join(' '));
    origError.apply(console, args);
  }};
  const origWarn = console.warn;
  console.warn = function(...args) {{
    window.collectedErrors.push('CONSOLE.WARN: ' + args.join(' '));
    origWarn.apply(console, args);
  }};
</script>
<iframe id="testFrame" src="file:///{html_path}#admin" style="width:1000px; height:800px;"></iframe>
<script>
  setTimeout(() => {{
    const frame = document.getElementById('testFrame');
    try {{
      const frameDoc = frame.contentDocument || frame.contentWindow.document;
      const adminRoot = frameDoc.getElementById('adminView') || frameDoc.getElementById('adminSection');
      console.log('Frame loaded');
    }} catch(e) {{
      window.collectedErrors.push('IFRAME ACCESS ERROR: ' + e.message);
    }}
    document.getElementById('debug-log').innerText = JSON.stringify(window.collectedErrors, null, 2);
  }}, 3000);
</script>
</body>
</html>
"""

with open("admin_harness.html", "w", encoding="utf-8") as f:
    f.write(harness_html)

chrome_bin = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
harness_path = os.path.abspath("admin_harness.html").replace("\\", "/")

cmd = [
    chrome_bin,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--dump-dom",
    "--virtual-time-budget=5000",
    f"file:///{harness_path}"
]

res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", errors="replace")
print("OUTPUT:")
print(res.stdout)
