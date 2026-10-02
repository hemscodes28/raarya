// Intelligent Speech-to-Text Phonetic Normalizer & Auto-Corrector for Server

export function normalizeSpeechText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText.trim();

  // 1. Property Type Phonetic Corrections
  text = text.replace(/\b(lords|lord|bloats|plants|plts|lots|plotz|bloat)\b/gi, 'plots');
  text = text.replace(/\b(wheelas|willa|willas|villah|villaz|wila|willy)\b/gi, 'villas');
  text = text.replace(/\b(flight|flights|flts)\b/gi, 'flats');
  text = text.replace(/\b(lnd|lends)\b/gi, 'land');

  // 2. Tanglish & Spoken Action Words Phonetic Corrections
  text = text.replace(/\b(sirrika|sirika|sirikah|eruka|erukka|rika|irruka|irukkaa|irukaa|iruku)\b/gi, 'irukka');
  text = text.replace(/\b(winum|waynum|veenum|venumaa|venum)\b/gi, 'venum');
  text = text.replace(/\b(cottunga|kattunga|kaatu|katunga|katuga)\b/gi, 'kaatunga');
  text = text.replace(/\b(solu|solunga|solungaa|sollu)\b/gi, 'sollunga');
  text = text.replace(/\b(wanakkam|vanakam|vankkam)\b/gi, 'vanakkam');
  text = text.replace(/\b(epdi|ipdi|eppadi)\b/gi, 'eppadi');
  text = text.replace(/\b(irukingala|irukeengala|irukura)\b/gi, 'irukinga');

  // 3. Coimbatore Locality Phonetic Normalizations
  text = text.replace(/\b(siganallur|singanllur|singanallor|singanaloor|singanalloor|singanalluru|singanellur|singanallur)\b/gi, 'Singanallur');
  text = text.replace(/\b(saravanampaty|saravampatti|saravana\s*patti|sharavanampatti|sharavana\s*patti|saravanapatti)\b/gi, 'Saravanampatti');
  text = text.replace(/\b(anur|annoor|anoor|annor)\b/gi, 'Annur');
  text = text.replace(/\b(gandipuram|gandi\s*puram|gandhi\s*puram)\b/gi, 'Gandhipuram');
  text = text.replace(/\b(vadavali|vadavally|vada\s*valli|vadavli)\b/gi, 'Vadavalli');
  text = text.replace(/\b(pelamedu|pilamedu|pela\s*medu|peela\s*medu)\b/gi, 'Peelamedu');
  text = text.replace(/\b(thudiyaloor|thudiyallur|tudiyalur|thudiyaaloor|tudiyaloor)\b/gi, 'Thudiyalur');
  text = text.replace(/\b(karumathampaty|karumathanpatti|karumathampati)\b/gi, 'Karumathampatti');
  text = text.replace(/\b(metupalayam|mettupalym|metupalaiyam|mettupalaiyam|mettu\s*palayam)\b/gi, 'Mettupalayam');
  text = text.replace(/\b(avinasi|avinashy|avinasi\s*road|avinashi\s*road)\b/gi, 'Avinashi');
  text = text.replace(/\b(kovaipudr|kovai\s*pudur|kovapudur)\b/gi, 'Kovaipudur');
  text = text.replace(/\b(ganapathi|ganapthy)\b/gi, 'Ganapathy');
  text = text.replace(/\b(saibaba\s*colony|sai\s*baba\s*colony|saibaba)\b/gi, 'Saibaba Colony');
  text = text.replace(/\b(ramanathpuram|ramnathapuram|ramanatha\s*puram)\b/gi, 'Ramanathapuram');
  text = text.replace(/\b(karanampet|karanampattai)\b/gi, 'Karanampettai');
  text = text.replace(/\b(sullur|suloor)\b/gi, 'Sulur');
  text = text.replace(/\b(ondipudr|ondiputhur|ondi\s*pudur)\b/gi, 'Ondipudur');
  text = text.replace(/\b(kittam\s*palayam|kittampalayam)\b/gi, 'Kittampalayam');
  text = text.replace(/\b(arasr|arasur)\b/gi, 'Arasur');

  return text;
}
