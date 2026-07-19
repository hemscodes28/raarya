import fs from 'fs';
import path from 'path';

async function fetchDetailPageInfo(link) {
  if (!link) return null;
  try {
    const res = await fetch(link, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const html = await res.text();

    // Extract slider images
    const imgMatches = [...html.matchAll(/src=["']([^"']*(?:project_image|project_slider_images)[^"']*)["']/gi)].map(m => m[1]);
    const uniqueImgs = Array.from(new Set(imgMatches)).map(url =>
      url.startsWith('http') ? url : 'https://www.raarya.com/' + url.replace(/^\//, '')
    );

    // Extract description
    let description = '';
    const descMatch = html.match(/Description[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i) ||
                      html.match(/Description[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>/i);
    
    // Better description regex looking for text right after 'Description'
    const descTextMatch = html.match(/Description\s*([\s\S]*?)(?:Property Overview|Listed by|Location on Map|<footer)/i);
    if (descTextMatch) {
      let rawDesc = descTextMatch[1].replace(/<[^>]+>/g, ' ').replace(/&#8377;/g, '₹').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
      if (rawDesc.length > 20) {
        description = rawDesc;
      }
    }

    // Extract Overview Table Key-Values
    const overviewMatch = html.match(/Property Overview\s*([\s\S]*?)(?:Location on Map|Listed by|<footer)/i);
    const details = {};
    if (overviewMatch) {
      const overviewText = overviewMatch[1];
      const kvMatches = [...overviewText.matchAll(/([A-Z][a-zA-Z\s]{2,20})\s+([A-[#\w\s.,/-]{1,50})/g)];
      for (const kv of kvMatches) {
        const key = kv[1].trim();
        const val = kv[2].trim();
        if (key && val && !key.includes('Explore') && !key.includes('Map')) {
          details[key] = val;
        }
      }
    }

    // Extract Listed By & Contact Phone
    const agentMatch = html.match(/Listed by\s*([a-zA-Z\s]+)/i);
    const agentName = agentMatch ? agentMatch[1].replace(/Contact[\s\S]*/, '').trim() : '';

    const phoneMatches = [...html.matchAll(/(?:Contact|\+91|tel:)\s*(\d{10})/gi)].map(m => m[1]);
    const uniquePhones = Array.from(new Set(phoneMatches));

    // Extract Location Address
    const addressMatch = html.match(/<div class=["']prop-loc["']>([\s\S]*?)<\/div>/i) ||
                         html.match(/<p[^>]*class=["']text-variant-2["'][^>]*>([\s\S]*?)<\/p>/i);
    let fullAddress = '';
    if (addressMatch) {
      fullAddress = addressMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
    }

    return {
      images: uniqueImgs,
      description,
      details,
      agentName,
      agentPhones: uniquePhones,
      fullAddress
    };
  } catch (err) {
    return null;
  }
}

async function runEnrichment() {
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'extracted_properties.json');
  const properties = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Starting deep extraction for ${properties.length} properties...`);

  // Process in batches of 15 for speed
  const BATCH_SIZE = 15;
  let updatedCount = 0;

  for (let i = 0; i < properties.length; i += BATCH_SIZE) {
    const batch = properties.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (prop) => {
        if (!prop.link) return;
        const info = await fetchDetailPageInfo(prop.link);
        if (info) {
          if (info.images && info.images.length > 0) {
            prop.images = info.images;
          } else {
            prop.images = [prop.image];
          }

          if (info.description && info.description.length > 30) {
            prop.description = info.description;
          }

          if (info.agentName) {
            prop.agentName = info.agentName;
          }

          if (info.agentPhones && info.agentPhones.length > 0) {
            prop.agentPhones = info.agentPhones;
          }

          if (info.fullAddress) {
            prop.location = info.fullAddress;
          }

          if (info.details && Object.keys(info.details).length > 0) {
            prop.overviewDetails = info.details;
          }

          updatedCount++;
        }
      })
    );
    console.log(`Processed ${Math.min(i + BATCH_SIZE, properties.length)} / ${properties.length} properties...`);
  }

  console.log(`Deep extraction complete. Updated ${updatedCount} properties.`);
  fs.writeFileSync(jsonPath, JSON.stringify(properties, null, 2), 'utf-8');
  console.log(`Updated JSON saved to: ${jsonPath}`);
}

runEnrichment().catch(console.error);
