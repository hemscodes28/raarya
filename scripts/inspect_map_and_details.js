import fs from 'fs';
import path from 'path';

async function inspectRealData() {
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'extracted_properties.json');
  const properties = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  // Test 5 properties
  const testLinks = [
    'https://www.raarya.com/properties-views/dtcp---rera-approved-plots-in-coimbatore---premium-layout/23/',
    'https://www.raarya.com/properties-views/approved-plots-in-coimbatore---best-investment-location/26/',
    'https://www.raarya.com/properties-views/magizh-enclave-/385/',
    'https://www.raarya.com/properties-views/2bhk-flat-for-rent-in-ganapathy/555/',
    'https://www.raarya.com/properties-views/sri-pps/277/'
  ];

  for (const url of testLinks) {
    console.log(`\n==================================================`);
    console.log(`Fetching: ${url}`);
    const res = await fetch(url);
    const html = await res.text();

    // 1. Google Maps iframe src or link
    const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    console.log('IFRAME MAP SRC:', iframeMatch ? iframeMatch[1] : 'None');

    const mapLinkMatch = html.match(/href=["'](https?:\/\/(?:www\.)?google\.com\/maps[^"']*)["']/i) ||
                         html.match(/href=["'](https?:\/\/maps\.google\.com[^"']*)["']/i);
    console.log('MAP LINK MATCH:', mapLinkMatch ? mapLinkMatch[1] : 'None');

    // 2. Exact Title
    const titleMatch = html.match(/<h[12][^>]*class=["'][^"']*(?:title|hero-title|rp-hero-title)[^"']*["'][^>]*>([\s\S]*?)<\/h[12]>/i) ||
                       html.match(/Sell\s*·\s*(?:Plot|Villa|Flat|House)\s*([\s\S]*?)(?:Listed Price|Enquire Now)/i);
    console.log('EXACT TITLE HTML:', titleMatch ? titleMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : 'None');

    // 3. Exact Location Address (e.g. Annur - 641653, Coimbatore, Tamil Nadu)
    const locAddressMatch = html.match(/<div class=["']rp-hero-location["']>([\s\S]*?)<\/div>/i) ||
                            html.match(/<div class=["']prop-loc["']>([\s\S]*?)<\/div>/i) ||
                            html.match(/([A-Za-z0-9\s,-]+\s*-\s*\d{6}\s*,\s*Coimbatore[A-Za-z0-9\s,-]*)/i);
    console.log('EXACT LOCATION MATCH:', locAddressMatch ? locAddressMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : 'None');

    // 4. Exact Description
    const descSection = html.match(/Description\s*<\/h\d>([\s\S]*?)(?:Property Overview|Listed by|Location on Map|<footer)/i) ||
                        html.match(/Description\s*([\s\S]*?)(?:Property Overview|Listed by|Location on Map|<footer)/i);
    if (descSection) {
      const cleanDesc = descSection[1].replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/&#8377;/g, '₹').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
      console.log('EXACT DESC Snippet:', cleanDesc.slice(0, 300));
    }

    // 5. Overview Table Items
    const overviewSection = html.match(/Property Overview\s*([\s\S]*?)(?:Location on Map|Listed by|<footer)/i);
    if (overviewSection) {
      console.log('OVERVIEW SECTION RAW:', overviewSection[1].replace(/<[^>]+>/g, ' | ').replace(/\s+/g, ' ').slice(0, 400));
    }
  }
}

inspectRealData().catch(console.error);
