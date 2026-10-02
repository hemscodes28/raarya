// Intelligent Speech-to-Text Phonetic Normalizer & Auto-Corrector for Indian English, Tamil, and Tanglish

export function normalizeSpeechText(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText.trim();

  // 1. Common acoustic composite errors when speaking casually in Tanglish
  text = text.replace(/\b(signal\s*love|signal\s*lord|signallur\s*love|signal\s*law|signal\s*lock|single\s*lord|singer\s*nallur|sing\s*a\s*nallur)\b/gi, 'Singanallur la');
  text = text.replace(/\b(saravanampatti\s*love|saravampatti\s*love|saravana\s*patti\s*love|saravana\s*party|saravana\s*patty)\b/gi, 'Saravanampatti la');
  text = text.replace(/\b(annur\s*love|anur\s*love|annoor\s*love)\b/gi, 'Annur la');
  text = text.replace(/\b(vadavalli\s*love|vadavali\s*love)\b/gi, 'Vadavalli la');
  text = text.replace(/\b(peelamedu\s*love|pelamedu\s*love)\b/gi, 'Peelamedu la');
  text = text.replace(/\b(sulur\s*love|suloor\s*love)\b/gi, 'Sulur la');
  text = text.replace(/\b(sirumugai\s*love|sirumugai\s*lord)\b/gi, 'Sirumugai la');
  text = text.replace(/\b(thekkalur\s*love|thekkalur\s*lord)\b/gi, 'Thekkalur la');
  text = text.replace(/\b(nellambur\s*love|neelambur\s*love|nellambur\s*lord|neelambur\s*lord|nail\s*amber\s*la|near\s*amber\s*la)\b/gi, 'Neelambur la');
  text = text.replace(/\b(kalapatti\s*love|kalapatti\s*lord)\b/gi, 'Kalapatti la');

  // 2. Tanglish Land & Property Nouns Phonetic Translations
  text = text.replace(/\b(money|many)\s+(irukka|venum|kaatunga|paakkanum|plots|plots?)\b/gi, 'manai $2');
  text = text.replace(/\b(la|le)\s+(money|many)\b/gi, '$1 manai');
  text = text.replace(/\b(we\s*do|v\s*do|weed\s*do|we\s*due)\b/gi, 'veedu');
  text = text.replace(/\b(knee\s*lamb|knee\s*lum|neelam)\b/gi, 'nilam');
  text = text.replace(/\b(adam|aedam|edom)\b/gi, 'edam');

  // 3. Property Type Phonetic Corrections (capturing soft/casual speech variations)
  text = text.replace(/\b(lords|lord|bloats|bloat|plants|plant|plts|lots|lot|plotz|flots|plugs)\b/gi, 'plots');
  text = text.replace(/\b(wheelas|wheela|willa|willas|villah|villaz|wila|willy)\b/gi, 'villas');
  text = text.replace(/\b(flight|flights|flts)\b/gi, 'flats');
  text = text.replace(/\b(horses|horse)\b/gi, 'houses');
  text = text.replace(/\b(lnd|lends|lend)\b/gi, 'land');

  // 4. Tanglish & Spoken Action Words Phonetic Corrections (for normal unstrained voice)
  text = text.replace(/\b(sirrika|sirika|sirikah|sirikatha|eruka|erukka|rika|rica|erica|irruka|irukkaa|irukaa|iruku|irukku|irukura|eureka)\b/gi, 'irukka');
  text = text.replace(/\b(winum|waynum|veenum|venumaa|venuma|venuum|venom|when\s*um|win\s*um)\b/gi, 'venum');
  text = text.replace(/\b(cottunga|kattunga|kaatu|kattu|katunga|katuga|kattungaa|cat\s*in\s*the|cotton\s*ga|cartoon\s*ga|cottage\s*ga)\b/gi, 'kaatunga');
  text = text.replace(/\b(solu|solunga|solungaa|sollu|solemn\s*ga|soul\s*in\s*the|solun\s*ga)\b/gi, 'sollunga');
  text = text.replace(/\b(pakanum|paakanum|parkanum)\b/gi, 'paakkanum');
  text = text.replace(/\b(koola|coola|gulla|kula|ulla|ulle)\b/gi, 'kulla');
  text = text.replace(/\b(wanakkam|vanakam|vankkam|one\s*cup|one\s*come|van\s*come)\b/gi, 'vanakkam');
  text = text.replace(/\b(epdi|ipdi|eppadi|a\s*body)\b/gi, 'eppadi');
  text = text.replace(/\b(athena|ethane)\b/gi, 'ethana');
  text = text.replace(/\b(irukingala|irukeengala)\b/gi, 'irukinga');
  text = text.replace(/\b(kedaikuma|kedaikkuma|kedaikumaa|kadikuma)\b/gi, 'kedaikuma');

  // 5. Coimbatore Locality Phonetic Normalizations
  text = text.replace(/\b(siganallur|signallur|signalur|singanllur|singanallor|singanaloor|singanalloor|singanalluru|singanellur)\b/gi, 'Singanallur');
  text = text.replace(/\b(saravanampaty|saravampatti|saravana\s*patti|sharavanampatti|sharavana\s*patti|saravanapatti)\b/gi, 'Saravanampatti');
  text = text.replace(/\b(anur|annoor|anoor|annor)\b/gi, 'Annur');
  text = text.replace(/\b(nellambur|neelamboor|nellamboor|neelambur\s*bypass|nellam\s*pur|nail\s*amber|near\s*amber)\b/gi, 'Neelambur');
  text = text.replace(/\b(kalapatty|kala\s*patti)\b/gi, 'Kalapatti');
  text = text.replace(/\b(echanari|eechanari|eachanari)\b/gi, 'Eachanari');
  text = text.replace(/\b(vellalor|vella\s*lore)\b/gi, 'Vellalore');
  text = text.replace(/\b(malumichampatty|malumicham\s*patti)\b/gi, 'Malumichampatti');
  text = text.replace(/\b(madukari|maduka\s*rai)\b/gi, 'Madukkarai');
  text = text.replace(/\b(gandipuram|gandi\s*puram|gandhi\s*puram)\b/gi, 'Gandhipuram');
  text = text.replace(/\b(vadavali|vadavally|vada\s*valli|vadavli)\b/gi, 'Vadavalli');
  text = text.replace(/\b(pelamedu|pilamedu|pela\s*medu|peela\s*medu)\b/gi, 'Peelamedu');
  text = text.replace(/\b(thudiyaloor|thudiyallur|tudiyalur|thudiyaaloor|tudiyaloor)\b/gi, 'Thudiyalur');
  text = text.replace(/\b(karumathampaty|karumathanpatti|karumathampati|karma\s*thampatti)\b/gi, 'Karumathampatti');
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
  text = text.replace(/\b(kurumba\s*palayam|kurumbapalayam)\b/gi, 'Kurumbapalayam');
  text = text.replace(/\b(arasr|arasur)\b/gi, 'Arasur');

  return text;
}

export function autoDetectAndFormatSpeech(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return '';
  const normalized = normalizeSpeechText(rawText);
  if (!normalized) return '';

  // If already in Tamil Unicode script, return it directly
  if (/[\u0B80-\u0BFF]/.test(normalized)) {
    return normalized;
  }

  const lower = normalized.toLowerCase();

  // Check for Tamil / Tanglish indicators
  const isTanglish = Boolean(
    lower.match(/\b(la|le|lo|il|kitta|pakka|irukka|venum|kaatunga|sollunga|edam|manai|nilam|veedu|ethana|vilai|vanakkam|nandri|eppadi|epdi|irukinga|kedaikuma|kulla|paakkanum|romba|unga|namma|kadi|siripu|solli|pesu)\b/i)
  );

  if (!isTanglish) {
    // Keep in pure English!
    return normalized;
  }

  // Convert Tanglish into clear Tamil text for display and matching!
  let tamilText = normalized;

  // Locations with optional locality suffix in Tamil
  tamilText = tamilText.replace(/\bSinganallur(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'சிங்காநல்லூர்ல');
  tamilText = tamilText.replace(/\bSaravanampatti(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'சரவணம்பட்டில');
  tamilText = tamilText.replace(/\bNeelambur(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'நீலம்பூர்ல');
  tamilText = tamilText.replace(/\bNellambur(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'நீலம்பூர்ல');
  tamilText = tamilText.replace(/\bAnnur(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'அன்னூர்ல');
  tamilText = tamilText.replace(/\bGandhipuram(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'காந்திபுரம்ல');
  tamilText = tamilText.replace(/\bVadavalli(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'வடவள்ளில');
  tamilText = tamilText.replace(/\bPeelamedu(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'பீளமேடுல');
  tamilText = tamilText.replace(/\bSulur(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'சூலூர்ல');
  tamilText = tamilText.replace(/\bThudiyalur(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'துடியலூர்ல');
  tamilText = tamilText.replace(/\bKarumathampatti(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'கருமத்தம்பட்டில');
  tamilText = tamilText.replace(/\bKovaipudur(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'கோவைப்புதூர்ல');
  tamilText = tamilText.replace(/\bMettupalayam(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'மேட்டுப்பாளையம்ல');
  tamilText = tamilText.replace(/\bKinathukadavu(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'கிணத்துக்கடவுல');
  tamilText = tamilText.replace(/\bSirumugai(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'சிறுமுகைல');
  tamilText = tamilText.replace(/\bThekkalur(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'தெக்கலூர்ல');
  tamilText = tamilText.replace(/\bAvinashi(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'அவினாசில');
  tamilText = tamilText.replace(/\bKaniyur(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'கனியூர்ல');
  tamilText = tamilText.replace(/\bKalapatti(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'காளப்பட்டில');
  tamilText = tamilText.replace(/\bEachanari(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'ஈச்சனாரில');
  tamilText = tamilText.replace(/\bIrugur(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'இருகூர்ல');
  tamilText = tamilText.replace(/\bVellalore(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'வெள்ளலூர்ல');
  tamilText = tamilText.replace(/\bMalumichampatti(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'மலுமிச்சம்பட்டில');
  tamilText = tamilText.replace(/\bMadukkarai(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'மதுக்கரைல');
  tamilText = tamilText.replace(/\bPollachi(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'பொள்ளாச்சில');
  tamilText = tamilText.replace(/\bPerur(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'பேரூர்ல');
  tamilText = tamilText.replace(/\bRS Puram(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'ஆர்.எஸ். புரம்ல');
  tamilText = tamilText.replace(/\bRace Course(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'ரேஸ் கோர்ஸ்ல');
  tamilText = tamilText.replace(/\bTownhall(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'டவுன்ஹால்ல');
  tamilText = tamilText.replace(/\bUkkadam(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'உக்கடம்ல');
  tamilText = tamilText.replace(/\bKurumbapalayam(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'குரும்பபாளையம்ல');
  tamilText = tamilText.replace(/\bKittampalayam(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'கிட்டம்பாளையம்ல');
  tamilText = tamilText.replace(/\bArasur(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'அரசூர்ல');
  tamilText = tamilText.replace(/\bCoimbatore(?:\s*(?:la|le|lo|il|kitta|pakka))?\b/gi, 'கோயம்புத்தூர்ல');

  // Clean up any double 'la' / 'le'
  tamilText = tamilText.replace(/\b(?:la|le|lo|il)\b/gi, '');

  // Property & Common words in Tamil
  tamilText = tamilText.replace(/\bplots?\b/gi, 'பிளாட்ஸ்');
  tamilText = tamilText.replace(/\bvillas?\b/gi, 'வில்லாக்கள்');
  tamilText = tamilText.replace(/\bflats?|apartments?\b/gi, 'அபார்ட்மெண்ட்');
  tamilText = tamilText.replace(/\bhouses?|homes?\b/gi, 'வீடு');
  tamilText = tamilText.replace(/\bveedu\b/gi, 'வீடு');
  tamilText = tamilText.replace(/\bmanai\b/gi, 'மனை');
  tamilText = tamilText.replace(/\bnilam\b/gi, 'நிலம்');
  tamilText = tamilText.replace(/\bedam\b/gi, 'இடம்');
  tamilText = tamilText.replace(/\bethana\b/gi, 'எத்தனை');
  tamilText = tamilText.replace(/\birukka\b/gi, 'இருக்கா');
  tamilText = tamilText.replace(/\bvenum\b/gi, 'வேணும்');
  tamilText = tamilText.replace(/\bkaatunga\b/gi, 'காட்டுங்க');
  tamilText = tamilText.replace(/\bsollunga\b/gi, 'சொல்லுங்க');
  tamilText = tamilText.replace(/\bvanakkam\b/gi, 'வணக்கம்');
  tamilText = tamilText.replace(/\bnandri\b/gi, 'நன்றி');
  tamilText = tamilText.replace(/\beppadi\b/gi, 'எப்படி');
  tamilText = tamilText.replace(/\birukinga\b/gi, 'இருக்கீங்க');
  tamilText = tamilText.replace(/\bkedaikuma\b/gi, 'கிடைக்குமா');
  tamilText = tamilText.replace(/\bkulla\b/gi, 'குள்ள');
  tamilText = tamilText.replace(/\bpaakkanum\b/gi, 'பார்க்கணும்');
  tamilText = tamilText.replace(/\bromba\b/gi, 'ரொம்ப');
  tamilText = tamilText.replace(/\bjoke\b/gi, 'ஜோக்');
  tamilText = tamilText.replace(/\bsiripu\b/gi, 'சிரிப்பு');
  tamilText = tamilText.replace(/\bbest\b/gi, 'சிறந்த');
  tamilText = tamilText.replace(/\btop\b/gi, 'டாப்');
  tamilText = tamilText.replace(/\bbro\b/gi, 'ப்ரோ');
  tamilText = tamilText.replace(/\bunga\b/gi, 'உங்க');
  tamilText = tamilText.replace(/\bnamma\b/gi, 'நம்ம');

  return tamilText.trim().replace(/\s+/g, ' ');
}
