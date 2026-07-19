import fs from 'fs';
import path from 'path';

function verifyAgents() {
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'extracted_properties.json');
  const properties = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  console.log(`================ VERIFYING AGENTS & DYNAMIC UNITS ================`);
  const sampleIndices = [2, 5, 20, 50, 100, 250, 400];

  sampleIndices.forEach(idx => {
    const p = properties[idx];
    if (p) {
      console.log(`[Index ${idx}] Title: ${p.title}`);
      console.log(`           Listed By: ${p.agentName}`);
      console.log(`           Phone: ${p.agentPhone || (p.agentPhones ? p.agentPhones[0] : 'None')}`);
      console.log(`           Area Display: ${p.areaDisplay || p.area + ' ' + (p.areaUnit || 'sq.ft')}`);
      console.log(`           Area Unit: ${p.areaUnit || 'sq.ft'}`);
      console.log(`           Points Count: ${p.descriptionPoints ? p.descriptionPoints.length : 0}\n`);
    }
  });
}

verifyAgents();
