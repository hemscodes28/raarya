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
    targetTitle: 'Residential land in Kurumbapalayam - Avanta',
    url: 'https://www.raarya.com/properties-views/residential-land-in-kurumbapalayam---avanta-/8/',
    isRecommended: true,
    isDemanded: false,
    isNew: false
  },
  {
    targetTitle: 'Residential DTCP Approved Plots in Annur | Brahma Park',
    url: 'https://www.raarya.com/properties-views/residential-dtcp-approved-plots-in-annur---brahma-park-/113/',
    isRecommended: true,
    isDemanded: true,
    isNew: false
  },
  {
    targetTitle: 'Residential Plots in Kinathukadavu – Golden',
    url: 'https://www.raarya.com/properties-views/residential-plots-in-kinathukadavu-–-golden-vista/711/',
    isRecommended: false,
    isDemanded: true,
    isNew: false
  },
  {
    targetTitle: 'SK Garden - Avinashi Road, Near Kaniyur Toll Gate',
    url: 'https://www.raarya.com/properties-views/sk-garden---avinashi-road,-near-kaniyur-toll-gate/21/',
    isRecommended: false,
    isDemanded: true,
    isNew: true
  },
  {
    targetTitle: 'Thangam | Thekkalur, Avinashi Road',
    url: 'https://www.raarya.com/properties-views/-thangam---thekkalur,-avinashi-road-/112/',
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

async function processProperties() {
  console.log('Starting extraction and download for 5 featured properties...');
  const jsonContent = fs.readFileSync(jsonPath, 'utf8');
  let properties = JSON.parse(jsonContent);

  for (const config of targetConfigs) {
    console.log(`\nProcessing: ${config.targetTitle}`);
    const html = await fetchPage(config.url);

    // Extract images
    const imgMatches = [...html.matchAll(/(?:src|href)=["']([^"']+\/uploads\/[^"']+)["']/gi)];
    const rawImgUrls = [...new Set(imgMatches.map(m => m[1]))];
    console.log(`Found ${rawImgUrls.length} images on live page.`);

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

    console.log(`Downloaded and mapped images:`, localWebPaths);
  }
}

processProperties().catch(console.error);
