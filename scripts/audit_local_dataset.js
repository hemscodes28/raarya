import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../src/data/extracted_properties.json');
const publicDir = path.join(__dirname, '../public');

const rawData = fs.readFileSync(jsonPath, 'utf8');
const properties = JSON.parse(rawData);

console.log(`=== DATASET AUDIT ===`);
console.log(`Total properties in dataset: ${properties.length}`);

// Category counts
const counts = {};
properties.forEach(p => {
  counts[p.type] = (counts[p.type] || 0) + 1;
});
console.log('\nProperty breakdown by category:', counts);

// Check image file existence on disk
let missingImages = 0;
let totalImageReferences = 0;

properties.forEach((p, idx) => {
  const imagesToCheck = [p.image, ...(Array.isArray(p.images) ? p.images : [])].filter(Boolean);
  
  imagesToCheck.forEach(imgRef => {
    totalImageReferences++;
    if (imgRef.startsWith('/uploads/')) {
      const diskPath = path.join(publicDir, imgRef);
      if (!fs.existsSync(diskPath) || fs.statSync(diskPath).size === 0) {
        console.error(`Missing or empty file on disk for prop #${p.id}: ${diskPath}`);
        missingImages++;
      }
    } else {
      console.warn(`Non-local image reference for prop #${p.id}: ${imgRef}`);
    }
  });
});

console.log(`\nImage audit: ${totalImageReferences} references checked.`);
console.log(`Missing images on disk: ${missingImages}`);

// Data completeness check
let missingTitle = 0;
let missingPrice = 0;
let missingLocation = 0;
let missingOverview = 0;
let missingDescription = 0;

properties.forEach(p => {
  if (!p.title) missingTitle++;
  if (!p.price) missingPrice++;
  if (!p.location) missingLocation++;
  if (!p.overviewDetails || Object.keys(p.overviewDetails).length === 0) missingOverview++;
  if (!p.description) missingDescription++;
});

console.log(`\nData Completeness Check:`);
console.log(`- Missing Title: ${missingTitle}`);
console.log(`- Missing Price: ${missingPrice}`);
console.log(`- Missing Location: ${missingLocation}`);
console.log(`- Missing Overview Details: ${missingOverview}`);
console.log(`- Missing Description: ${missingDescription}`);
