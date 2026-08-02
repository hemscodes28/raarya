import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetUrls = [
  {
    name: 'Residential land in Kurumbapalayam - Avanta',
    url: 'https://www.raarya.com/properties-views/residential-land-in-kurumbapalayam---avanta-/8/',
    section: 'recommended'
  },
  {
    name: 'Residential DTCP Approved Plots in Annur | Brahma Park',
    url: 'https://www.raarya.com/properties-views/residential-dtcp-approved-plots-in-annur---brahma-park-/113/',
    section: 'recommended'
  },
  {
    name: 'Residential Plots in Kinathukadavu – Golden',
    url: 'https://www.raarya.com/properties-views/residential-plots-in-kinathukadavu-–-golden-vista/711/',
    section: 'demanded'
  },
  {
    name: 'SK Garden - Avinashi Road, Near Kaniyur Toll Gate',
    url: 'https://www.raarya.com/properties-views/sk-garden---avinashi-road,-near-kaniyur-toll-gate/21/',
    section: 'demanded'
  },
  {
    name: 'Thangam | Thekkalur, Avinashi Road',
    url: 'https://www.raarya.com/properties-views/-thangam---thekkalur,-avinashi-road-/112/',
    section: 'new'
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

async function run() {
  for (const item of targetUrls) {
    console.log(`\n==============================================`);
    console.log(`Fetching: ${item.name}`);
    console.log(`URL: ${item.url}`);
    console.log(`==============================================`);
    try {
      const html = await fetchPage(item.url);
      
      // Extract images from src matching /uploads/
      const imgMatches = [...html.matchAll(/(?:src|href)=["']([^"']+\/uploads\/[^"']+)["']/gi)];
      const imgUrls = [...new Set(imgMatches.map(m => m[1]))];
      console.log(`Extracted Images (${imgUrls.length}):`);
      imgUrls.forEach(i => console.log('  -', i));

      // Extract Overview details
      console.log('\nHTML snippet around Overview/Description:');
      const lowerHtml = html.toLowerCase();
      if (lowerHtml.includes('overview')) {
        console.log('Contains Overview section!');
      }
      if (lowerHtml.includes('specification') || lowerHtml.includes('details')) {
        console.log('Contains Specifications/Details section!');
      }

    } catch (err) {
      console.error(`Error fetching ${item.url}:`, err.message);
    }
  }
}

run();
