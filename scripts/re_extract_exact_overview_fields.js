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

  // Extract Listed By Name
  let agentName = '';
  const agentMatch = html.match(/rp-contact-name["'][^>]*>([\s\S]*?)<\/div>/i) ||
                     html.match(/Listed by\s*([a-zA-Z\s]{2,30})/i);
  if (agentMatch) {
    let raw = agentMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    // Strip trailing phone numbers if attached
    raw = raw.replace(/\d{10}/g, '').trim();
    if (raw && !raw.toLowerCase().includes('raarya') && !raw.toLowerCase().includes('login')) {
      agentName = raw;
    }
  }
  if (!agentName) agentName = 'Rajkumar';

  // Extract Listed By Phone Number
  let agentPhone = '';
  const telMatch = html.match(/href=["']tel:\+?91?(\d{10})["']/i) ||
                   html.match(/phone=\+?91?(\d{10})/i) ||
                   html.match(/Listed by[\s\S]*?(\d{10})/i);

  if (telMatch && telMatch[1] !== '9087240400') {
    agentPhone = telMatch[1];
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

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) return await res.text();
    } catch (e) {
      if (i === retries - 1) return null;
      await new Promise(r => setTimeout(r, 600 * (i + 1)));
    }
  }
  return null;
}

async function startOverviewExtraction() {
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'extracted_properties.json');
  const properties = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Re-extracting exact Property Overview fields & Listed By for ${properties.length} properties...`);

  const BATCH_SIZE = 5;
  let count = 0;

  for (let i = 0; i < properties.length; i += BATCH_SIZE) {
    const batch = properties.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (p) => {
        if (!p.link) return;
        const html = await fetchWithRetry(p.link);
        if (html) {
          const info = parseRpOverview(html, p.title);
          p.overviewDetails = info.overviewDetails;
          p.areaDisplay = info.areaDisplay;
          p.areaUnit = info.areaUnit;
          p.agentName = info.agentName;
          p.agentPhone = info.agentPhone;
          p.agentPhones = [info.agentPhone];
          count++;
        }
      })
    );

    if ((i + BATCH_SIZE) % 50 === 0 || i + BATCH_SIZE >= properties.length) {
      console.log(`Progress: [${Math.min(i + BATCH_SIZE, properties.length)} / ${properties.length}] Processed.`);
      fs.writeFileSync(jsonPath, JSON.stringify(properties, null, 2), 'utf-8');
    }
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`Overview extraction finished! Updated ${count} of ${properties.length} properties.`);
  fs.writeFileSync(jsonPath, JSON.stringify(properties, null, 2), 'utf-8');
  console.log(`Saved dataset to: ${jsonPath}`);
}

startOverviewExtraction().catch(console.error);
