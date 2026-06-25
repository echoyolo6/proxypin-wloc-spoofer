const fs = require('fs');
const path = require('path');

const SCRIPT_FILE = path.join(__dirname, '..', 'proxypin_wloc_compat_v2.js');

const LON_MATCH = /var TARGET_LONGITUDE\s*=\s*([0-9]+\.?[0-9]*)\s*;/;
const LAT_MATCH = /var TARGET_LATITUDE\s*=\s*([0-9]+\.?[0-9]*)\s*;/;

const BASE_LON = 121.451423;
const BASE_LAT = 31.016176;
const LON_DRIFT = 0.00002;
const LAT_DRIFT = 0.00003;

function rnd() {
  return (Math.random() * 2 - 1);
}

const newLon = (BASE_LON + rnd() * LON_DRIFT).toFixed(6);
const newLat = (BASE_LAT + rnd() * LAT_DRIFT).toFixed(6);

const content = fs.readFileSync(SCRIPT_FILE, 'utf8');

if (!content.match(LON_MATCH) || !content.match(LAT_MATCH)) {
  console.error('Could not locate coordinate declarations in script');
  process.exit(1);
}

const updated = content
  .replace(LON_MATCH, `var TARGET_LONGITUDE = ${newLon};`)
  .replace(LAT_MATCH, `var TARGET_LATITUDE  = ${newLat};`);

fs.writeFileSync(SCRIPT_FILE, updated, 'utf8');

const lonDelta = ((newLon - BASE_LON) * 111320 * Math.cos(BASE_LAT * Math.PI / 180)).toFixed(1);
const latDelta = ((newLat - BASE_LAT) * 111320).toFixed(1);

console.log(`base:  ${BASE_LON}, ${BASE_LAT}`);
console.log(`new:   ${newLon}, ${newLat}`);
console.log(`shift: ~${lonDelta}m E/W, ~${latDelta}m N/S`);
