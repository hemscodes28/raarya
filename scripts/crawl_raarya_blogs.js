import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogUrls = [
  {
    slug: 'why-karamadai-is-emerging-as-a-prime-real-estate-investment-location-in-coimbatore',
    url: 'https://www.raarya.com/blog-view/why-karamadai-is-emerging-as-a-prime-real-estate-investment-location-in-coimbatore/'
  },
  {
    slug: 'how-to-list-your-property-for-free-in-coimbatore',
    url: 'https://www.raarya.com/blog-view/how-to-list-your-property-for-free-in-coimbatore/'
  },
  {
    slug: 'real-estate-listing-platforms-in-coimbatore-the-smart-way-to-buy-property',
    url: 'https://www.raarya.com/blog-view/real-estate-listing-platforms-in-coimbatore:-the-smart-way-to-buy-property/'
  },
  {
    slug: 'things-to-check-before-buying-a-plot-in-coimbatore',
    url: 'https://www.raarya.com/blog-view/things-to-check-before-buying-a-plot-in-coimbatore/'
  },
  {
    slug: 'dtcp-approved-plots-in-coimbatore-why-it-matters-before-buying-land',
    url: 'https://www.raarya.com/blog-view/dtcp-approved-plots-in-coimbatore-%E2%80%93-why-it-matters-before-buying-land/'
  }
];

const publicBlogUploads = path.join(__dirname, '../public/uploads/blog');
const rootBlogUploads = path.join(__dirname, '../uploads/blog');
const blogsJsonPath = path.join(__dirname, '../src/data/blogs_data.json');

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
  console.log('Fetching live blog index & articles...');
  const blogIndexHtml = await fetchPage('https://www.raarya.com/blog/');

  const scratchDir = path.join(__dirname, '../scratch');
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
  fs.writeFileSync(path.join(scratchDir, 'blog_index.html'), blogIndexHtml, 'utf8');

  const extractedBlogs = [];

  for (let i = 0; i < blogUrls.length; i++) {
    const item = blogUrls[i];
    console.log(`\n------------------------------------------------`);
    console.log(`[${i + 1}/${blogUrls.length}] Crawling: ${item.slug}`);
    console.log(`URL: ${item.url}`);

    try {
      const html = await fetchPage(item.url);
      fs.writeFileSync(path.join(scratchDir, `blog_${i + 1}.html`), html, 'utf8');

      // Extract images from src matching /uploads/
      const imgMatches = [...html.matchAll(/(?:src|href)=["']([^"']+\/uploads\/[^"']+)["']/gi)];
      const rawImgUrls = [...new Set(imgMatches.map(m => m[1]))];

      console.log(`Extracted Images (${rawImgUrls.length}):`, rawImgUrls);

      const localImages = [];
      for (const remoteUrl of rawImgUrls) {
        const match = remoteUrl.match(/raarya\.com\/uploads\/(.+)$/i);
        if (match && match[1]) {
          const relPath = match[1].split('?')[0];
          const filename = path.basename(relPath);
          const pubPath = path.join(publicBlogUploads, filename);
          const rootPath = path.join(rootBlogUploads, filename);

          try {
            await downloadFile(remoteUrl, pubPath);
            await downloadFile(remoteUrl, rootPath);
          } catch (e) {
            console.error(`Error downloading image ${remoteUrl}:`, e.message);
          }
          const webPath = '/uploads/blog/' + filename;
          if (!localImages.includes(webPath)) {
            localImages.push(webPath);
          }
        }
      }

      // Title extraction
      let title = '';
      const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i) || html.match(/<h2[^>]*>(.*?)<\/h2>/i);
      if (h1Match) title = cleanText(h1Match[1].replace(/<[^>]+>/g, ''));

      // Metadata extraction (date, author, category)
      let date = 'June 2026';
      const dateMatch = html.match(/(?:posted|published|date)[:\s]*([A-Za-z0-9,\s\-]+)/i);
      if (dateMatch) date = cleanText(dateMatch[1]);

      // Extract content paragraphs & headings
      const contentBlocks = [];
      const pMatches = [...html.matchAll(/<(p|h2|h3|li)[^>]*>(.*?)<\/\1>/gi)];
      pMatches.forEach(m => {
        const text = cleanText(m[2].replace(/<[^>]+>/g, ''));
        if (text.length > 5 && !text.includes('JavaScript') && !text.includes('Cookie') && !text.includes('Copyright')) {
          contentBlocks.push({ tag: m[1].toLowerCase(), text });
        }
      });

      console.log(`Title: ${title}`);
      console.log(`Content Blocks (${contentBlocks.length}):`);
      contentBlocks.slice(0, 5).forEach(b => console.log(`  [${b.tag.toUpperCase()}] ${b.text.substring(0, 80)}...`));

      extractedBlogs.push({
        id: `blog-${i + 1}`,
        slug: item.slug,
        title: title || item.slug.replace(/-/g, ' '),
        date,
        author: 'Raarya Real Estate Editorial',
        category: 'Real Estate Guide',
        url: item.url,
        image: localImages.length > 0 ? localImages[0] : '/uploads/blog/default.jpg',
        images: localImages,
        excerpt: contentBlocks.find(b => b.tag === 'p' && b.text.length > 40)?.text || title,
        contentBlocks
      });

    } catch (err) {
      console.error(`Failed to crawl ${item.url}:`, err.message);
    }
  }

  fs.writeFileSync(blogsJsonPath, JSON.stringify(extractedBlogs, null, 2), 'utf8');
  console.log(`\nSuccessfully saved ${extractedBlogs.length} full blog posts to ${blogsJsonPath}!`);
}

run().catch(console.error);
