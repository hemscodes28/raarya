import fs from 'fs';
import path from 'path';

async function testListedBy() {
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'extracted_properties.json');
  const properties = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  const sampleLinks = [
    'https://www.raarya.com/properties-views/dtcp---rera-approved-plots-in-coimbatore---premium-layout/23/',
    'https://www.raarya.com/properties-views/approved-plots-in-coimbatore---best-investment-location/26/',
    'https://www.raarya.com/properties-views/magizh-enclave-/385/',
    'https://www.raarya.com/properties-views/2bhk-flat-for-rent-in-ganapathy/555/',
    'https://www.raarya.com/properties-views/sri-pps/277/'
  ];

  for (const url of sampleLinks) {
    console.log(`\n==================================================`);
    console.log(`Fetching: ${url}`);
    const res = await fetch(url);
    const html = await res.text();

    // 1. Listed By Block
    const listedByBlock = html.match(/Listed by\s*([\s\S]*?)(?:<footer|<\/div>)/i) ||
                          html.match(/LISTED BY\s*([\s\S]*?)(?:<footer|<\/div>)/i) ||
                          html.match(/rp-contact-name["'][^>]*>([\s\S]*?)<\/h\d>/i);

    // Regex for Listed by name
    const nameMatch = html.match(/Listed by\s*([a-zA-Z\s]{2,30})/i) ||
                      html.match(/rp-contact-name["'][^>]*>([\s\S]*?)<\/div>/i);
    
    console.log('NAME MATCH:', nameMatch ? nameMatch[1].replace(/<[^>]+>/g, '').trim() : 'None');

    // Phone numbers inside listed by section
    const phoneMatches = [...html.matchAll(/tel:\+?91?(\d{10})/gi)].map(m => m[1])
      .concat([...html.matchAll(/(\d{10})/g)].map(m => m[1]));
    
    // Filter out common site-wide footer phone if specific phone exists
    console.log('PHONE MATCHES:', Array.from(new Set(phoneMatches)).slice(0, 5));

    // 2. Overview Table Details
    const overviewSection = html.match(/Property Overview\s*([\s\S]*?)(?:Location on Map|Listed by|<footer)/i);
    if (overviewSection) {
      const text = overviewSection[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      console.log('OVERVIEW TEXT:', text);
    }
  }
}

testListedBy().catch(console.error);
