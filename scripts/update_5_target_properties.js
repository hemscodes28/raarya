import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../src/data/extracted_properties.json');
const publicUploadsDir = path.join(__dirname, '../public');
const rootUploadsDir = path.join(__dirname, '..');

const targetConfigs = [
  {
    key: 'avanta',
    titleMatch: 'residential land in kurumbapalayam - avanta',
    url: 'https://www.raarya.com/properties-views/residential-land-in-kurumbapalayam---avanta-/8/',
    canonicalTitle: 'Residential land in Kurumbapalayam - Avanta',
    isRecommended: true,
    isDemanded: false,
    isNew: false
  },
  {
    key: 'brahma',
    titleMatch: 'brahma park',
    url: 'https://www.raarya.com/properties-views/residential-dtcp-approved-plots-in-annur---brahma-park-/113/',
    canonicalTitle: 'Residential DTCP Approved Plots in Annur | Brahma Park',
    isRecommended: true,
    isDemanded: true,
    isNew: false
  },
  {
    key: 'golden',
    titleMatch: 'golden vista',
    url: 'https://www.raarya.com/properties-views/residential-plots-in-kinathukadavu-–-golden-vista/711/',
    canonicalTitle: 'Residential Plots in Kinathukadavu – Golden Vista',
    isRecommended: false,
    isDemanded: true,
    isNew: false
  },
  {
    key: 'skgarden',
    titleMatch: 'sk garden',
    url: 'https://www.raarya.com/properties-views/sk-garden---avinashi-road,-near-kaniyur-toll-gate/21/',
    canonicalTitle: 'SK Garden - Avinashi Road, Near Kaniyur Toll Gate',
    isRecommended: false,
    isDemanded: true,
    isNew: true
  },
  {
    key: 'thangam',
    titleMatch: 'thangam',
    url: 'https://www.raarya.com/properties-views/-thangam---thekkalur,-avinashi-road-/112/',
    canonicalTitle: 'Thangam | Thekkalur, Avinashi Road',
    isRecommended: false,
    isDemanded: false,
    isNew: true
  }
];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
      return resolve({ url, status: 'already_exists' });
    }
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: HTTP ${res.statusCode}`));
      }
      const stream = fs.createWriteStream(destPath);
      res.pipe(stream);
      stream.on('finish', () => { stream.close(); resolve({ url, status: 'downloaded' }); });
      stream.on('error', err => { fs.unlink(destPath, () => {}); reject(err); });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error(`Timeout downloading ${url}`)); });
  });
}

function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function run() {
  console.log('Reading properties database...');
  let properties = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  for (const config of targetConfigs) {
    console.log(`\n========================================`);
    console.log(`Processing Target: ${config.canonicalTitle}`);
    console.log(`========================================`);

    const html = await fetchPage(config.url);

    // 1. Download & map images
    const imgMatches = [...html.matchAll(/(?:src|href)=["']([^"']+\/uploads\/[^"']+)["']/gi)];
    const rawImgUrls = [...new Set(imgMatches.map(m => m[1]))];

    const localWebPaths = [];
    for (const remoteUrl of rawImgUrls) {
      const match = remoteUrl.match(/raarya\.com\/uploads\/(.+)$/i);
      if (match && match[1]) {
        const relPath = match[1].split('?')[0];
        const pubPath = path.join(publicUploadsDir, 'uploads', relPath);
        const rootPath = path.join(rootUploadsDir, 'uploads', relPath);

        try {
          await downloadFile(remoteUrl, pubPath);
          await downloadFile(remoteUrl, rootPath);
        } catch (e) {
          console.error(`Error downloading image ${remoteUrl}:`, e.message);
        }
        const webPath = '/uploads/' + relPath.replace(/\\/g, '/');
        if (!localWebPaths.includes(webPath)) {
          localWebPaths.push(webPath);
        }
      }
    }

    console.log(`Local Images (${localWebPaths.length}):`, localWebPaths);

    // Find existing matching records in JSON
    const matchingIndices = [];
    properties.forEach((p, idx) => {
      if (p.title && p.title.toLowerCase().includes(config.titleMatch)) {
        matchingIndices.push(idx);
      }
    });

    console.log(`Found ${matchingIndices.length} existing records in JSON matching "${config.titleMatch}"`);

    // Pick base existing record or create new
    let baseRecord = {};
    if (matchingIndices.length > 0) {
      // Find the one with descriptionPoints or detailed info
      const detailed = matchingIndices.map(i => properties[i]).find(p => p.descriptionPoints && p.descriptionPoints.length > 0) || properties[matchingIndices[0]];
      baseRecord = { ...detailed };
    }

    // Standardize property attributes
    const mainImage = localWebPaths.length > 0 ? localWebPaths[0] : (baseRecord.image || '');
    const gallery = localWebPaths.length > 0 ? localWebPaths : (baseRecord.images || [mainImage]);

    // Build consolidated pristine record
    const updatedRecord = {
      ...baseRecord,
      id: baseRecord.id || `prop-buy-featured-${config.key}`,
      title: config.canonicalTitle,
      price: baseRecord.price || 'Price on Request',
      location: baseRecord.location || 'Coimbatore, Tamil Nadu',
      link: config.url,
      image: mainImage,
      images: gallery,
      type: 'buy',
      subType: baseRecord.subType || 'Plot',
      isRecommended: config.isRecommended,
      isDemanded: config.isDemanded,
      isNew: config.isNew,
      overviewDetails: baseRecord.overviewDetails || {
        'Listed For': 'Sell',
        'Property Type': 'Plot',
        'Status': 'Ready to Construct',
        'Furnishing': 'Unfurnished'
      },
      descriptionPoints: (baseRecord.descriptionPoints || []).map(cleanText),
      description: cleanText(baseRecord.description || (baseRecord.descriptionPoints ? baseRecord.descriptionPoints.join(' ') : config.canonicalTitle)),
      googleMapsUrl: baseRecord.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(baseRecord.location || config.canonicalTitle)}`,
      mapEmbedUrl: baseRecord.mapEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(baseRecord.location || config.canonicalTitle)}&z=15&output=embed`,
      agentName: baseRecord.agentName || 'Rajkumar',
      agentPhone: baseRecord.agentPhone || '9787255522',
      agentPhones: baseRecord.agentPhones || ['9787255522']
    };

    // Remove all old matching records and insert the updated consolidated record
    properties = properties.filter(p => !p.title || !p.title.toLowerCase().includes(config.titleMatch));
    properties.unshift(updatedRecord);
    console.log(`Consolidated into single clean record with ID: ${updatedRecord.id}`);
  }

  // Save updated JSON
  fs.writeFileSync(jsonPath, JSON.stringify(properties, null, 2), 'utf8');
  console.log(`\nSuccessfully updated ${jsonPath}! Total properties in dataset: ${properties.length}`);
}

run().catch(console.error);
