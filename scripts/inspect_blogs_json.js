import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../src/data/blogs_data.json');
const blogs = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log(`=== INSPECTING ${blogs.length} EXTRACTED BLOG POSTS ===`);

blogs.forEach((b, idx) => {
  console.log(`\n================================================`);
  console.log(`[BLOG ${idx + 1}] ${b.title}`);
  console.log(`Slug: ${b.slug}`);
  console.log(`Featured Image: ${b.image}`);
  console.log(`All Images (${b.images ? b.images.length : 0}):`, b.images);
  console.log(`Excerpt: ${b.excerpt}`);
  console.log(`Content Blocks Count: ${b.contentBlocks ? b.contentBlocks.length : 0}`);

  // Check file existence on disk
  if (b.image) {
    const pubFile = path.join(__dirname, '../public', b.image);
    console.log(`Local Image Exists (${b.image}): ${fs.existsSync(pubFile) ? 'YES ✓' : 'NO ✗'}`);
  }
});
