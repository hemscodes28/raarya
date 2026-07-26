import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../src/data/extracted_properties.json');
const publicDir = path.join(__dirname, '../public');

// Read properties JSON
const rawData = fs.readFileSync(jsonPath, 'utf8');
const properties = JSON.parse(rawData);

// Collect all unique image URLs
const urlToLocalPathMap = new Map();

for (const prop of properties) {
  const urlsToProcess = [];
  if (prop.image && typeof prop.image === 'string') {
    urlsToProcess.push(prop.image);
  }
  if (Array.isArray(prop.images)) {
    for (const imgUrl of prop.images) {
      if (typeof imgUrl === 'string') {
        urlsToProcess.push(imgUrl);
      }
    }
  }

  for (const url of urlsToProcess) {
    if (url.includes('raarya.com/uploads/')) {
      // Extract pathname after /uploads/
      const match = url.match(/raarya\.com\/uploads\/(.+)$/i);
      if (match && match[1]) {
        const relativePath = match[1].split('?')[0]; // strip query string if any
        const localPath = path.join(publicDir, 'uploads', relativePath);
        const webPath = '/uploads/' + relativePath.replace(/\\/g, '/');
        urlToLocalPathMap.set(url, { localPath, webPath });
      }
    }
  }
}

console.log(`Found ${urlToLocalPathMap.size} unique images to process.`);

// Function to download a single file with retries
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    // Ensure destination directory exists
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Skip if file already exists and is non-empty
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
      return resolve({ url, status: 'already_exists' });
    }

    const client = url.startsWith('https') ? https : http;

    const request = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      // Handle HTTP redirects (301, 302)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: HTTP Status ${res.statusCode}`));
      }

      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve({ url, status: 'downloaded' });
      });

      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {}); // clean up partial file
        reject(err);
      });
    });

    request.on('error', (err) => {
      reject(err);
    });

    request.setTimeout(15000, () => {
      request.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

// Download with concurrency control
async function processDownloads() {
  const entries = Array.from(urlToLocalPathMap.entries());
  const CONCURRENCY = 15;
  let completed = 0;
  let downloadedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  async function worker(items) {
    for (const [url, info] of items) {
      try {
        const res = await downloadFile(url, info.localPath);
        if (res.status === 'downloaded') downloadedCount++;
        else skippedCount++;
      } catch (err) {
        console.error(`Error downloading ${url}:`, err.message);
        errorCount++;
      } finally {
        completed++;
        if (completed % 20 === 0 || completed === entries.length) {
          console.log(`Progress: ${completed}/${entries.length} (Downloaded: ${downloadedCount}, Skipped/Existing: ${skippedCount}, Errors: ${errorCount})`);
        }
      }
    }
  }

  // Divide entries into buckets for concurrency
  const chunks = Array.from({ length: CONCURRENCY }, () => []);
  entries.forEach((entry, i) => {
    chunks[i % CONCURRENCY].push(entry);
  });

  await Promise.all(chunks.map(chunk => worker(chunk)));

  console.log('\n--- Download Summary ---');
  console.log(`Total: ${entries.length}`);
  console.log(`Downloaded: ${downloadedCount}`);
  console.log(`Already Exist: ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);

  // Now update the JSON file image paths
  let updatedCount = 0;
  for (const prop of properties) {
    if (prop.image && urlToLocalPathMap.has(prop.image)) {
      prop.image = urlToLocalPathMap.get(prop.image).webPath;
      updatedCount++;
    }
    if (Array.isArray(prop.images)) {
      prop.images = prop.images.map(img => {
        if (urlToLocalPathMap.has(img)) {
          return urlToLocalPathMap.get(img).webPath;
        }
        return img;
      });
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(properties, null, 2), 'utf8');
  console.log(`Updated JSON references in ${jsonPath}`);
}

processDownloads().catch(console.error);
