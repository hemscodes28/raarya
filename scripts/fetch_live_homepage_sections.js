import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function run() {
  console.log('Fetching live homepage https://www.raarya.com/...');
  const html = await fetchPage('https://www.raarya.com/');

  // Search for property cards, titles, and section blocks
  const propertyLinks = [...html.matchAll(/href=["'](https:\/\/www\.raarya\.com\/properties-views\/[^"']+)["']/gi)];
  const uniqueLinks = [...new Set(propertyLinks.map(m => m[1]))];

  console.log(`Found ${uniqueLinks.length} total property view links on live homepage:`);
  uniqueLinks.forEach((link, idx) => {
    console.log(`${idx + 1}. ${link}`);
  });

  // Write full HTML to scratch for detailed analysis
  const scratchDir = path.join(__dirname, '../scratch');
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
  fs.writeFileSync(path.join(scratchDir, 'homepage.html'), html, 'utf8');
  console.log('Saved homepage HTML to scratch/homepage.html');
}

run().catch(console.error);
