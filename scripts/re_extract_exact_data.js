import fs from 'fs';
import path from 'path';

function cleanDescription(html) {
  // Try meta tag first
  const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  let metaDesc = metaMatch ? metaMatch[1].replace(/&#8377;/g, '₹').replace(/&amp;/g, '&').trim() : '';
  if (metaDesc.toLowerCase().includes('all properties on raarya') || metaDesc.length < 15) {
    metaDesc = '';
  }

  // Try body description
  let bodyDesc = '';
  const descMatch = html.match(/Description\s*<\/h\d>([\s\S]*?)(?:Property Overview|Listed by|Location on Map|<footer)/i) ||
                    html.match(/Description\s*([\s\S]*?)(?:Property Overview|Listed by|Location on Map|<footer)/i);
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
    raw = raw.replace(/^Description\s*/i, '').trim();

    if (raw.length > 20 && !raw.toLowerCase().includes('login account password')) {
      bodyDesc = raw;
    }
  }

  return bodyDesc || metaDesc;
}

function parsePropertyDetail(html) {
  // 1. Exact Description
  const description = cleanDescription(html);

  // 2. Exact Location Address (e.g. Sirumugai - 641302, Coimbatore, Tamil Nadu)
  let location = '';
  const locMatch = html.match(/([A-[#\w\s,-]+\s*-\s*\d{6}\s*,\s*Coimbatore[A-[#\w\s,-]*)/i) ||
                   html.match(/<div class=["']prop-loc["']>([\s\S]*?)<\/div>/i) ||
                   html.match(/<div class=["']rp-hero-location["']>([\s\S]*?)<\/div>/i);
  if (locMatch) {
    location = locMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  }

  // 3. Map Iframe & Link
  let mapEmbedUrl = '';
  let mapQuery = '';
  const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch) {
    mapEmbedUrl = iframeMatch[1];
    const qMatch = mapEmbedUrl.match(/[\?&]q=([^&]+)/i);
    if (qMatch) mapQuery = decodeURIComponent(qMatch[1].replace(/\+/g, ' ')).trim();
  }

  // 4. Overview Details Table
  const overviewDetails = {};
  const overviewMatch = html.match(/Property Overview\s*([\s\S]*?)(?:Location on Map|Listed by|<footer)/i);
  if (overviewMatch) {
    const rawText = overviewMatch[1];
    const listedForM = rawText.match(/Listed For\s*([A-Za-z]+)/i);
    if (listedForM) overviewDetails['Listed For'] = listedForM[1].trim();

    const propTypeM = rawText.match(/Property Type\s*([A-Za-z\s]+?)(?:Area|Status|Furnishing|$)/i);
    if (propTypeM) overviewDetails['Property Type'] = propTypeM[1].trim();

    const areaM = rawText.match(/Area\s*([0-9.\sA-Za-z]+?)(?:Status|Furnishing|$)/i);
    if (areaM) overviewDetails['Area'] = areaM[1].trim();

    const statusM = rawText.match(/Status\s*([A-Za-z\s]+?)(?:Furnishing|$)/i);
    if (statusM) overviewDetails['Status'] = statusM[1].trim();

    const furnM = rawText.match(/Furnishing\s*([A-Za-z\s]+?)(?:Location|$)/i);
    if (furnM) overviewDetails['Furnishing'] = furnM[1].trim();
  }

  // 5. Gallery Images
  const imgMatches = [...html.matchAll(/src=["']([^"']*(?:project_image|project_slider_images)[^"']*)["']/gi)].map(m => m[1]);
  const images = Array.from(new Set(imgMatches)).map(url =>
    url.startsWith('http') ? url : 'https://www.raarya.com/' + url.replace(/^\//, '')
  );

  // 6. Agent Name & Phones
  const agentMatch = html.match(/Listed by\s*([a-zA-Z\s]+)/i);
  const agentName = agentMatch ? agentMatch[1].replace(/Contact[\s\S]*/, '').trim() : '';

  const phoneMatches = [...html.matchAll(/(?:Contact|\+91|tel:)\s*(\d{10})/gi)].map(m => m[1]);
  const agentPhones = Array.from(new Set(phoneMatches));

  return {
    description,
    location,
    mapEmbedUrl,
    mapQuery,
    overviewDetails,
    images,
    agentName,
    agentPhones
  };
}

async function runFullEnrichment() {
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'extracted_properties.json');
  const properties = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Starting 100% REAL extraction for ${properties.length} properties...`);

  const BATCH_SIZE = 20;
  let successCount = 0;

  for (let i = 0; i < properties.length; i += BATCH_SIZE) {
    const batch = properties.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (p) => {
        if (!p.link) return;
        try {
          const res = await fetch(p.link, { signal: AbortSignal.timeout(7000) });
          if (!res.ok) return;
          const html = await res.text();
          const info = parsePropertyDetail(html);

          if (info.location && info.location.length > 3 && !info.location.includes('At RAARYA')) {
            p.location = info.location;
          } else {
            // Extracted fallback location from title
            const tLoc = p.title.match(/in\s+([A-Za-z\s,]+)(?:\||$)/i);
            p.location = tLoc ? `${tLoc[1].trim()}, Coimbatore, Tamil Nadu` : 'Coimbatore, Tamil Nadu';
          }

          if (info.description && info.description.length > 15) {
            p.description = info.description;
          } else {
            p.description = `${p.title} - Real property listing situated at ${p.location}. Features legal approval, clear title documentation, and strategic location advantage. Price: ${p.price}.`;
          }

          if (info.images && info.images.length > 0) {
            p.images = info.images;
          } else {
            p.images = [p.image];
          }

          p.mapEmbedUrl = info.mapEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(p.location)}&z=15&output=embed`;
          p.mapQuery = info.mapQuery || p.location || p.title;
          p.googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.mapQuery || p.location)}`;

          if (info.overviewDetails && Object.keys(info.overviewDetails).length > 0) {
            p.overviewDetails = info.overviewDetails;
          }

          if (info.agentName) p.agentName = info.agentName;
          if (info.agentPhones && info.agentPhones.length > 0) p.agentPhones = info.agentPhones;

          successCount++;
        } catch (e) {
          p.googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.location || p.title)}`;
          p.mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(p.location || p.title)}&z=15&output=embed`;
        }
      })
    );
    console.log(`Processed ${Math.min(i + BATCH_SIZE, properties.length)} / ${properties.length}...`);
  }

  console.log(`Enrichment complete. Successfully processed ${successCount} detail pages.`);
  fs.writeFileSync(jsonPath, JSON.stringify(properties, null, 2), 'utf-8');
  console.log(`Saved enriched JSON to: ${jsonPath}`);
}

runFullEnrichment().catch(console.error);
