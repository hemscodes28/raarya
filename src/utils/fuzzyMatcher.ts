// Fuzzy location matcher and typo-tolerant search helper for TypeScript frontend

export interface LocationMapping {
  canonical: string;
  aliases: string[];
}

export const KNOWN_LOCATIONS: LocationMapping[] = [
  { canonical: 'Gandhipuram', aliases: ['gandhipuram', 'gandipuram', 'gandhipram', 'gandipurm', 'gandi puram', 'gandhi puram', 'காந்திபுரம்'] },
  { canonical: 'Saravanampatti', aliases: ['saravanampatti', 'saravanampati', 'saravanam patti', 'saravanampattii', 'saravanampatty', 'saravanapatty', 'saravampatti', 'sharavanampatti', 'சரவணம்பட்டி'] },
  { canonical: 'Vadavalli', aliases: ['vadavalli', 'vadavali', 'vadapalli', 'vadavli', 'vadavallii', 'vadavally', 'வடவள்ளி'] },
  { canonical: 'Mettupalayam', aliases: ['mettupalayam', 'metupalayam', 'mettupalym', 'metupalaiyam', 'mettupalaiyam', 'mettu palayam', 'மேட்டுப்பாளையம்'] },
  { canonical: 'Karanampettai', aliases: ['karanampettai', 'karanampet', 'karanampetai', 'karanampattai'] },
  { canonical: 'Peelamedu', aliases: ['peelamedu', 'pelamedu', 'pilamedu', 'peela medu', 'ப hisளமேடு', 'பீளமேடு'] },
  { canonical: 'Singanallur', aliases: ['singanallur', 'singanalur', 'singanallr', 'siganallur', 'singanllur', 'singanallor', 'singanaloor', 'singanalloor', 'singanalluru', 'singanellur', 'சிங்காநல்லூர்'] },
  { canonical: 'Sulur', aliases: ['sulur', 'sullur', 'sulr', 'suloor', 'சூலூர்'] },
  { canonical: 'Ondipudur', aliases: ['ondipudur', 'ondipudr', 'ondiputhur', 'ondi pudur', 'ஒண்டிப்புதூர்'] },
  { canonical: 'Thudiyalur', aliases: ['thudiyalur', 'tudiyalur', 'thudiyaloor', 'thudiyallur', 'tudiyaloor', 'துடியலூர்'] },
  { canonical: 'Saibaba Colony', aliases: ['saibaba colony', 'saibaba', 'saibabacolony', 'sai baba colony', 'kk pudur', 'saibaba mission'] },
  { canonical: 'Ramanathapuram', aliases: ['ramanathapuram', 'ramnathapuram', 'ramanathpuram', 'ராமநாதபுரம்'] },
  { canonical: 'Ganapathy', aliases: ['ganapathy', 'ganapathi', 'ganapthy', 'கணபதி'] },
  { canonical: 'Karumathampatti', aliases: ['karumathampatti', 'karumathampati', 'karumathampaty', 'karumathanpatti', 'கருமத்தம்பட்டி'] },
  { canonical: 'Kovaipudur', aliases: ['kovaipudur', 'kovaipudr', 'kovai pudur', 'kovapudur', 'கோவைப்புதூர்'] },
  { canonical: 'Arasur', aliases: ['arasur', 'arasr', 'அரசூர்'] },
  { canonical: 'Kinathukadavu', aliases: ['kinathukadavu', 'kinathukadav', 'கிணத்துக்கடவு'] },
  { canonical: 'Annur', aliases: ['annur', 'anur', 'annoor', 'anoor', 'அன்னூர்'] },
  { canonical: 'Tiruppur', aliases: ['tiruppur', 'tirupur', 'திருப்பூர்'] },
  { canonical: 'Erode', aliases: ['erode', 'ஈரோடு'] },
  { canonical: 'Karamadai', aliases: ['karamadai', 'காரமடை'] },
  { canonical: 'Sevur', aliases: ['sevur', 'சேவூர்'] },
  { canonical: 'Hopes', aliases: ['hopes', 'hopes college'] },
  { canonical: 'Kurumbapalayam', aliases: ['kurumbapalayam', 'குரும்பபாளையம்'] },
  { canonical: 'Kittampalayam', aliases: ['kittampalayam', 'kittam palayam', 'கிட்டம்பாளையம்'] },
  { canonical: 'Vadamadurai', aliases: ['vadamadurai', 'வடமதுரை'] },
  { canonical: 'Sirumugai', aliases: ['sirumugai', 'சிறுமுகை'] },
  { canonical: 'Thekkalur', aliases: ['thekkalur', 'தெக்கலூர்'] },
  { canonical: 'Avinashi', aliases: ['avinashi', 'avinashi road', 'avinasi', 'avinashy', 'avinasi road', 'அவினாசி'] },
  { canonical: 'Kaniyur', aliases: ['kaniyur', 'கனியூர்'] }
];

export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function matchLocationFuzzy(queryText: string): string | null {
  if (!queryText) return null;
  const cleanLower = String(queryText).toLowerCase().replace(/[^\w\s]/g, ' ').trim();
  const words = cleanLower.split(/\s+/).filter(w => w.length >= 3 && !['the', 'and', 'for', 'are', 'in', 'near', 'plots', 'plot', 'villas', 'villa', 'house', 'houses', 'land', 'lands', 'apartment', 'apartments', 'buy', 'rent', 'pg', 'hostel', 'coimbatore', 'show', 'need'].includes(w));

  // 1. Direct Alias & Substring Match
  for (const loc of KNOWN_LOCATIONS) {
    for (const alias of loc.aliases) {
      if (cleanLower.includes(alias)) {
        return loc.canonical;
      }
      for (const word of words) {
        if (word.length >= 4 && alias.includes(word)) {
          return loc.canonical;
        }
      }
    }
  }

  // 2. Levenshtein Distance Check (Typo tolerance for input words)
  for (const word of words) {
    if (word.length < 4) continue;
    for (const loc of KNOWN_LOCATIONS) {
      for (const alias of loc.aliases) {
        const dist = levenshteinDistance(word, alias);
        const maxDist = word.length <= 5 ? 1 : word.length <= 8 ? 2 : 3;
        if (dist <= maxDist) {
          return loc.canonical;
        }
      }
    }
  }

  return null;
}

export function isFuzzyMatch(text: string, targetTerm: string): boolean {
  if (!text || !targetTerm) return false;
  const lowerText = String(text).toLowerCase();
  const lowerTarget = String(targetTerm).toLowerCase().trim();

  if (lowerText.includes(lowerTarget)) return true;

  const matchedCanonical = matchLocationFuzzy(lowerTarget);
  if (matchedCanonical && lowerText.includes(matchedCanonical.toLowerCase())) {
    return true;
  }

  const words = lowerTarget.split(/\s+/).filter(w => w.length >= 4);
  for (const word of words) {
    if (lowerText.includes(word)) return true;
    for (const loc of KNOWN_LOCATIONS) {
      for (const alias of loc.aliases) {
        if (alias === word || levenshteinDistance(word, alias) <= 2) {
          if (lowerText.includes(loc.canonical.toLowerCase())) return true;
        }
      }
    }
  }

  return false;
}
