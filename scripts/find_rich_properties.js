import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../src/data/extracted_properties.json');
const properties = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('=== RICH PROPERTIES WITH IMAGES AND DETAILS ===');

const richList = properties.filter(p => p.type === 'buy' && p.images && p.images.length >= 3 && p.overviewDetails && p.descriptionPoints);

console.log(`Found ${richList.length} rich buy properties in dataset:`);
richList.forEach((p, idx) => {
  console.log(`${idx + 1}. [${p.id}] ${p.title}`);
  console.log(`   Location: ${p.location} | Price: ${p.price}`);
  console.log(`   Images: ${p.images.length} | Flags: rec=${p.isRecommended}, dem=${p.isDemanded}, new=${p.isNew}`);
});
