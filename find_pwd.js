const fs = require('fs');
const path = require('path');
const jsDir = 'js';
fs.readdirSync(jsDir).forEach(f => {
  if (f.endsWith('.js')) {
    const lines = fs.readFileSync(path.join(jsDir, f), 'utf8').split('\n');
    lines.forEach((l, idx) => {
      if (l.includes('passwordHash') || l.includes('resetPassword') || l.includes('sampleMembers') || l.includes('vuo_vle_users')) {
        console.log(f + ':' + (idx+1) + ': ' + l.trim());
      }
    });
  }
});
