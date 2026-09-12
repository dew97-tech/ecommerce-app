const fs = require('fs');
const path = require('path');

const BRAIN_DIR = process.env.GEMINI_BRAIN_DIR || '';
const ASSETS_DIR = path.join(process.cwd(), 'assets');

function syncTiles() {
  if (!BRAIN_DIR) {
    console.log(
      'GEMINI_BRAIN_DIR is not set. Add the folder that contains generated ' +
        'category_<key>_<timestamp>.jpg files to .env, then run npm run tiles:sync.'
    );
    return;
  }
  if (!fs.existsSync(BRAIN_DIR)) {
    console.error('Brain dir not found:', BRAIN_DIR);
    return;
  }
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }

  const files = fs.readdirSync(BRAIN_DIR);
  const pattern = /^category_([a-z0-9_-]+)_\d+\.(jpg|jpeg|png)$/i;

  const keyMap = {
    server_storage: 'server-storage',
    office_equipment: 'office-equipment',
  };

  let count = 0;
  for (const file of files) {
    const match = file.match(pattern);
    if (!match) continue;

    let key = match[1];
    if (keyMap[key]) {
      key = keyMap[key];
    } else {
      key = key.replace(/_/g, '-');
    }
    const src = path.join(BRAIN_DIR, file);
    const dest = path.join(ASSETS_DIR, `category_${key}.jpg`);

    let shouldCopy = true;
    if (fs.existsSync(dest)) {
      const srcStat = fs.statSync(src);
      const destStat = fs.statSync(dest);
      if (destStat.mtimeMs >= srcStat.mtimeMs) {
        shouldCopy = false;
      }
    }

    if (shouldCopy) {
      fs.copyFileSync(src, dest);
      console.log(`Copied ${file} -> assets/category_${key}.jpg`);
      count++;
    }
  }

  console.log(`Synced ${count} new/updated tile(s) to assets/.`);
}

syncTiles();
