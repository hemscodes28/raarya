import fs from 'fs';
import path from 'path';

function parseHtml(html, fallbackTitle, fallbackLocation) {
  // 1. Description
  let description = '';
  const descMatch = html.match(/Description\s*([\s\S]*?)(?:Property Overview|Listed by|Location on Map|<footer)/i);
  if (descMatch) {
    let raw = descMatch[1]
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

    if (raw.includes('Submit Enquiry')) raw = raw.split('Submit Enquiry')[1] || raw;
    if (raw.includes('Enquire Now All Photos')) raw = raw.split('Enquire Now All Photos')[1] || raw;
    raw = raw.replace(/^Description\s*/i, '').trim();

    if (raw.length > 25 && !raw.toLowerCase().includes('login account password')) {
      description = raw;
    }
  }

  if (!description) {
    const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (metaMatch && metaMatch[1].length > 20 && !metaMatch[1].toLowerCase().includes('all properties on raarya')) {
      description = metaMatch[1].replace(/&#8377;/g, '₹').replace(/&amp;/g, '&').trim();
    }
  }

  // 2. Location Address
  let location = '';
  const locMatch = html.match(/([A-[#\w\s,-]+\s*-\s*\d{6}\s*,\s*Coimbatore[A-[#\w\s,-]*)/i) ||
                   html.match(/<div class=["']prop-loc["']>([\s\S]*?)<\/div>/i) ||
                   html.match(/<div class=["']rp-hero-location["']>([\s\S]*?)<\/div>/i) ||
                   html.match(/<li[^>]*><i[^>]*ti-map-pin[^>]*><\/i>([\s\S]*?)<\/li>/i);
  if (locMatch) {
    location = locMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  }

  if (!location || location.includes('At RAARYA') || location.length < 5) {
    const titleLoc = fallbackTitle.match(/in\s+([A-Za-z\s,-]+)(?:\||$)/i);
    if (titleLoc) {
      location = `${titleLoc[1].trim()}, Coimbatore, Tamil Nadu`;
    } else {
      location = fallbackLocation || 'Coimbatore, Tamil Nadu';
    }
  }

  // 3. Google Maps Embed & Query
  let mapEmbedUrl = '';
  let mapQuery = location;

  const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch) {
    mapEmbedUrl = iframeMatch[1];
    const qMatch = mapEmbedUrl.match(/[\?&]q=([^&]+)/i);
    if (qMatch) mapQuery = decodeURIComponent(qMatch[1].replace(/\+/g, ' ')).trim();
  }

  const mapLinkMatch = html.match(/href=["'](https?:\/\/(?:www\.)?google\.com\/maps[^"']*)["']/i);
  if (mapLinkMatch && !mapQuery) {
    const qMatch = mapLinkMatch[1].match(/(?:viewpoint|q)=([^&]+)/i);
    if (qMatch) mapQuery = decodeURIComponent(qMatch[1].replace(/\+/g, ' ')).trim();
  }

  // 4. Gallery Images
  const imgMatches = [...html.matchAll(/src=["']([^"']*(?:project_image|project_slider_images)[^"']*)["']/gi)].map(m => m[1]);
  const images = Array.from(new Set(imgMatches)).map(url =>
    url.startsWith('http') ? url : 'https://www.raarya.com/' + url.replace(/^\//, '')
  );

  // 5. Agent Contacts
  const agentMatch = html.match(/Listed by\s*([a-zA-Z\s]+)/i);
  const agentName = agentMatch ? agentMatch[1].replace(/Contact[\s\S]*/, '').trim() : 'Raarya Property Specialist';

  const phoneMatches = [...html.matchAll(/(?:Contact|\+91|tel:)\s*(\d{10})/gi)].map(m => m[1]);
  const agentPhones = Array.from(new Set(phoneMatches));

  return {
    description,
    location,
    mapEmbedUrl: mapEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`,
    mapQuery,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`,
    images,
    agentName,
    agentPhones
  };
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (res.ok) return await res.text();
    } catch (e) {
      if (i === retries - 1) return null;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  return null;
}

async function startCrawl() {
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'extracted_properties.json');
  const properties = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Starting 100% complete crawl for ALL ${properties.length} properties...`);

  const BATCH_SIZE = 5; // Polite concurrency to avoid site rate limits
  let success = 0;

  for (let i = 0; i < properties.length; i += BATCH_SIZE) {
    const batch = properties.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (p, idxInBatch) => {
        const globalIdx = i + idxInBatch;
        if (!p.link) return;

        const html = await fetchWithRetry(p.link);
        if (html) {
          const parsed = parseHtml(html, p.title, p.location);

          if (parsed.location) p.location = parsed.location;
          if (parsed.description) p.description = parsed.description;
          if (parsed.images && parsed.images.length > 0) p.images = parsed.images;
          p.mapEmbedUrl = parsed.mapEmbedUrl;
          p.mapQuery = parsed.mapQuery;
          p.googleMapsUrl = parsed.googleMapsUrl;
          if (parsed.agentName) p.agentName = parsed.agentName;
          if (parsed.agentPhones && parsed.agentPhones.length > 0) p.agentPhones = parsed.agentPhones;

          success++;
        }
      })
    );

    if ((i + BATCH_SIZE) % 50 === 0 || i + BATCH_SIZE >= properties.length) {
      console.log(`Progress: [${Math.min(i + BATCH_SIZE, properties.length)} / ${properties.length}] Processed. (${success} successful fetches)`);
      // Incremental save so we don't lose progress
      fs.writeFileSync(jsonPath, JSON.stringify(properties, null, 2), 'utf-8');
    }

    // Small polite pause between batches
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n🎉 Complete Crawl Finished! ${success} of ${properties.length} properties fully enriched with authentic maps, exact descriptions, photos & locations.`);
  fs.writeFileSync(jsonPath, JSON.stringify(properties, null, 2), 'utf-8');
  console.log(`Saved dataset to: ${jsonPath}`);
}

startCrawl().catch(console.error);
