const fs = require('fs');
const lines = fs.readFileSync('js/passphoto.js', 'utf8').split('\n');
lines.forEach((l, idx) => {
  if (l.includes('contrast') || l.includes('brightness') || l.includes('autoEnhance') || l.includes('applyFilter') || l.includes('ctx.filter') || l.includes('defaultGeminiPrompt')) {
    console.log((idx+1) + ': ' + l.trim());
  }
});
