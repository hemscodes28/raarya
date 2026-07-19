import fs from 'fs';
import path from 'path';

function cleanAgentNames() {
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'extracted_properties.json');
  const properties = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  for (const p of properties) {
    if (p.agentName) {
      // Strip trailing phone numbers from name
      let clean = p.agentName.replace(/\d{10}/g, '').trim();
      if (!clean || clean.length < 2) {
        clean = 'Rajkumar';
      }
      p.agentName = clean;
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(properties, null, 2), 'utf-8');
  console.log('Cleaned agent names across dataset.');
}

cleanAgentNames();
