import fs from 'fs';
import path from 'path';

function verifyOverview() {
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'extracted_properties.json');
  const properties = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  const sampleIndices = [0, 1, 2, 20, 50, 100, 250, 400, 550];

  console.log('================ SAMPLE OVERVIEW DATA ================');
  sampleIndices.forEach(idx => {
    const p = properties[idx];
    if (p) {
      console.log(`[Index ${idx}] Title: ${p.title}`);
      console.log(`           Type/SubType: ${p.type} / ${p.subType}`);
      console.log(`           Area Display: ${p.areaDisplay}`);
      console.log(`           Overview Details:`, JSON.stringify(p.overviewDetails));
      console.log(`           Listed By: ${p.agentName} (${p.agentPhone})\n`);
    }
  });
}

verifyOverview();
