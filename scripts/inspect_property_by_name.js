import fs from 'fs';
import path from 'path';

function inspectThudiyalur() {
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'extracted_properties.json');
  const properties = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  const index = properties.findIndex(p => p.title.toLowerCase().includes('thoppampatti') || p.title.toLowerCase().includes('thudiyalur'));
  console.log(`Index of Thoppampatti property: ${index} of ${properties.length}`);

  if (index !== -1) {
    console.log('\n--- TARGET PROPERTY ---');
    console.log(JSON.stringify(properties[index], null, 2));

    console.log('\n--- NEXT PROPERTY AT INDEX ' + (index + 1) + ' ---');
    console.log(JSON.stringify(properties[index + 1], null, 2));

    console.log('\n--- NEXT PROPERTY AT INDEX ' + (index + 2) + ' ---');
    console.log(JSON.stringify(properties[index + 2], null, 2));
  }
}

inspectThudiyalur();
