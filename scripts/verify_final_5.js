import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../src/data/extracted_properties.json');
const properties = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const targets = [
  'Residential land in Kurumbapalayam - Avanta',
  'Residential DTCP Approved Plots in Annur | Brahma Park',
  'Residential Plots in Kinathukadavu – Golden Vista',
  'SK Garden - Avinashi Road, Near Kaniyur Toll Gate',
  'Thangam | Thekkalur, Avinashi Road'
];

console.log('=== VERIFYING FINAL DATASET FOR 5 TARGET PROPERTIES ===');

targets.forEach(t => {
  const p = properties.find(item => item.title && item.title.toLowerCase().includes(t.toLowerCase().substring(0, 15)));
  if (!p) {
    console.error(`ERROR: Could not find property matching "${t}"!`);
    return;
  }
  console.log(`\nProperty: ${p.title}`);
  console.log(`- ID: ${p.id}`);
  console.log(`- Price: ${p.price}`);
  console.log(`- Location: ${p.location}`);
  console.log(`- Type: ${p.type}`);
  console.log(`- Main Image: ${p.image}`);
  console.log(`- Gallery Images (${p.images ? p.images.length : 0}):`, p.images);
  console.log(`- Section Flags: recommended=${p.isRecommended}, demanded=${p.isDemanded}, new=${p.isNew}`);
  console.log(`- Overview Details:`, p.overviewDetails);
  console.log(`- Description Points Count: ${p.descriptionPoints ? p.descriptionPoints.length : 0}`);

  // Verify file existence of images
  if (p.image) {
    const pubFile = path.join(__dirname, '../public', p.image);
    const exists = fs.existsSync(pubFile);
    console.log(`- Local File Exists on Disk (${p.image}): ${exists ? 'YES ✓' : 'NO ✗'}`);
  }
});

const recommended = properties.filter(p => p.isRecommended);
const demanded = properties.filter(p => p.isDemanded);
const newListings = properties.filter(p => p.isNew);
const buyCount = properties.filter(p => p.type === 'buy').length;

console.log('\n=== SHOWCASE SECTION SUMMARY ===');
console.log(`Recommended for You Total: ${recommended.length}`);
console.log(`Demanded Projects Total: ${demanded.length}`);
console.log(`New Properties Total: ${newListings.length}`);
console.log(`Buy Catalog Total: ${buyCount}`);
