import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../src/data/extracted_properties.json');
const properties = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// 1. Target 5 properties
const avanta = properties.find(p => p.id === 'prop-buy-244' || p.title.toLowerCase().includes('avanta'));
const brahma = properties.find(p => p.id === 'prop-buy-218' || p.title.toLowerCase().includes('brahma park'));
const golden = properties.find(p => p.id === 'prop-buy-159' || p.title.toLowerCase().includes('golden vista'));
const skgarden = properties.find(p => p.id === 'prop-buy-169' || p.title.toLowerCase().includes('sk garden'));
const thangam = properties.find(p => p.id === 'prop-buy-141' || p.title.toLowerCase().includes('thangam'));

// 2. Extra rich property to complete 3 for New Properties if needed
const thulir = properties.find(p => p.id === 'prop-buy-127' || p.title.toLowerCase().includes('thulir nagar'));

if (avanta) {
  avanta.isRecommended = true;
  avanta.isDemanded = false;
  avanta.isNew = false;
}

if (brahma) {
  brahma.isRecommended = true;
  brahma.isDemanded = true;
  brahma.isNew = false;
}

if (golden) {
  golden.isRecommended = true;
  golden.isDemanded = true;
  golden.isNew = false;
}

if (skgarden) {
  skgarden.isRecommended = false;
  skgarden.isDemanded = true;
  skgarden.isNew = true;
}

if (thangam) {
  thangam.isRecommended = false;
  thangam.isDemanded = false;
  thangam.isNew = true;
}

if (thulir) {
  thulir.isRecommended = false;
  thulir.isDemanded = false;
  thulir.isNew = true;
}

fs.writeFileSync(jsonPath, JSON.stringify(properties, null, 2), 'utf8');

console.log('Successfully updated section flags!');

const rec = properties.filter(p => p.isRecommended);
const dem = properties.filter(p => p.isDemanded);
const newProps = properties.filter(p => p.isNew);

console.log(`\n=== VERIFICATION ===`);
console.log(`Recommended for You (${rec.length}):`);
rec.forEach(p => console.log(`  - [${p.id}] ${p.title}`));

console.log(`Demanded Projects (${dem.length}):`);
dem.forEach(p => console.log(`  - [${p.id}] ${p.title}`));

console.log(`New Properties (${newProps.length}):`);
newProps.forEach(p => console.log(`  - [${p.id}] ${p.title}`));
