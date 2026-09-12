import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function formatIndianCurrency(price) {
  if (price === null || price === undefined || isNaN(price) || price === 0) return 'Price on Request';
  const num = Math.round(Number(price));
  const numStr = num.toString();
  let lastThree = numStr.substring(numStr.length - 3);
  const otherNumbers = numStr.substring(0, numStr.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return `₹ ${formatted}`;
}

export function deduplicateProperties(properties = []) {
  const seen = new Set();
  return properties.filter(p => {
    if (!p) return false;
    const key = p.id || `${(p.title || '').trim().toLowerCase()}_${(p.location || '').trim().toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export class LocalPropertyRepository {
  constructor() {
    this.properties = [];
    this.normalizedProperties = [];
    this.loadProperties();
  }

  loadProperties() {
    try {
      const projectRoot = path.join(__dirname, '..');
      
      // Load user database properties
      const userDbPath = path.join(projectRoot, 'user_database.json');
      let dbProps = [];
      if (fs.existsSync(userDbPath)) {
        const raw = fs.readFileSync(userDbPath, 'utf8');
        const db = JSON.parse(raw || '{}');
        dbProps = db.properties || [];
      }

      // Load extracted properties
      const extractedPath = path.join(projectRoot, 'src', 'data', 'extracted_properties.json');
      let extractedProps = [];
      if (fs.existsSync(extractedPath)) {
        const raw = fs.readFileSync(extractedPath, 'utf8');
        extractedProps = JSON.parse(raw || '[]');
      }

      // Combine and deduplicate
      const combined = [...dbProps, ...extractedProps];
      const seen = new Set();
      this.properties = combined.filter(p => {
        if (!p || !p.id) return false;
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

      this.normalizedProperties = this.properties.map(p => this.normalizeProperty(p));
      console.log(`[PropertyRepository] Loaded and normalized ${this.properties.length} properties.`);
    } catch (err) {
      console.error('[PropertyRepository] Error loading properties:', err);
      this.properties = [];
      this.normalizedProperties = [];
    }
  }

  // Parse Indian currency string into estimated total price in INR
  parsePrice(priceStr, area = 0, title = '', description = '') {
    if (!priceStr) return 0;
    const cleanStr = String(priceStr).toLowerCase().replace(/,/g, '');

    // Check for "Per Cent" or "/ cent" pricing
    const isPerCent = cleanStr.includes('per cent') || cleanStr.includes('/ cent') || cleanStr.includes('/cent');
    
    // Check for Lakhs / Lacs
    const lakhMatch = cleanStr.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|lakhs|lacs|l)\b/);
    if (lakhMatch) {
      let val = parseFloat(lakhMatch[1]) * 100000;
      if (isPerCent && area > 0) {
        // Area is in sqft; 1 cent = 435.6 sqft
        const cents = area / 435.6;
        val = val * (cents > 0 ? cents : 1);
      }
      return Math.round(val);
    }

    // Check for Crores
    const croreMatch = cleanStr.match(/(\d+(?:\.\d+)?)\s*(?:crore|crores|cr)\b/);
    if (croreMatch) {
      return Math.round(parseFloat(croreMatch[1]) * 10000000);
    }

    // Extract numbers
    const digitsOnly = cleanStr.replace(/[^\d]/g, '');
    if (digitsOnly.length >= 4) {
      let val = parseInt(digitsOnly, 10);
      if (isPerCent && area > 0) {
        const cents = area / 435.6;
        val = val * (cents > 0 ? cents : 1);
      }
      return Math.round(val);
    }

    return 0;
  }

  // Extract bedroom count (BHK)
  parseBeds(p) {
    if (typeof p.beds === 'number' && p.beds > 0) return p.beds;

    const text = `${p.title || ''} ${p.subType || ''} ${p.description || ''}`.toLowerCase();
    const bhkMatch = text.match(/(\d+)\s*(?:bhk|bedroom|bed)\b/);
    if (bhkMatch) {
      return parseInt(bhkMatch[1], 10);
    }
    return 0;
  }

  // Extract property subType / category
  parsePropertyType(p) {
    const titleLower = (p.title || '').toLowerCase();
    if (titleLower.includes('plot') || titleLower.includes('land') || titleLower.includes('layout')) return 'Plot';
    if (titleLower.includes('villa')) return 'Villa';
    if (titleLower.includes('apartment') || titleLower.includes('flat')) return 'Apartment';
    if (titleLower.includes('house') || titleLower.includes('independent house') || titleLower.includes('home')) return 'House';
    if (titleLower.includes('commercial') || titleLower.includes('office') || titleLower.includes('shop')) return 'Commercial';
    if (titleLower.includes('pg') || titleLower.includes('hostel')) return 'PG/Hostel';

    const text = `${p.subType || ''} ${p.description || ''} ${p.overviewDetails?.['Property Type'] || ''}`.toLowerCase();
    if (text.includes('villa')) return 'Villa';
    if (text.includes('apartment') || text.includes('flat')) return 'Apartment';
    if (text.includes('plot') || text.includes('land') || text.includes('layout')) return 'Plot';
    if (text.includes('house') || text.includes('independent house')) return 'House';
    if (text.includes('commercial') || text.includes('office') || text.includes('shop')) return 'Commercial';
    if (text.includes('pg') || text.includes('hostel')) return 'PG/Hostel';
    return p.subType || 'Residential';
  }

  // Create a normalized representation for robust search
  normalizeProperty(p) {
    const totalEstimatedPrice = this.parsePrice(p.price, p.area, p.title, p.description);
    const bedrooms = this.parseBeds(p);
    const normalizedType = this.parsePropertyType(p);
    
    const titleLower = (p.title || '').toLowerCase();
    const locationLower = (p.location || '').toLowerCase();
    const descLower = (p.description || '').toLowerCase();
    const amenitiesList = Array.isArray(p.amenities) ? p.amenities.map(a => String(a).toLowerCase()) : [];

    const fullText = `${titleLower} ${locationLower} ${descLower} ${normalizedType.toLowerCase()} ${p.type || ''} ${amenitiesList.join(' ')} ${JSON.stringify(p.overviewDetails || {})}`.toLowerCase();

    return {
      raw: p,
      id: p.id,
      title: p.title || 'Property',
      priceDisplay: p.price || '',
      priceNumeric: totalEstimatedPrice,
      location: p.location || '',
      type: p.type || 'buy', // buy | rent | pg-hostel
      subType: normalizedType,
      bedrooms: bedrooms,
      baths: p.baths || 0,
      area: p.area || 0,
      areaDisplay: p.areaDisplay || (p.area ? `${p.area} sq.ft` : ''),
      amenities: p.amenities || [],
      amenitiesLower: amenitiesList,
      agentName: p.agentName || 'Raarya Representative',
      agentPhone: p.agentPhone || (p.agentPhones && p.agentPhones[0]) || '9787255522',
      image: p.image || (p.images && p.images[0]) || '',
      fullText
    };
  }

  // Find single property by ID
  findById(id) {
    if (!id) return null;
    const target = String(id).trim().toLowerCase();
    const found = this.normalizedProperties.find(p => String(p.id).toLowerCase() === target);
    if (!found) return null;
    return {
      ...found.raw,
      bedrooms: found.bedrooms,
      beds: found.bedrooms,
      subType: found.subType,
      priceNumeric: found.priceNumeric,
      areaDisplay: found.areaDisplay
    };
  }

  verifyHardFilters(p, filters) {
    if (!filters) return true;

    // 1. Hard Max Price Check
    if (filters.maxPrice && filters.maxPrice > 0 && p.priceNumeric > 0) {
      if (p.priceNumeric > filters.maxPrice) return false;
    }

    // 2. Hard Min Price Check
    if (filters.minPrice && filters.minPrice > 0 && p.priceNumeric > 0) {
      if (p.priceNumeric < filters.minPrice) return false;
    }

    // 3. Hard Bedrooms Check (BHK)
    if (filters.bedrooms && filters.bedrooms > 0) {
      if (p.bedrooms !== filters.bedrooms) return false;
    }

    // 4. Hard Property SubType Check
    if (filters.propertyType && filters.propertyType !== 'All') {
      const targetType = String(filters.propertyType).toLowerCase();
      if (!p.subType.toLowerCase().includes(targetType) && !targetType.includes(p.subType.toLowerCase())) {
        return false;
      }
    }

    // 5. Hard Locality Check
    if (filters.locality && filters.locality.toLowerCase() !== 'coimbatore') {
      const locTarget = String(filters.locality).toLowerCase();
      if (!p.location.toLowerCase().includes(locTarget) && !p.title.toLowerCase().includes(locTarget)) {
        return false;
      }
    }

    return true;
  }

  // Execute Search query with deterministic filter matching & relevance ranking
  search(filters = {}, queryText = '', limit = 8, offset = 0) {
    let candidates = [...this.normalizedProperties];

    // 1. Transaction Type filter (buy, rent, pg-hostel)
    if (filters.type) {
      const t = String(filters.type).toLowerCase();
      candidates = candidates.filter(p => p.type === t || (t === 'rent' && p.type === 'rent') || (t === 'buy' && p.type === 'buy'));
    }

    // 2. Property SubType filter (Apartment, Villa, Plot, House, Commercial)
    if (filters.propertyType && filters.propertyType !== 'All') {
      const targetType = String(filters.propertyType).toLowerCase();
      candidates = candidates.filter(p => p.subType.toLowerCase().includes(targetType) || targetType.includes(p.subType.toLowerCase()));
    }

    // 3. Bedrooms filter (BHK)
    if (filters.bedrooms && filters.bedrooms > 0) {
      candidates = candidates.filter(p => p.bedrooms === filters.bedrooms);
    }

    // 4. Max Price filter - STRICT HARD UPPER BOUND (0 TOLERANCE MARGIN)
    if (filters.maxPrice && filters.maxPrice > 0) {
      candidates = candidates.filter(p => {
        if (p.priceNumeric === 0) return true;
        return p.priceNumeric <= filters.maxPrice;
      });
    }

    // 5. Min Price filter - STRICT HARD LOWER BOUND
    if (filters.minPrice && filters.minPrice > 0) {
      candidates = candidates.filter(p => {
        if (p.priceNumeric === 0) return true;
        return p.priceNumeric >= filters.minPrice;
      });
    }

    // 6. Location filter
    if (filters.city || filters.locality || filters.location) {
      const locTarget = String(filters.locality || filters.city || filters.location).toLowerCase().trim();
      if (locTarget && locTarget !== 'coimbatore') {
        candidates = candidates.filter(p => p.location.toLowerCase().includes(locTarget) || p.title.toLowerCase().includes(locTarget));
      }
    }

    // 7. Amenities filter
    if (Array.isArray(filters.amenities) && filters.amenities.length > 0) {
      filters.amenities.forEach(requiredAmenity => {
        const req = String(requiredAmenity).toLowerCase().trim();
        candidates = candidates.filter(p => p.fullText.includes(req));
      });
    }

    // Defensive hard-filter validation step
    candidates = candidates.filter(p => this.verifyHardFilters(p, filters));

    // 8. Keyword / Text Relevance Scoring
    const cleanQuery = (queryText || '').toLowerCase().replace(/[^\w\s]/g, ' ').trim();
    const words = cleanQuery.split(/\s+/).filter(w => w.length > 2 && !['the', 'and', 'for', 'are', 'you', 'with', 'in', 'property', 'properties', 'plots', 'plot', 'show', 'give', 'need', 'want', 'list', 'details', 'looking', 'how', 'what', 'who', 'where', 'when', 'why', 'villa', 'villas', 'apartment', 'apartments', 'house', 'houses', 'land', 'lands', 'home', 'homes'].includes(w));

    const hasStructuredFilter = Boolean(
      filters.type || 
      (filters.propertyType && filters.propertyType !== 'All') || 
      filters.bedrooms || 
      filters.maxPrice || 
      filters.minPrice || 
      filters.locality || 
      filters.location || 
      (filters.amenities && filters.amenities.length > 0)
    );

    if (!hasStructuredFilter && words.length === 0) {
      return {
        total: 0,
        offset: 0,
        limit,
        hasMore: false,
        properties: []
      };
    }

    const scored = candidates.map(item => {
      let wordScore = 0;

      words.forEach(word => {
        if (item.title.toLowerCase().includes(word)) wordScore += 12;
        if (item.location.toLowerCase().includes(word)) wordScore += 8;
        if (item.subType.toLowerCase().includes(word)) wordScore += 6;
        if (item.fullText.includes(word)) wordScore += 3;
      });

      // If user provided specific search words (like location or keyword), candidate must match at least one word
      if (words.length > 0 && wordScore === 0) {
        return { item, score: 0 };
      }

      let score = (hasStructuredFilter ? 10 : 0) + wordScore;

      if (cleanQuery.includes('swimming pool') && item.fullText.includes('pool')) score += 15;
      if (cleanQuery.includes('parking') && (item.fullText.includes('parking') || item.fullText.includes('tar road'))) score += 10;
      if (cleanQuery.includes('dtcp') && item.fullText.includes('dtcp')) score += 10;
      if (cleanQuery.includes('rera') && item.fullText.includes('rera')) score += 10;

      if (filters.sortBy === 'price_asc' && item.priceNumeric > 0) {
        score += Math.max(0, 100 - (item.priceNumeric / 100000));
      }

      return { item, score };
    });

    // If search words are provided, only keep items with positive matching score
    const matchingScored = (words.length > 0 || hasStructuredFilter)
      ? scored.filter(s => s.score > 0)
      : scored;

    matchingScored.sort((a, b) => b.score - a.score);

    const totalCount = matchingScored.length;
    const paginated = matchingScored.slice(offset, offset + limit).map(s => ({
      ...s.item.raw,
      bedrooms: s.item.bedrooms,
      beds: s.item.bedrooms,
      subType: s.item.subType,
      priceNumeric: s.item.priceNumeric,
      areaDisplay: s.item.areaDisplay
    }));

    return {
      total: totalCount,
      offset,
      limit,
      hasMore: offset + limit < totalCount,
      properties: paginated
    };
  }
}

export const propertyRepo = new LocalPropertyRepository();
