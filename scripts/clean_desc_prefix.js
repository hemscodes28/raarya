import fs from 'fs';
import path from 'path';

function stripDescriptionPrefix() {
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'extracted_properties.json');
  const properties = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  for (const p of properties) {
    if (p.description) {
      p.description = p.description.replace(/^Description\s*/i, '').trim();
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(properties, null, 2), 'utf-8');
  console.log('Cleaned description prefixes.');
}

stripDescriptionPrefix();
