import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const html = fs.readFileSync(path.join(__dirname, '../scratch/homepage.html'), 'utf8');

// Find headings like Recommended for You, Demanded Projects, New Properties
console.log('=== SECTION HEADINGS & CONTENT ANALYSIS ===');
const sections = ['Recommended for You', 'Demanded Projects', 'New Properties', 'Featured'];

sections.forEach(sec => {
  const idx = html.toLowerCase().indexOf(sec.toLowerCase());
  if (idx !== -1) {
    console.log(`\nFound section: "${sec}" at pos ${idx}`);
    const chunk = html.substring(idx, idx + 3000);
    // Find all links in this chunk
    const links = [...chunk.matchAll(/href=["'](https:\/\/www\.raarya\.com\/properties-views\/[^"']+)["']/gi)];
    console.log(`Links in chunk (${links.length}):`);
    links.forEach(l => console.log('  -', l[1]));

    // Find titles / text
    const titles = [...chunk.matchAll(/<h[2-5][^>]*>(.*?)<\/h[2-5]>/gi)];
    titles.forEach(t => console.log('  Heading:', t[1].replace(/<[^>]+>/g, '').trim()));
  } else {
    console.log(`Section "${sec}" NOT found in HTML!`);
  }
});
