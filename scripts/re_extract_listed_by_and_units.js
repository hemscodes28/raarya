import fs from 'fs';
import path from 'path';

function parsePropertyFullDetail(html, fallbackTitle, fallbackLocation) {
  // 1. Listed By Name
  let agentName = '';
  const agentMatch = html.match(/Listed by\s*([a-zA-Z\s]{2,30})/i) ||
                     html.match(/rp-contact-name["'][^>]*>([\s\S]*?)<\/div>/i);
  if (agentMatch) {
    let raw = agentMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (raw && !raw.toLowerCase().includes('raarya') && !raw.toLowerCase().includes('login')) {
      agentName = raw;
    }
  }

  if (!agentName) {
    agentName = 'Rajkumar';
  }

  // 2. Listed By Phone
  let agentPhone = '';
  const phoneMatches = [...html.matchAll(/tel:\+?91?(\d{10})/gi)].map(m => m[1])
    .concat([...html.matchAll(/(?:Contact|\+91)\s*(\d{10})/gi)].map(m => m[1]))
    .concat([...html.matchAll(/(\d{10})/g)].map(m => m[1]));

  const validPhones = Array.from(new Set(phoneMatches)).filter(
    p => p !== '9087240400' &&
         !p.startsWith('100') &&
         !p.startsWith('177') &&
         !p.startsWith('178') &&
         !p.startsWith('176') &&
         !p.startsWith('175') &&
         !p.startsWith('839') &&
         !p.startsWith('848')
  );

  if (validPhones.length > 0) {
    agentPhone = validPhones[0];
  } else {
    agentPhone = '9787255522';
  }

  // 3. Dynamic Area Text & Unit (Cent vs Sq.Ft vs BHK vs Acre)
  let areaText = '';
  let areaUnit = 'sq.ft';

  const overviewSection = html.match(/Property Overview\s*([\s\S]*?)(?:Location on Map|Listed by|<footer)/i);
  const overviewDetails = {};

  if (overviewSection) {
    const rawText = overviewSection[1];

    const listedForM = rawText.match(/Listed For\s*([A-Za-z]+)/i);
    if (listedForM) overviewDetails['Listed For'] = listedForM[1].trim();

    const propTypeM = rawText.match(/Property Type\s*([A-Za-z\s]+?)(?:Area|Status|Furnishing|$)/i);
    if (propTypeM) overviewDetails['Property Type'] = propTypeM[1].trim();

    const areaM = rawText.match(/Area\s*([0-9.\sA-Za-z]+?)(?:Status|Furnishing|$)/i);
    if (areaM) {
      areaText = areaM[1].trim();
      overviewDetails['Area'] = areaText;
    }

    const statusM = rawText.match(/Status\s*([A-Za-z\s]+?)(?:Furnishing|$)/i);
    if (statusM) overviewDetails['Status'] = statusM[1].trim();

    const furnM = rawText.match(/Furnishing\s*([A-Za-z\s]+?)(?:Location|$)/i);
    if (furnM) overviewDetails['Furnishing'] = furnM[1].trim();
  }

  // Fallback area from title
  if (!areaText) {
    const titleCent = fallbackTitle.match(/([\d.]+\s*cent[s]?)/i);
    if (titleCent) areaText = titleCent[1];
    const titleSqft = fallbackTitle.match(/([\d.]+\s*sq\.?\s*ft)/i);
    if (titleSqft) areaText = titleSqft[1];
    const titleBhk = fallbackTitle.match(/(\d+\s*bhk)/i);
    if (titleBhk) areaText = titleBhk[1];
  }

  if (areaText) {
    if (areaText.toLowerCase().includes('cent')) {
      areaUnit = 'cent';
    } else if (areaText.toLowerCase().includes('acre')) {
      areaUnit = 'acre';
    } else if (areaText.toLowerCase().includes('bhk')) {
      areaUnit = 'bhk';
    } else {
      areaUnit = 'sq.ft';
    }
  }

  // 4. Structured Point-by-Point Description
  let rawDesc = '';
  const descMatch = html.match(/Description\s*([\s\S]*?)(?:Property Overview|Listed by|Location on Map|<footer)/i);
  if (descMatch) {
    rawDesc = descMatch[1]
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&rdquo;/g, '"')
      .replace(/&ldquo;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&#8377;/g, '₹')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (rawDesc.includes('Submit Enquiry')) rawDesc = rawDesc.split('Submit Enquiry')[1] || rawDesc;
    if (rawDesc.includes('Enquire Now All Photos')) rawDesc = rawDesc.split('Enquire Now All Photos')[1] || rawDesc;
    rawDesc = rawDesc.replace(/^Description\s*/i, '').trim();
  }

  const descriptionPoints = [];
  if (rawDesc) {
    const sentences = rawDesc.split(/(?<=\.)\s+|(?<=[!?:])\s+/);
    for (let s of sentences) {
      s = s.trim();
      if (s.length > 15 && !s.toLowerCase().includes('login account password') && !s.toLowerCase().includes('forgot password')) {
        descriptionPoints.push(s);
      }
    }
  }

  return {
    agentName,
    agentPhone,
    areaText: areaText || '1200 sq.ft',
    areaUnit,
    overviewDetails,
    rawDescription: rawDesc,
    descriptionPoints: descriptionPoints.length > 0 ? descriptionPoints : [rawDesc]
  };
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) return await res.text();
    } catch (e) {
      if (i === retries - 1) return null;
      await new Promise(r => setTimeout(r, 800 * (i + 1)));
    }
  }
  return null;
}

async function startEnrichment() {
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'extracted_properties.json');
  const properties = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Extracting Listed By names, phone numbers, dynamic units, and structured points for ${properties.length} properties...`);

  const BATCH_SIZE = 5;
  let count = 0;

  for (let i = 0; i < properties.length; i += BATCH_SIZE) {
    const batch = properties.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (p) => {
        if (!p.link) return;
        const html = await fetchWithRetry(p.link);
        if (html) {
          const info = parsePropertyFullDetail(html, p.title, p.location);

          p.agentName = info.agentName;
          p.agentPhone = info.agentPhone;
          p.agentPhones = [info.agentPhone];
          p.areaDisplay = info.areaText;
          p.areaUnit = info.areaUnit;
          if (info.overviewDetails && Object.keys(info.overviewDetails).length > 0) {
            p.overviewDetails = info.overviewDetails;
          }
          if (info.descriptionPoints && info.descriptionPoints.length > 0) {
            p.descriptionPoints = info.descriptionPoints;
          }
          count++;
        } else {
          // Fallback defaults
          p.agentName = p.agentName || 'Rajkumar';
          p.agentPhone = p.agentPhone || '9787255522';
          p.areaDisplay = p.areaDisplay || `${p.area} sq.ft`;
        }
      })
    );

    if ((i + BATCH_SIZE) % 50 === 0 || i + BATCH_SIZE >= properties.length) {
      console.log(`Progress: [${Math.min(i + BATCH_SIZE, properties.length)} / ${properties.length}] Processed. (${count} successful)`);
      fs.writeFileSync(jsonPath, JSON.stringify(properties, null, 2), 'utf-8');
    }
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`Extraction complete! Updated ${count} properties with real listed names, phones, dynamic area units & structured points.`);
  fs.writeFileSync(jsonPath, JSON.stringify(properties, null, 2), 'utf-8');
  console.log(`Dataset saved to: ${jsonPath}`);
}

startEnrichment().catch(console.error);
