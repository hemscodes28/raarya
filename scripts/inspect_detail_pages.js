import fs from 'fs';
import path from 'path';

async function inspectSampleDetails() {
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'extracted_properties.json');
  const properties = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  console.log(`Loaded ${properties.length} properties.`);
  
  // Pick 5 samples: 3 Buy, 2 Rent
  const samples = [
    properties.find(p => p.type === 'buy' && p.subType === 'Plot'),
    properties.find(p => p.type === 'buy' && p.subType === 'House'),
    properties.find(p => p.type === 'buy' && p.subType === 'Villa'),
    properties.find(p => p.type === 'rent' && p.subType === 'Flat'),
    properties.find(p => p.type === 'rent')
  ].filter(Boolean);

  for (const p of samples) {
    console.log(`\n==================================================`);
    console.log(`Testing property: ${p.title} (${p.link})`);
    if (!p.link) continue;

    try {
      const res = await fetch(p.link);
      const html = await res.text();
      console.log(`Fetched HTML length: ${html.length}`);

      // Extract all project/gallery images
      const imgMatches = [...html.matchAll(/src=["']([^"']+(?:uploads|project_image|property|gallery)[^"']*)["']/gi)].map(m => m[1]);
      const uniqueImgs = Array.from(new Set(imgMatches)).map(url => url.startsWith('http') ? url : 'https://www.raarya.com/' + url.replace(/^\//, ''));
      console.log(`Gallery Images found (${uniqueImgs.length}):`, uniqueImgs);

      // Extract specification key-values or tables
      const textNoScripts = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
      
      // Look for specs / overview table or lists
      const specItems = [];
      const liMatches = [...textNoScripts.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
      for (const m of liMatches) {
        const txt = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (txt.includes(':') || txt.includes('Approved') || txt.includes('BHK') || txt.includes('Facing') || txt.includes('Road') || txt.includes('Area')) {
          specItems.push(txt);
        }
      }
      console.log(`Spec items sample:`, specItems.slice(0, 10));

      // Extract main description paragraph(s)
      const descMatch = textNoScripts.match(/<div class=["'](?:description|prop-description|content|details-box|flat-desc|overview-box|box-desc)["'][^>]*>([\s\S]*?)<\/div>/i) ||
                        textNoScripts.match(/<p[^>]*class=["'](?:text|desc|caption)[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
      
      if (descMatch) {
        console.log(`Extracted Description snippet:`, descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 300));
      }

    } catch (err) {
      console.error(`Error fetching ${p.link}:`, err.message);
    }
  }
}

inspectSampleDetails().catch(console.error);
