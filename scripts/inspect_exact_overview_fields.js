import fs from 'fs';
import path from 'path';

async function testOverviewFields() {
  const sampleLinks = [
    'https://www.raarya.com/properties-views/dtcp---rera-approved-plots-in-coimbatore---premium-layout/23/',
    'https://www.raarya.com/properties-views/approved-plots-in-coimbatore---best-investment-location/26/',
    'https://www.raarya.com/properties-views/magizh-enclave-/385/',
    'https://www.raarya.com/properties-views/2bhk-flat-for-rent-in-ganapathy/555/',
    'https://www.raarya.com/properties-views/sri-pps/277/',
    'https://www.raarya.com/properties-views/dtcp-plot-for-sale-in-ganapathy-coimbatore---prime-area/47/',
    'https://www.raarya.com/properties-views/dtcp-approved-residential-land-–-sivanagar,-coimbatore/48/'
  ];

  for (const url of sampleLinks) {
    console.log(`\n==================================================`);
    console.log(`Fetching: ${url}`);
    const res = await fetch(url);
    const html = await res.text();

    const overviewMatch = html.match(/Property Overview\s*([\s\S]*?)(?:Location on Map|Listed by|<footer)/i);
    if (overviewMatch) {
      const rawText = overviewMatch[1];
      console.log('RAW OVERVIEW HTML:\n', rawText.replace(/<[^>]+>/g, ' | ').replace(/\s+/g, ' '));
    } else {
      console.log('OVERVIEW MATCH: None');
    }
  }
}

testOverviewFields().catch(console.error);
