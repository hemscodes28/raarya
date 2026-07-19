import fs from 'fs';
import path from 'path';

function checkCoverage() {
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'extracted_properties.json');
  const properties = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  let deepFetched = 0;
  let missingDesc = 0;
  let missingMap = 0;

  properties.forEach((p, idx) => {
    const hasDeepDesc = p.description && p.description.length > 50 && !p.description.includes('Real property listing situated at');
    const hasMap = p.googleMapsUrl && p.mapEmbedUrl;
    
    if (hasDeepDesc) deepFetched++;
    if (!hasDeepDesc) missingDesc++;
    if (!hasMap) missingMap++;
  });

  console.log(`Total properties in dataset: ${properties.length}`);
  console.log(`Deeply fetched (full descriptions & maps): ${deepFetched}`);
  console.log(`Remaining to fetch: ${missingDesc}`);
}

checkCoverage();
