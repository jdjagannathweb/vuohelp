import sys
sys.stdout.reconfigure(encoding='utf-8')
content = open('index.html', encoding='utf-8').read()
idx = content.find('adminEditJobVacancies')
print(content[idx:idx+2500])
