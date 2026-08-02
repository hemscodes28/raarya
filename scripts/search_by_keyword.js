import fs from 'fs';
import path from 'path';

const jsonPath = path.join(process.cwd(), 'src', 'data', 'extracted_properties.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const targets = [
  'Kurumbapalayam',
  'Annur',
  'Kinathukadavu',
  'SK Garden',
  'Thangam'
];

targets.forEach((t) => {
  console.log(`\n=== SEARCH FOR "${t}" ===`);
  const matches = data.filter(p => p.title && p.title.toLowerCase().includes(t.toLowerCase()));
  matches.forEach(m => {
    console.log(`ID: ${m.id} | TITLE: ${m.title}`);
    console.log(`LINK: ${m.link}`);
    console.log(`PRICE: ${m.price} | LOCATION: ${m.location}`);
    console.log(`IMAGES COUNT: ${m.images ? m.images.length : 0}`);
    console.log(`RECOMMENDED: ${m.isRecommended} | DEMANDED: ${m.isDemanded} | NEW: ${m.isNew}`);
    console.log(`----------------------------------------`);
  });
});
