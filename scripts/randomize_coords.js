const fs = require('fs');
const path = require('path');

const SCRIPT_FILE = path.join(__dirname, '..', 'proxypin_wloc_compat_v2.js');

// 匹配坐标行，可选的尾部注释会被捕获并丢弃
const LON_MATCH = /var TARGET_LONGITUDE\s*=\s*([0-9]+\.?[0-9]*)\s*;(?:\s*\/\/.*)?/;
const LAT_MATCH = /var TARGET_LATITUDE\s*=\s*([0-9]+\.?[0-9]*)\s*;(?:\s*\/\/.*)?/;

const BASE_LON = 121.451423;
const BASE_LAT = 31.016176;

function gaussRandom() {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

const MAX_SHIFT_M = 8;
const LON_SHIFT_M = Math.min(Math.abs(gaussRandom() * 3), MAX_SHIFT_M);
const LAT_SHIFT_M = Math.min(Math.abs(gaussRandom() * 3), MAX_SHIFT_M);
const lonSign = Math.random() < 0.5 ? -1 : 1;
const latSign = Math.random() < 0.5 ? -1 : 1;

const newLon = (BASE_LON + lonSign * LON_SHIFT_M / 111320 / Math.cos(BASE_LAT * Math.PI / 180)).toFixed(6);
const newLat = (BASE_LAT + latSign * LAT_SHIFT_M / 111320).toFixed(6);

const content = fs.readFileSync(SCRIPT_FILE, 'utf8');

if (!content.match(LON_MATCH) || !content.match(LAT_MATCH)) {
  console.error('Could not locate coordinate declarations in script');
  process.exit(1);
}

const today = new Date();
const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}:${String(today.getSeconds()).padStart(2, '0')}`;

const updated = content
  .replace(LON_MATCH, `var TARGET_LONGITUDE = ${newLon};  // 更新于 ${dateStr}`)
  .replace(LAT_MATCH, `var TARGET_LATITUDE  = ${newLat};  // 更新于 ${dateStr}`);

fs.writeFileSync(SCRIPT_FILE, updated, 'utf8');

const lonDelta = ((newLon - BASE_LON) * 111320 * Math.cos(BASE_LAT * Math.PI / 180)).toFixed(1);
const latDelta = ((newLat - BASE_LAT) * 111320).toFixed(1);

console.log(`base:  ${BASE_LON}, ${BASE_LAT}`);
console.log(`new:   ${newLon}, ${newLat}`);
console.log(`shift: ~${lonDelta}m E/W, ~${latDelta}m N/S`);
