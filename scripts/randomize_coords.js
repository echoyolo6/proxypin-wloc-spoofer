const fs = require('fs');
const path = require('path');

const SCRIPT_FILE = path.join(__dirname, '..', 'proxypin_wloc_compat_v2.js');

const LON_MATCH  = /var TARGET_LONGITUDE\s*=\s*([0-9]+\.?[0-9]*)\s*;/;
const LAT_MATCH  = /var TARGET_LATITUDE\s*=\s*([0-9]+\.?[0-9]*)\s*;/;

const LON_DRIFT  = 0.00002;
const LAT_DRIFT  = 0.00003;

function rnd() {
  return (Math.random() * 2 - 1);
}

const content = fs.readFileSync(SCRIPT_FILE, 'utf8');

const lonMatch = content.match(LON_MATCH);
const latMatch = content.match(LAT_MATCH);

if (!lonMatch || !latMatch) {
  console.error('Could not locate coordinate declarations in script');
  process.exit(1);
}

const prevLon = parseFloat(lonMatch[1]);
const prevLat = parseFloat(latMatch[1]);

const newLon = (prevLon + rnd() * LON_DRIFT).toFixed(6);
const newLat = (prevLat + rnd() * LAT_DRIFT).toFixed(6);

const updated = content
  .replace(LON_MATCH, `var TARGET_LONGITUDE = ${newLon};`)
  .replace(LAT_MATCH, `var TARGET_LATITUDE  = ${newLat};`);

fs.writeFileSync(SCRIPT_FILE, updated, 'utf8');

const lonDelta = ((newLon - prevLon) * 111320 * Math.cos(prevLat * Math.PI / 180)).toFixed(1);
const latDelta = ((newLat - prevLat) * 111320).toFixed(1);

console.log(`prev: ${prevLon}, ${prevLat}`);
console.log(`new:  ${newLon}, ${newLat}`);
console.log(`shift: ~${lonDelta}m E/W, ~${latDelta}m N/S`);
