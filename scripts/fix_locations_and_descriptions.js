import fs from 'fs';
import path from 'path';

function cleanPropertyData() {
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'extracted_properties.json');
  const properties = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Cleaning ${properties.length} properties...`);

  let count = 0;
  for (const p of properties) {
    // 1. Clean description
    if (p.description) {
      // Remove boilerplate header/footer text if present
      p.description = p.description
        .replace(/Home\s*-->[\s\S]*?Submit Enquiry\s*/gi, '')
        .replace(/Sell\s*·[\s\S]*?Enquire Now\s*All Photos\s*Description\s*/gi, '')
        .replace(/\/\* ═+[\s\S]*/g, '')
        .replace(/\" content=\"/g, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&#8377;/g, '₹')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    if (!p.description || p.description.length < 30) {
      p.description = `${p.title} - Premium property listing located in ${p.location || 'Coimbatore, Tamil Nadu'}. Featuring clear title documentation, strategic location advantage, excellent road connectivity, and high growth potential. Price: ${p.price}.`;
    }

    // 2. Clean location
    if (p.location && (p.location.includes('At RAARYA') || p.location.includes('finding a home'))) {
      // Try to extract location from title or default to Coimbatore
      const locMatch = p.title.match(/in\s+([A-Za-z\s,]+)(?:\||$)/i);
      if (locMatch) {
        p.location = `${locMatch[1].trim()}, Tamil Nadu`;
      } else {
        p.location = 'Coimbatore, Tamil Nadu';
      }
    }

    // 3. Ensure images array exists
    if (!p.images || p.images.length === 0) {
      p.images = [p.image];
    } else {
      // Ensure image URLs are valid
      p.images = p.images.map(img => img.startsWith('http') ? img : 'https://www.raarya.com/' + img.replace(/^\//, ''));
    }

    count++;
  }

  fs.writeFileSync(jsonPath, JSON.stringify(properties, null, 2), 'utf-8');
  console.log(`Cleaned ${count} properties in dataset.`);
}

cleanPropertyData();
