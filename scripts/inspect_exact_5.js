import fs from 'fs';
import path from 'path';

const jsonPath = path.join(process.cwd(), 'src', 'data', 'extracted_properties.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const names = [
  'Residential land in Kurumbapalayam - Avanta',
  'Residential DTCP Approved Plots in Annur | Brahma Park',
  'Residential Plots in Kinathukadavu – Golden',
  'SK Garden - Avinashi Road, Near Kaniyur Toll Gate',
  'Thangam | Thekkalur, Avinashi Road'
];

names.forEach((name, i) => {
  console.log(`\n========================================`);
  console.log(`[TARGET ${i+1}] ${name}`);
  console.log(`========================================`);
  const matches = data.filter(p => p.title && (p.title.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(p.title.toLowerCase())));
  console.log(`Found ${matches.length} matches in JSON:`);
  matches.forEach(m => {
    console.log({
      id: m.id,
      title: m.title,
      price: m.price,
      location: m.location,
      link: m.link,
      image: m.image,
      imagesCount: m.images ? m.images.length : 0,
      isRecommended: m.isRecommended,
      isDemanded: m.isDemanded,
      isNew: m.isNew,
      type: m.type,
      overviewDetails: m.overviewDetails,
      descriptionPoints: m.descriptionPoints
    });
  });
});
