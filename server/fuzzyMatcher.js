// Fuzzy location matcher and typo-tolerant search helper

export const KNOWN_LOCATIONS = [
  { canonical: 'Gandhipuram', aliases: ['gandhipuram', 'gandipuram', 'gandhipram', 'gandipurm', 'gandi puram', 'gandhi puram', 'gandhipuram la', 'காந்திபுரம்', 'காந்திபுரத்தில்', 'காந்திபுரம்ல'] },
  { canonical: 'Saravanampatti', aliases: ['saravanampatti', 'saravanampati', 'saravanam patti', 'saravanampattii', 'saravanampatty', 'saravanapatty', 'saravampatti', 'sharavanampatti', 'saravanampatti la', 'saravana patti', 'சரவணம்பட்டி', 'சரவணம்பட்டியில்', 'சரவணம்பட்டில'] },
  { canonical: 'Vadavalli', aliases: ['vadavalli', 'vadavali', 'vadapalli', 'vadavli', 'vadavallii', 'vadavally', 'vadavalli la', 'வடவள்ளி', 'வடவள்ளியில்', 'வடவள்ளில'] },
  { canonical: 'Mettupalayam', aliases: ['mettupalayam', 'metupalayam', 'mettupalym', 'metupalaiyam', 'mettupalaiyam', 'mettu palayam', 'mettupalayam road', 'mettupalayam la', 'மேட்டுப்பாளையம்', 'மேட்டுப்பாளையத்தில்', 'மேட்டுப்பாளையம்ல'] },
  { canonical: 'Karanampettai', aliases: ['karanampettai', 'karanampet', 'karanampetai', 'karanampattai', 'காரணம்பேட்டை', 'காரணம்பேட்டையில்'] },
  { canonical: 'Peelamedu', aliases: ['peelamedu', 'pelamedu', 'pilamedu', 'peela medu', 'peelamedu la', 'பீளமேடு', 'பீளமேட்டில்', 'பீளமேடுல'] },
  { canonical: 'Singanallur', aliases: ['singanallur', 'singanalur', 'singanallr', 'siganallur', 'signallur', 'signalur', 'singanllur', 'singanallor', 'singanaloor', 'singanalloor', 'singanalluru', 'singanellur', 'singanallur la', 'signal lords', 'சிங்காநல்லூர்', 'சிங்காநல்லூரில்', 'சிங்காநல்லூர்ல'] },
  { canonical: 'Sulur', aliases: ['sulur', 'sullur', 'sulr', 'suloor', 'sulur la', 'சூலூர்', 'சூலூரில்', 'சூலூர்ல'] },
  { canonical: 'Ondipudur', aliases: ['ondipudur', 'ondipudr', 'ondiputhur', 'ondi pudur', 'ondipudur la', 'ஒண்டிப்புதூர்', 'ஒண்டிப்புதூரில்', 'ஒண்டிப்புதூர்ல'] },
  { canonical: 'Thudiyalur', aliases: ['thudiyalur', 'tudiyalur', 'thudiyaloor', 'thudiyallur', 'tudiyaloor', 'thudiyalur la', 'துடியலூர்', 'துடியலூரில்', 'துடியலூர்ல'] },
  { canonical: 'Saibaba Colony', aliases: ['saibaba colony', 'saibaba', 'saibabacolony', 'sai baba colony', 'kk pudur', 'saibaba mission', 'சாய்பாபா காலனி', 'சாய்பாபா காலனியில்'] },
  { canonical: 'Ramanathapuram', aliases: ['ramanathapuram', 'ramnathapuram', 'ramanathpuram', 'ramanathapuram la', 'ராமநாதபுரம்', 'ராமநாதபுரத்தில்', 'ராமநாதபுரம்ல'] },
  { canonical: 'Ganapathy', aliases: ['ganapathy', 'ganapathi', 'ganapthy', 'ganapathy la', 'கணபதி', 'கணபதியில்', 'கணபதில'] },
  { canonical: 'Karumathampatti', aliases: ['karumathampatti', 'karumathampati', 'karumathampaty', 'karumathanpatti', 'karumathampatti la', 'கருமத்தம்பட்டி', 'கருமத்தம்பட்டியில்', 'கருமத்தம்பட்டில'] },
  { canonical: 'Kovaipudur', aliases: ['kovaipudur', 'kovaipudr', 'kovai pudur', 'kovapudur', 'kovaipudur la', 'கோவைப்புதூர்', 'கோவைப்புதூரில்', 'கோவைப்புதூர்ல'] },
  { canonical: 'Arasur', aliases: ['arasur', 'arasr', 'arasur la', 'அரசூர்', 'அரசூரில்', 'அரசூர்ல'] },
  { canonical: 'Kinathukadavu', aliases: ['kinathukadavu', 'kinathukadav', 'kinathukadavu la', 'கிணத்துக்கடவு', 'கிணத்துக்கடவில்', 'கிணத்துக்கடவுல'] },
  { canonical: 'Annur', aliases: ['annur', 'anur', 'annoor', 'anoor', 'annur la', 'அன்னூர்', 'அன்னூரில்', 'அன்னூர்ல'] },
  { canonical: 'Tiruppur', aliases: ['tiruppur', 'tirupur', 'tiruppur la', 'திருப்பூர்', 'திருப்பூரில்', 'திருப்பூர்ல'] },
  { canonical: 'Erode', aliases: ['erode', 'erode la', 'ஈரோடு', 'ஈரோட்டில்', 'ஈரோடுல'] },
  { canonical: 'Karamadai', aliases: ['karamadai', 'karamadai la', 'காரமடை', 'காரமடையில்', 'காரமடைல'] },
  { canonical: 'Sevur', aliases: ['sevur', 'sevur la', 'சேவூர்', 'சேவூரில்', 'சேவூர்ல'] },
  { canonical: 'Hopes', aliases: ['hopes', 'hopes college', 'ஹோப்ஸ்'] },
  { canonical: 'Kurumbapalayam', aliases: ['kurumbapalayam', 'kurumbapalayam la', 'குரும்பபாளையம்', 'குரும்பபாளையத்தில்', 'குரும்பபாளையம்ல'] },
  { canonical: 'Kittampalayam', aliases: ['kittampalayam', 'kittam palayam', 'kittampalayam la', 'கிட்டம்பாளையம்', 'கிட்டம்பாளையத்தில்'] },
  { canonical: 'Vadamadurai', aliases: ['vadamadurai', 'vadamadurai la', 'வடமதுரை', 'வடமதுரையில்'] },
  { canonical: 'Sirumugai', aliases: ['sirumugai', 'sirumugai la', 'சிறுமுகை', 'சிறுமுகையில்'] },
  { canonical: 'Thekkalur', aliases: ['thekkalur', 'thekkalur la', 'தெக்கலூர்', 'தெக்கலூரில்'] },
  { canonical: 'Avinashi', aliases: ['avinashi', 'avinashi road', 'avinasi', 'avinashy', 'avinasi road', 'avinashi la', 'அவினாசி', 'அவினாசியில்', 'அவினாசில'] },
  { canonical: 'Kaniyur', aliases: ['kaniyur', 'kaniyur la', 'கனியூர்', 'கனியூரில்'] }
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
