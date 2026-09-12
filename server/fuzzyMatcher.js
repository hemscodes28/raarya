// Fuzzy location matcher and typo-tolerant search helper

export const KNOWN_LOCATIONS = [
  { canonical: 'Gandhipuram', aliases: ['gandhipuram', 'gandipuram', 'gandhipram', 'gandipurm', 'gandi puram', 'gandhi puram'] },
  { canonical: 'Saravanampatti', aliases: ['saravanampatti', 'saravanampati', 'saravanam patti', 'saravanampattii', 'saravanampatty', 'saravanapatty'] },
  { canonical: 'Vadavalli', aliases: ['vadavalli', 'vadavali', 'vadapalli', 'vadavli', 'vadavallii'] },
  { canonical: 'Mettupalayam', aliases: ['mettupalayam', 'metupalayam', 'mettupalym', 'metupalaiyam', 'mettupalaiyam'] },
  { canonical: 'Karanampettai', aliases: ['karanampettai', 'karanampet', 'karanampetai', 'karanampattai'] },
  { canonical: 'Peelamedu', aliases: ['peelamedu', 'pelamedu', 'pilamedu', 'peelamedu'] },
  { canonical: 'Singanallur', aliases: ['singanallur', 'singanalur', 'singanallr', 'singanallur'] },
  { canonical: 'Sulur', aliases: ['sulur', 'sullur', 'sulr'] },
  { canonical: 'Ondipudur', aliases: ['ondipudur', 'ondipudr', 'ondiputhur'] },
  { canonical: 'Thudiyalur', aliases: ['thudiyalur', 'tudiyalur', 'thudiyalur'] },
  { canonical: 'Saibaba Colony', aliases: ['saibaba colony', 'saibaba', 'saibabacolony', 'sai baba colony', 'kk pudur', 'saibaba mission'] },
  { canonical: 'Ramanathapuram', aliases: ['ramanathapuram', 'ramnathapuram', 'ramanathpuram'] },
  { canonical: 'Ganapathy', aliases: ['ganapathy', 'ganapathi', 'ganapthy'] },
  { canonical: 'Karumathampatti', aliases: ['karumathampatti', 'karumathampati'] },
  { canonical: 'Kovaipudur', aliases: ['kovaipudur', 'kovaipudr', 'kovai pudur'] },
  { canonical: 'Arasur', aliases: ['arasur', 'arasr'] },
  { canonical: 'Kinathukadavu', aliases: ['kinathukadavu', 'kinathukadav'] },
  { canonical: 'Annur', aliases: ['annur', 'anur'] },
  { canonical: 'Tiruppur', aliases: ['tiruppur', 'tirupur', 'tirupur'] },
  { canonical: 'Erode', aliases: ['erode'] },
  { canonical: 'Karamadai', aliases: ['karamadai'] },
  { canonical: 'Sevur', aliases: ['sevur'] },
  { canonical: 'Hopes', aliases: ['hopes', 'hopes college'] },
  { canonical: 'Kurumbapalayam', aliases: ['kurumbapalayam'] },
  { canonical: 'Kittampalayam', aliases: ['kittampalayam'] },
  { canonical: 'Vadamadurai', aliases: ['vadamadurai'] },
  { canonical: 'Sirumugai', aliases: ['sirumugai'] },
  { canonical: 'Thekkalur', aliases: ['thekkalur'] },
  { canonical: 'Avinashi', aliases: ['avinashi', 'avinashi road'] },
  { canonical: 'Kaniyur', aliases: ['kaniyur'] }
];

export function levenshteinDistance(a, b) {
  const matrix = [];
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

export function matchLocationFuzzy(queryText) {
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

export function isFuzzyMatch(text, targetTerm) {
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
