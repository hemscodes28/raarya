import fs from 'fs';
import path from 'path';

function parseRpOverview(html, fallbackTitle) {
  const overviewDetails = {};

  // Extract all rp-ov-item blocks
  const items = [...html.matchAll(/class=["']rp-ov-label["'][^>]*>([\s\S]*?)<\/div>\s*<div\s+class=["']rp-ov-value["'][^>]*>([\s\S]*?)<\/div>/gi)];

  items.forEach(m => {
    const label = m[1].replace(/<[^>]+>/g, '').trim();
    const value = m[2].replace(/<[^>]+>/g, '').trim();
    if (label && value) {
      overviewDetails[label] = value;
    }
  });

  // Extract Area Value
  let areaVal = overviewDetails['Area'] || '';
  if (!areaVal) {
    const centMatch = fallbackTitle.match(/([\d.]+\s*cent[s]?)/i);
    if (centMatch) areaVal = centMatch[1];
    const sqftMatch = fallbackTitle.match(/([\d.]+\s*sq\.?\s*ft)/i);
    if (sqftMatch) areaVal = sqftMatch[1];
    const bhkMatch = fallbackTitle.match(/(\d+\s*bhk)/i);
    if (bhkMatch) areaVal = bhkMatch[1];
  }

  // Determine Area Display Text & Unit
  let areaDisplay = areaVal || '1200 sq.ft';
  let areaUnit = 'sq.ft';

  if (areaVal.toLowerCase().includes('cent')) {
    areaUnit = 'cent';
    areaDisplay = areaVal.toLowerCase().includes('cent') ? areaVal : `${areaVal} Cents`;
  } else if (areaVal.toLowerCase().includes('acre')) {
    areaUnit = 'acre';
    areaDisplay = areaVal;
  } else if (areaVal.toLowerCase().includes('bhk')) {
    areaUnit = 'bhk';
    areaDisplay = areaVal.toUpperCase();
  } else if (areaVal.toLowerCase().includes('sqft') || areaVal.toLowerCase().includes('sq.ft')) {
    areaUnit = 'sq.ft';
    areaDisplay = areaVal;
  } else if (areaVal.match(/^[\d.]+$/)) {
    if (fallbackTitle.toLowerCase().includes('cent') || overviewDetails['Property Type'] === 'Plot') {
      areaUnit = 'cent';
      areaDisplay = `${areaVal} Cents`;
    } else {
      areaDisplay = `${areaVal} sq.ft`;
    }
  }

  // Extract Listed By Name & Phone Number
  let agentName = '';
  const agentMatch = html.match(/rp-contact-name["'][^>]*>([\s\S]*?)<\/div>/i) ||
                     html.match(/Listed by\s*([a-zA-Z\s]{2,30})/i);
  if (agentMatch) {
    let raw = agentMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (raw && !raw.toLowerCase().includes('raarya') && !raw.toLowerCase().includes('login')) {
      agentName = raw;
    }
  }
  if (!agentName) agentName = 'Rajkumar';

  // Extract Listed By Phone Number from tel: link
  let agentPhone = '';
  const phoneMatch = html.match(/href=["']tel:\+?91?(\d{10})["']/i) ||
                     html.match(/href=["']https:\/\/api\.whatsapp\.com\/send\?phone=\+?91?(\d{10})/i);
  if (phoneMatch) {
    agentPhone = phoneMatch[1];
  }

  if (!agentPhone) {
    const phones = [...html.matchAll(/(\d{10})/g)].map(m => m[1]);
    const validPhones = Array.from(new Set(phones)).filter(
      p => p !== '9087240400' &&
           !p.startsWith('100') &&
           !p.startsWith('177') &&
           !p.startsWith('178') &&
           !p.startsWith('176') &&
           !p.startsWith('175') &&
           !p.startsWith('839') &&
           !p.startsWith('848')
    );
    agentPhone = validPhones.length > 0 ? validPhones[0] : '9787255522';
  }

  return {
    overviewDetails,
    areaDisplay,
    areaUnit,
    agentName,
    agentPhone
  };
}

async function testExtraction() {
  const links = [
    'https://www.raarya.com/properties-views/dtcp---rera-approved-plots-in-coimbatore---premium-layout/23/',
    'https://www.raarya.com/properties-views/approved-plots-in-coimbatore---best-investment-location/26/',
    'https://www.raarya.com/properties-views/magizh-enclave-/385/',
    'https://www.raarya.com/properties-views/2bhk-flat-for-rent-in-ganapathy/555/',
    'https://www.raarya.com/properties-views/sri-pps/277/'
  ];

  for (const url of links) {
    console.log(`\n==================================================`);
    console.log(`Fetching: ${url}`);
    const res = await fetch(url);
    const html = await res.text();
    const parsed = parseRpOverview(html, 'sample title');
    console.log('PARSED:', JSON.stringify(parsed, null, 2));
  }
}

testExtraction().catch(console.error);
