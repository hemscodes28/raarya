import fs from 'fs';
import path from 'path';

function generateRichDescription(title, type, subType, price, location, specs, area, beds, baths) {
  const isPlot = subType === 'Plot' || subType === 'Commercial Land' || title.toLowerCase().includes('plot');
  const isVilla = subType === 'Villa' || title.toLowerCase().includes('villa');
  const isHouse = subType === 'House' || subType === 'Independent House';
  const isRent = type === 'rent';

  let desc = ``;

  if (isPlot) {
    desc = `${title} - DTCP & RERA Approved premium plots located in prime location at ${location}. Invest in a secure, legally approved plot ensuring complete transparency and long-term appreciation. Features include wide tar roads, street lighting, 24/7 water supply connection, clear title deeds, and immediate construction readiness. Ideal for building your dream home or for smart real estate investment.`;
  } else if (isVilla || isHouse) {
    desc = `${title} - Beautiful ${beds > 0 ? beds + ' BHK' : 'luxury'} residential house situated in ${location}. Designed with modern architecture, spacious living rooms, premium fittings, ventilated bedrooms, and covered car parking. Located close to top schools, IT parks, hospitals, and shopping centers with peaceful surroundings and 24/7 security. Offered at ${price}.`;
  } else if (isRent) {
    desc = `${title} - Ready to move rental property located at ${location}. Features ${beds > 0 ? beds + ' bedrooms, ' : ''}${baths > 0 ? baths + ' bathrooms, ' : ''}good ventilation, uninterrupted water supply, car & bike parking. Close to public transport and major commercial hubs in Coimbatore. Available for rent at ${price}.`;
  } else {
    desc = `${title} - Premium real estate listing in ${location}. Highly desirable property featuring clear documentation, top-notch location advantage, easy connectivity to main roads, and excellent resale value. Price: ${price}.`;
  }

  return desc;
}

async function extractCategory(propertyFor, categoryName) {
  console.log(`Fetching category: ${categoryName} (property_for=${propertyFor})...`);
  const response = await fetch('https://www.raarya.com/product-fetch.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ property_for: String(propertyFor) })
  });

  const html = await response.text();
  console.log(`Received HTML length for ${categoryName}: ${html.length}`);

  const rawCards = html.split(/<div class=["']col-md-12 mb-3["']>/);
  const items = [];

  for (let i = 1; i < rawCards.length; i++) {
    const block = rawCards[i];

    // Link & Title
    const titleMatch = block.match(/<div class=["']prop-title["']>\s*<a href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
    const link = titleMatch ? titleMatch[1].trim() : '';
    let title = titleMatch ? titleMatch[2].replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() : '';

    // Image
    const imgMatch = block.match(/<img[^>]+(?:data-src|src)=["']([^"']+)["']/i);
    let image = imgMatch ? imgMatch[1] : '';
    if (image && !image.startsWith('http')) {
      image = 'https://www.raarya.com/' + image.replace(/^\//, '');
    }

    // Property Type
    const tagTypeMatch = block.match(/<span class=["']tag-pill tag-type["']>([\s\S]*?)<\/span>/i);
    const subType = tagTypeMatch ? tagTypeMatch[1].trim() : 'Residential';

    // Price
    const priceMatch = block.match(/<div class=["']prop-price["']>([\s\S]*?)<\/div>/i);
    let price = priceMatch ? priceMatch[1].replace(/<[^>]+>/g, '').replace(/&#8377;/g, '₹').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() : '';
    if (!price) {
      const altPriceMatch = block.match(/(?:₹|&#8377;|Rs\.?)\s*[\d,]+/i);
      price = altPriceMatch ? altPriceMatch[0].replace(/&#8377;/g, '₹') : 'Price on Request';
    }

    // Location
    const locMatch = block.match(/<div class=["']prop-loc["']>([\s\S]*?)<\/div>/i);
    let location = locMatch ? locMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() : '';
    if (!location) {
      location = 'Coimbatore, Tamil Nadu';
    }

    // Specs
    const specsMatch = block.match(/<div class=["']prop-specs["']>([\s\S]*?)<\/div>/i);
    let specs = specsMatch ? specsMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';

    let beds = 0;
    let baths = 0;
    let area = 0;

    const bedsM = specs.match(/(\d+)\s*Beds?/i);
    if (bedsM) beds = parseInt(bedsM[1], 10);

    const bathsM = specs.match(/(\d+)\s*Baths?/i);
    if (bathsM) baths = parseInt(bathsM[1], 10);

    const areaM = specs.match(/(\d+(?:,\d+)?)\s*(?:Sq\.?Ft|Sq\.?m|Cent|Acre)/i);
    if (areaM) area = parseInt(areaM[1].replace(/,/g, ''), 10);

    if (title || link) {
      const description = generateRichDescription(title, categoryName, subType, price, location, specs, area, beds, baths);

      items.push({
        id: `prop-${categoryName.toLowerCase()}-${i}`,
        title: title || 'Raarya Featured Property',
        price: price || 'Price on Request',
        location: location || 'Coimbatore, Tamil Nadu',
        area: area || (subType === 'Plot' ? 1500 : 1200),
        floors: subType === 'Plot' ? 0 : 1,
        beds: beds || (subType === 'Plot' ? 0 : 2),
        baths: baths || (subType === 'Plot' ? 0 : 2),
        image: image || 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260503_145701_de344c15-5eac-4c64-8bd6-19a2811bba4a.png&w=1280&q=85',
        type: categoryName === 'buy' ? 'buy' : categoryName === 'rent' ? 'rent' : 'pg-hostel',
        subType: subType,
        link: link,
        description: description,
        amenities: [
          'DTCP & RERA Approved',
          'Tar Road Access',
          '24/7 Water Supply',
          'Clear Title Deed',
          'Close to IT Corridor'
        ]
      });
    }
  }

  console.log(`Parsed ${items.length} items for ${categoryName}`);
  return items;
}

async function run() {
  const buyProperties = await extractCategory(0, 'buy');
  const rentProperties = await extractCategory(1, 'rent');
  const pgProperties = await extractCategory(2, 'pg-hostel');

  const allListings = [...buyProperties, ...rentProperties, ...pgProperties];
  console.log(`Total listings extracted: ${allListings.length}`);

  const outputPath = path.join(process.cwd(), 'src', 'data', 'extracted_properties.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(allListings, null, 2), 'utf-8');
  console.log(`Saved properties data to: ${outputPath}`);
}

run().catch(console.error);
