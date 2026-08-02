import fs from 'fs';
import path from 'path';

const jsonPath = path.join(process.cwd(), 'src', 'data', 'extracted_properties.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const targets = [
  'Kurumbapalayam',
  'Annur',
  'Kinathukadavu',
  'Kaniyur',
  'Thekkalur'
];

targets.forEach(t => {
  const matches = data.filter(p => p.title && p.title.toLowerCase().includes(t.toLowerCase()));
  console.log(`\n=== Matches for ${t}: ${matches.length} ===`);
  matches.forEach(m => {
    console.log(JSON.stringify({
      id: m.id,
      title: m.title,
      price: m.price,
      location: m.location,
      link: m.link,
      image: m.image,
      images: m.images,
      isRecommended: m.isRecommended,
      isDemanded: m.isDemanded,
      isNew: m.isNew,
      overviewDetails: m.overviewDetails,
      descriptionPoints: m.descriptionPoints
    }, null, 2));
  });
});
