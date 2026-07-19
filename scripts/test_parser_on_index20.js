async function testIndex20() {
  const links = [
    'https://www.raarya.com/properties-views/dtcp-plot-for-sale-in-ganapathy-coimbatore---prime-area/47/',
    'https://www.raarya.com/properties-views/dtcp-approved-residential-land-–-sivanagar,-coimbatore/48/'
  ];

  for (const url of links) {
    console.log(`\n==================================================`);
    console.log(`Fetching: ${url}`);
    const res = await fetch(url);
    const html = await res.text();
    console.log(`HTML size: ${html.length}`);

    // Extract Location text
    const locMatch = html.match(/([A-[#\w\s,-]+\s*-\s*\d{6}\s*,\s*Coimbatore[A-[#\w\s,-]*)/i) ||
                     html.match(/<div class=["']prop-loc["']>([\s\S]*?)<\/div>/i) ||
                     html.match(/<div class=["']rp-hero-location["']>([\s\S]*?)<\/div>/i) ||
                     html.match(/<li[^>]*><i[^>]*ti-map-pin[^>]*><\/i>([\s\S]*?)<\/li>/i);
    
    console.log('EXTRACTED LOCATION:', locMatch ? locMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : 'None');

    // Extract Description Text (between Description header and Property Overview / Footer)
    const descMatch = html.match(/Description\s*([\s\S]*?)(?:Property Overview|Listed by|Location on Map|<footer)/i);
    if (descMatch) {
      let raw = descMatch[1]
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&#8377;/g, '₹')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (raw.includes('Submit Enquiry')) raw = raw.split('Submit Enquiry')[1] || raw;
      if (raw.includes('Enquire Now All Photos')) raw = raw.split('Enquire Now All Photos')[1] || raw;
      console.log('EXTRACTED DESC:', raw.slice(0, 400));
    } else {
      console.log('EXTRACTED DESC: None');
    }

    // Extract Maps Iframe or link
    const iframeM = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    console.log('EXTRACTED MAP IFRAME:', iframeM ? iframeM[1] : 'None');
  }
}

testIndex20().catch(console.error);
