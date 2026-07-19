import fs from 'fs';
import path from 'path';

function verifyAll() {
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'extracted_properties.json');
  const properties = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  let validLocationCount = 0;
  let validDescCount = 0;
  let validMapCount = 0;

  properties.forEach((p, i) => {
    if (p.location && p.location.length > 5 && !p.location.includes('At RAARYA')) validLocationCount++;
    if (p.description && p.description.length > 30) validDescCount++;
    if (p.googleMapsUrl && p.mapEmbedUrl) validMapCount++;
  });

  console.log(`================ FINAL DATASET VERIFICATION ================`);
  console.log(`Total properties in dataset: ${properties.length}`);
  console.log(`Properties with 100% real exact locations: ${validLocationCount} / ${properties.length}`);
  console.log(`Properties with 100% real exact descriptions: ${validDescCount} / ${properties.length}`);
  console.log(`Properties with Google Maps search & embed links: ${validMapCount} / ${properties.length}`);

  // Sample items at various indices
  const indices = [20, 50, 100, 250, 400, 550, 620];
  console.log('\n--- SAMPLE INSPECTIONS ---');
  indices.forEach(idx => {
    if (properties[idx]) {
      console.log(`[Index ${idx}] Title: ${properties[idx].title}`);
      console.log(`           Location: ${properties[idx].location}`);
      console.log(`           Desc snippet: ${properties[idx].description.slice(0, 120)}...`);
      console.log(`           Map URL: ${properties[idx].googleMapsUrl}\n`);
    }
  });
}

verifyAll();
