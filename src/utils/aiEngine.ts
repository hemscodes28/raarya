import { PROPERTIES } from '../constants';
import { matchLocationFuzzy, isFuzzyMatch } from './fuzzyMatcher';

export interface AiResponseObject {
  message: string;
  properties?: any[];
  type?: string;
  intent?: string;
}

export function generateAiResponseObject(userQuery: string): AiResponseObject {
  const query = (userQuery || '').toLowerCase().trim();
  const cleanQ = query.replace(/[^\w\s\u0B80-\u0BFF]/g, ' ').replace(/\s+/g, ' ').trim();

  const isTamilScript = /[\u0B80-\u0BFF]/.test(userQuery);
  const isTanglish = (
    cleanQ.includes('vanakkam') || cleanQ.includes('eppadi') || cleanQ.includes('nalama') ||
    cleanQ.includes('irukka') || cleanQ.includes('venum') || cleanQ.includes('kaatunga') ||
    cleanQ.includes('sollunga') || cleanQ.includes('vilai') || cleanQ.includes('edam') ||
    cleanQ.includes('nandri') || cleanQ.includes('pathi') || cleanQ.includes('kadhai') ||
    cleanQ.includes('siripu') || cleanQ.includes('kadi') || cleanQ.includes('kulla') ||
    cleanQ.includes('veedu') || cleanQ.includes('manai') || cleanQ.includes('paakkanum') ||
    cleanQ.includes('epdi') || cleanQ.includes('enga') || cleanQ.includes('kedaikuma')
  );

  // ─── 1. GREETINGS & INTRODUCTIONS (English, Tamil, Tanglish) ───────────────────
  const isGreeting = (
    /^(hi+|hello+|helo+|hey+|namaste|good\s*(morning|afternoon|evening|day)|greetings|howdy|vanakkam|வணக்கம்)[\s\w\u0B80-\u0BFF]*$/i.test(query) ||
    cleanQ.startsWith('hi ') || cleanQ.startsWith('hello ') || cleanQ.startsWith('hey ') || cleanQ.startsWith('vanakkam ') || cleanQ.startsWith('வணக்கம்') ||
    cleanQ === 'hi' || cleanQ === 'hello' || cleanQ === 'hey' || cleanQ === 'namaste' || cleanQ === 'vanakkam' || cleanQ === 'வணக்கம்'
  );

  if (isGreeting && !query.includes('plot') && !query.includes('villa') && !query.includes('flat') && !query.includes('property') && !query.includes('emi') && !query.includes('rent') && !query.includes('பிளாட்') && !query.includes('வீடு')) {
    if (isTamilScript) {
      return {
        message: `👋 **வணக்கம்! ரார்யா AI-க்கு நல்வரவு!** 🙏😊\n\nநான் கோயம்புத்தூரின் முன்னணி ரியல் எஸ்டேட் நிறுவனமான **ரார்யா பிராப்பர்டீஸ் (Raarya Properties)**-ன் செயற்கை நுண்ணறிவு உதவியாளர்.\n\n**நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?**\n- 🏡 **பிளாட்டுகள் & வில்லாக்கள்**: *"சரவணம்பட்டியில் DTCP பிளாட்டுகள் காட்டு"* அல்லது *"அன்னூரில் வில்லாக்கள்"*\n- 📊 **ஹோம் லோன் EMI கணக்கீடு**: *"35 லட்சத்திற்கு EMI எவ்வளவு?"*\n- 📜 **ரியல் எஸ்டேட் ஆலோசனைகள்**: *"DTCP மற்றும் RERA வித்தியாசம் என்ன?"*\n- 🏢 **சொத்துக்களை விற்க/பதிய**: *"ரார்யாவில் எனது நிலத்தை பதிவது எப்படி?"*\n- 💬 அல்லது என்னிடம் இயல்பாக உரையாடலாம்!\n\nஇன்று உங்களுக்கு என்ன தகவல் வேண்டும்?`,
        properties: [],
        type: 'text',
        intent: 'greetings'
      };
    } else if (isTanglish) {
      return {
        message: `👋 **Vanakkam! Raarya AI-ku Welcome!** 🙏😊\n\nNaan Coimbatore-la irukkira **Raarya Properties**-oda smart AI assistant. Eppadi irukinga?\n\n**Naan ungalukku enna help panna mudiyum:**\n- 🏡 **Plots & Villas paarka**: *"Show DTCP plots in Saravanampatti"* or *"Annur la villa venum"*\n- 📊 **Home Loan EMI Calculate panna**: *"35 lakhs loan ku EMI calculate pannu"*\n- 📜 **Legal & Approval Guidance**: *"DTCP vs RERA difference enna?"*\n- 🏢 **Property List panna**: *"How to list my land in Raarya"*\n- 💬 Or namma jolly-ah chat pannalam!\n\nUngalukku ipo enna details venum bro?`,
        properties: [],
        type: 'text',
        intent: 'greetings'
      };
    } else {
      return {
        message: `👋 **Hello! Welcome to Raarya AI!** 😊\n\nI'm your intelligent conversational assistant for **Raarya Properties & Real Estate** in Coimbatore. How are you doing today?\n\n**Here are a few things I can assist you with:**\n- 🏡 **Find Plots & Villas**: Ask for *"Show DTCP plots in Saravanampatti"* or *"Villas in Annur"*\n- 📊 **Calculate Home Loan EMI**: Ask *"Calculate EMI for 40 Lakhs"*\n- 📜 **Real Estate Advice**: Ask *"Difference between DTCP and RERA approval"*\n- 🏢 **List Your Property**: Ask *"How to list property on Raarya"*\n- 💬 Or simply chat with me about anything in English, Tamil, or Tanglish!\n\nHow can I help you right now?`,
        properties: [],
        type: 'text',
        intent: 'greetings'
      };
    }
  }

  // ─── 2. CASUAL CHAT, WELLBEING & IDENTITY (ChatGPT-style) ───────────────────
  const isCasualChat = (
    cleanQ.includes('how are you') || cleanQ.includes('how r u') || cleanQ.includes('how are u') ||
    cleanQ.includes('how are you doing') || cleanQ.includes('how is it going') || cleanQ.includes('whats up') ||
    cleanQ.includes('hows your day') || cleanQ.includes('how is life') || cleanQ.includes('who are you') ||
    cleanQ.includes('what is your name') || cleanQ.includes('what can you do') || cleanQ.includes('who created you') ||
    cleanQ.includes('are you ai') || cleanQ.includes('are you a robot') || cleanQ.includes('can we chat') ||
    cleanQ.includes('tell me about yourself') || cleanQ.includes('eppadi irukinga') || cleanQ.includes('eppadi irukeenga') ||
    cleanQ.includes('nalama') || cleanQ.includes('nalla irukingala') || cleanQ.includes('epdi iruka') ||
    cleanQ.includes('yaar nee') || cleanQ.includes('un per enna') || cleanQ.includes('எப்படி இருக்கீங்க') || cleanQ.includes('நலமா')
  );

  if (isCasualChat) {
    if (isTamilScript) {
      return {
        message: `நான் மிகவும் நன்றாக இருக்கிறேன்! கேட்டதற்கு மிக்க நன்றி! 😊🙏\n\nநான் **ரார்யா AI (Raarya AI)**. கோவையில் உள்ள முதலீட்டு நிலங்கள், DTCP & RERA அப்ரூவ்டு பிளாட்டுகள், மற்றும் உங்கள் கனவு இல்லத்தை தேர்ந்தெடுக்க நான் உங்களுக்கு உதவ தயாராக உள்ளேன். உங்கள் நாள் எப்படி போகிறது?`,
        properties: [],
        type: 'text',
        intent: 'casual_chat'
      };
    } else if (isTanglish) {
      return {
        message: `Naan romba super-ah irukken bro! Kettadhukku romba nandri! 😊✨\n\nNaan dhaan **Raarya AI**. Coimbatore-la prime layout plots, villas, bank loan calculations pathi ella vishayamum pesalaam! Unga day epdi pogudhu bro?`,
        properties: [],
        type: 'text',
        intent: 'casual_chat'
      };
    } else {
      if (cleanQ.includes('how are you') || cleanQ.includes('how r u') || cleanQ.includes('how are u') || cleanQ.includes('how is it going')) {
        return {
          message: `I'm doing wonderful, thank you for asking! 😊\n\nI am **Raarya AI**, your smart assistant. Whether you want to talk about prime layout plots in Coimbatore, home loan EMIs, or just chat normally, I'm here for you! How is your day going?`,
          properties: [],
          type: 'text',
          intent: 'casual_chat'
        };
      }
      if (cleanQ.includes('who are you') || cleanQ.includes('what can you do') || cleanQ.includes('tell me about yourself')) {
        return {
          message: `I am **Raarya AI**, an intelligent conversational assistant tailored for **Raarya Properties** in Coimbatore! 🚀\n\n**What I can do for you:**\n- 🔍 Find verified **DTCP & RERA approved layout plots, houses & luxury villas** in Saravanampatti, Annur, Ganapathy, etc.\n- 💰 Calculate **Home Loan EMIs & Bank Eligibility** with leading banks (SBI, HDFC, ICICI).\n- 📜 Explain real estate legal rules, **DTCP vs RERA**, patta/chitta document guidelines.\n- 🤝 Connect you with official property advisors for free site visits.\n\nWhat would you like to explore today?`,
          properties: [],
          type: 'text',
          intent: 'capabilities'
        };
      }
    }
  }

  // ─── 3. JOKES & HUMOR (English, Tamil, Tanglish) ─────────────────────────────
  const isJoke = (
    cleanQ.includes('joke') || cleanQ.includes('funny') || cleanQ.includes('laugh') ||
    cleanQ.includes('make me smile') || cleanQ.includes('tell me something funny') ||
    cleanQ.includes('kadi joke') || cleanQ.includes('siripu') || cleanQ.includes('ஜோக்') || cleanQ.includes('கதை')
  );

  if (isJoke) {
    if (isTamilScript) {
      const tamilJokes = [
        `ஏன் ரியல் எஸ்டேட் ஏஜென்ட்க்கு எப்பவும் நண்பர்கள் அதிகம்? \n\nஏன்னா அவங்களுக்கு மட்டும்தான் உங்க வாழ்க்கைக்கு சரியான இடத்தை (space) எப்படி அமைத்துக் கொடுப்பது என்று தெரியும்! 🏠😄\n\nகோவையில் உங்களுக்கு தேவையான பிளாட் அல்லது வில்லா பற்றி தேடலாமா?`,
        `வீடு ஏன் டாக்டர்கிட்ட போச்சு தெரியுமா?\n\nஏன்னா அதுக்கு ஜன்னல் வலி (Window Pane)! 🚪😂\n\nசரவணம்பட்டி அல்லது அன்னூரில் உங்களுக்கு ஏற்ற அருமையான பிளாட்டுகள் பார்க்கலாமா?`
      ];
      return {
        message: tamilJokes[Math.floor(Math.random() * tamilJokes.length)],
        properties: [],
        type: 'text',
        intent: 'joke'
      };
    } else if (isTanglish) {
      const tanglishJokes = [
        `Oru real estate agent-ku yen eppavum friends adhigam theriyuma? \n\nBecause avangalukku dhaan unga life-ku correct-aana **space** epdi arrange pannanum-nu theriyum! 🏠😄\n\nCoimbatore-la Saravanampatti or Annur plots pathi pesalama bro?`,
        `Veedu yen doctor kitta pochu theriyuma bro?\n\nBecause adhakku bayangaramaana **window pane (pain)** irundhucham! 🚪😂\n\nJolly-ah oru plot visit plan pannalama?`
      ];
      return {
        message: tanglishJokes[Math.floor(Math.random() * tanglishJokes.length)],
        properties: [],
        type: 'text',
        intent: 'joke'
      };
    } else {
      const jokes = [
        `Why did the house go to the doctor?\n\nBecause it had a terrible case of **window pane**! 🏠😄\n\nHope that brought a smile to your face! How can I assist your property search today?`,
        `Why are real estate agents great matchmakers?\n\nBecause they always know how to find the **perfect plot**! 🏡😉\n\nWhat kind of dream space are you looking to find today?`,
        `Why did the brick feel so proud?\n\nBecause it was part of a **solid foundation** at Raarya Properties! 🧱✨\n\nCan I help you discover plots or calculate loan EMIs today?`
      ];
      return {
        message: jokes[Math.floor(Math.random() * jokes.length)],
        properties: [],
        type: 'text',
        intent: 'joke'
      };
    }
  }

  // ─── 4. ACKNOWLEDGEMENTS & THANKS ────────────────────────────────────────────
  const isAck = (
    cleanQ === 'thanks' || cleanQ === 'thank you' || cleanQ === 'thanku' || cleanQ === 'ok' ||
    cleanQ === 'okay' || cleanQ === 'great' || cleanQ === 'awesome' || cleanQ === 'nice' ||
    cleanQ === 'cool' || cleanQ === 'good' || cleanQ === 'super' || cleanQ === 'got it' ||
    cleanQ === 'bye' || cleanQ === 'goodbye' || cleanQ === 'see you' || cleanQ === 'nandri' ||
    cleanQ === 'romba nandri' || cleanQ === 'mikka nandri' || cleanQ === 'seri bro' || cleanQ === 'ok bro' ||
    cleanQ === 'நன்றி'
  );

  if (isAck) {
    if (isTamilScript) {
      return {
        message: `மிக்க நன்றி! 🙏 உங்களுக்கு கோவையில் சொத்துக்கள், மனை பிரிவுகள், அல்லது லோன் EMI பற்றி எந்த உதவி தேவைப்பட்டாலும் எப்போது வேண்டுமானாலும் கேளுங்கள். நல்ல நாளாக அமையட்டும்! 🌟`,
        properties: [],
        type: 'text',
        intent: 'acknowledgement'
      };
    } else if (isTanglish) {
      return {
        message: `Romba welcome bro! 😊 Ungalukku Coimbatore-la layout plots paarka, loan EMI calculate panna edhaavudhu help venum na eppo vena கேளுங்க. Have an awesome day! 🚀`,
        properties: [],
        type: 'text',
        intent: 'acknowledgement'
      };
    } else {
      return {
        message: `You're very welcome! 😊 Feel free to ask whenever you need help finding properties, calculating loan EMIs, or exploring prime layouts in Coimbatore. Have a fantastic day!`,
        properties: [],
        type: 'text',
        intent: 'acknowledgement'
      };
    }
  }

  // ─── 5. REAL ESTATE LEGAL & ADVISORY KNOWLEDGE (DTCP / RERA / ADVICE) ────────
  if (
    (query.includes('dtcp') || query.includes('rera') || query.includes('guideline value') || query.includes('patta') || query.includes('chitta') || query.includes('document')) &&
    (query.includes('what is') || query.includes('difference') || query.includes('explain') || query.includes('why') || query.includes('how to verify') || query.includes('meaning') || query.includes('enna') || query.includes('வித்தியாசம்') || !query.includes('show'))
  ) {
    if (isTamilScript) {
      return {
        message: `### 📜 தமிழ்நாட்டில் DTCP மற்றும் RERA ஒப்புதல்கள் பற்றிய விளக்கம்\n\n**1. DTCP ஒப்புதல் என்றால் என்ன?**\n- **DTCP** (*நகர் மற்றும் ஊரமைப்பு இயக்ககம்*) என்பது மனைப் பிரிவின் சாலை அகலம் (குறைந்தது 30 அடி / 23 அடி), பூங்கா ஒதுக்கீடு (OSR) மற்றும் குடியிருப்பு பகுதிக்கான சட்டப்பூர்வ அனுமதி ஆகியவற்றை உறுதி செய்கிறது.\n\n**2. TNRERA பதிவு என்றால் என்ன?**\n- **RERA** என்பது வீடு மற்றும் மனை வாங்குவோரின் உரிமைகளைப் பாதுகாக்கும் மத்திய/மாநில ஒழுங்குமுறை ஆணையமாகும். 500 சதுர மீட்டருக்கு மேல் அல்லது 8 மனைகளுக்கு மேற்பட்ட அனைத்து புதிய திட்டங்களுக்கும் இது கட்டாயம்.\n\n**3. வாங்குபவர்களுக்கு என்ன நன்மைகள்?**\n- ✅ **100% வங்கி கடன் வசதி** (SBI, HDFC, ICICI).\n- ✅ **சட்டப்பூர்வ பட்டா மற்றும் வில்லங்கமற்ற பத்திர பதிவு**.\n- ✅ **வேகமான விலை உயர்வு (High Appreciation)**.\n\n💡 *ரார்யா பிராப்பர்டீஸில் உள்ள அனைத்து மனைகளும் 100% சரிபார்க்கப்பட்ட DTCP & RERA அங்கீகாரம் கொண்டவை.*`,
        properties: [],
        type: 'text',
        intent: 'advisory'
      };
    } else if (isTanglish) {
      return {
        message: `### 📜 DTCP vs RERA Explanation (Tamil Nadu)\n\n**1. DTCP Approval na enna?**\n- **DTCP** (*Directorate of Town and Country Planning*) layout roads (minimum 30ft/23ft), residential zoning, and park/OSR land properly dedicate aagi irukka nu verify panni layout approval tharuvanga.\n\n**2. TNRERA Registration na enna?**\n- **RERA** buyers-oda rights protect panna konduvara patta authority. 8 plots mela irukkira ellam new layout-kum RERA registration compulsory.\n\n**3. Idhanala ungalukku enna benefit?**\n- ✅ **100% Easy Bank Loan** (SBI, HDFC, ICICI).\n- ✅ **Legal Safety**: Clear title & easy individual patta transfer.\n- ✅ **High Value Appreciation**: Saravanampatti & Annur-la verified DTCP plots sema fast-ah value increase aagudhu.\n\n💡 *Raarya-la irukkira ellam plots-um 100% verified DTCP & RERA approved.*`,
        properties: [],
        type: 'text',
        intent: 'advisory'
      };
    } else {
      return {
        message: `### 📜 Understanding DTCP vs RERA in Tamil Nadu\n\n**1. What is DTCP Approval?**\n- **DTCP** (*Directorate of Town and Country Planning*) approves land layouts, ensuring standard road widths (minimum 30ft/23ft), residential zoning, and Open Space Reservation (OSR) for parks and utilities.\n- It guarantees that the land has legal permission to be developed and sold as individual plots.\n\n**2. What is TNRERA Approval?**\n- **RERA** (*Real Estate Regulatory Authority*) protects buyer rights, ensures timely project handover, and prevents fraudulent developer practices.\n- Every layout or building project developed after 2017 with more than 8 plots or 500 sq. meters must have TNRERA registration.\n\n**3. Why is this critical in Coimbatore?**\n- ✅ **100% Bank Loan Approvals**: Leading national banks (SBI, HDFC, ICICI) only finance DTCP & RERA approved properties.\n- ✅ **Clean Title & Safe Investment**: Avoids unapproved panchayat land issues or building permit rejections.\n- ✅ **Higher Appreciation**: Verified DTCP layout plots in Saravanampatti, Annur, and Karumathampatti offer faster capital growth.\n\n💡 *All layout plots on Raarya Properties are 100% verified with clear DTCP and RERA approvals.*\n\nWould you like to explore available DTCP plots in Saravanampatti or Annur?`,
        properties: [],
        type: 'text',
        intent: 'advisory'
      };
    }
  }

  // ─── 6. ABOUT COMPANY & RAARYA PROPERTIES ────────────────────────────────────
  const isCompanyQuery = Boolean(
    ((query.includes('raar') || query.includes('rarya') || query.includes('raarya') || query.includes('company') || query.includes('business') || query.includes('organization') || query.includes('firm') || query.includes('platform') || query.includes('agency')) &&
     (query.includes('about') || query.includes('know') || query.includes('tell') || query.includes('info') || query.includes('detail') || query.includes('service') || query.includes('what is') || query.includes('who is') || query.includes('what does') || query.includes('what do') || query.includes('explain') || query.includes('describe') || query.includes('overview') || query.includes('summary') || query.includes('background') || query.includes('history') || query.includes('kind') || query.includes('type') || query.includes('nature') || query.includes('profile') || query.includes('mission') || query.includes('vision')) &&
     !(query.includes('bhk') || query.includes('bedroom') || query.includes('lakh') || query.includes('lac') || query.includes('crore') || query.includes('under') || query.includes('below') || query.includes('cheap') || query.includes('villa') || query.includes('apartment') || query.includes('plot') || query.includes('land') || query.includes('house'))) ||
    cleanQ.includes('about us') ||
    cleanQ.includes('about company') ||
    cleanQ.includes('about raarya') ||
    cleanQ.includes('what is raarya') ||
    cleanQ.includes('who is raarya') ||
    cleanQ.includes('company info') ||
    cleanQ.includes('company details')
  );

  if (isCompanyQuery) {
    return {
      message: `### 🏠 About Raarya Properties

**Raarya Properties** (part of Raarya Groups) is a leading, trusted real estate firm based in **Coimbatore, Tamil Nadu**. We specialize in high-growth, verified DTCP & RERA approved layout plots, luxury villas, independent homes, and investment land.

**Core Services & Highlights:**
- 🏡 **Verified Plots & Villas**: Prime corridors including Saravanampatti, Annur, Mettupalayam Road, Ganapathy, Singanallur, and Avinashi Road.
- 📋 **Free Property Listings**: Sell or lease your land, villa, or commercial space to verified buyers.
- 💰 **Home Loan Facilitation**: Up to 90% funding with partner banks (SBI, HDFC, ICICI, Axis Bank) starting at 8.5% interest.
- 🚗 **Assisted Site Visits**: Free accompanied site visits with transparent legal document verification.

📍 **Head Office**: 2D, A-Block, Ram Apartment, Avinashi Road, Lakshmi Mills Junction, Coimbatore - 641037.
📞 **Phone**: **+91 90872 40400** | ✉️ **Email**: **raaryagroupsinfo@gmail.com**`,
      properties: [],
      type: 'text',
      intent: 'company_info'
    };
  }

  // ─── 7. EMI & LOAN CALCULATION ───────────────────────────────────────────────
  if (
    query.includes('emi') || query.includes('loan') || query.includes('interest') ||
    query.includes('calculate') || query.includes('finance') || query.includes('eligibility') ||
    query.includes('eligible') || query.includes('mortgage')
  ) {
    let amount = 3500000; // default 35 Lakhs
    const lakhMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|lakhs|l)/i);
    const croreMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:crore|cr)/i);
    const rawNumberMatch = query.match(/(\d{6,8})/);

    if (croreMatch) {
      amount = parseFloat(croreMatch[1]) * 10000000;
    } else if (lakhMatch) {
      amount = parseFloat(lakhMatch[1]) * 100000;
    } else if (rawNumberMatch) {
      amount = parseInt(rawNumberMatch[1], 10);
    }

    const ratePerYear = 8.5; // 8.5% interest rate p.a.
    const tenureYears = 20; // 20 years
    const monthlyRate = ratePerYear / (12 * 100);
    const totalMonths = tenureYears * 12;

    const emi = Math.round(
      (amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
    );
    const totalPayment = emi * totalMonths;
    const totalInterest = totalPayment - amount;

    const formattedAmount = (amount / 100000).toLocaleString('en-IN') + ' Lakhs';
    const formattedEmi = emi.toLocaleString('en-IN');
    const formattedInterest = Math.round(totalInterest / 100000).toLocaleString('en-IN') + ' Lakhs';

    return {
      message: `📊 **Home Loan Eligibility & EMI Estimate**

Here is the loan calculation for **₹${formattedAmount}**:

- **Loan Amount**: ₹${amount.toLocaleString('en-IN')}
- **Interest Rate**: 8.5% p.a. (Estimated)
- **Tenure**: ${tenureYears} Years (${totalMonths} Months)
- **Monthly EMI**: **₹${formattedEmi} / month**
- **Total Interest Payable**: ₹${formattedInterest}

💡 **Bank Assistance**:
- Up to **90% bank funding** available for DTCP & RERA approved plots and villas.
- Partnered with SBI, HDFC, ICICI, and Axis Bank with quick approval.

[Open Full Interactive EMI Calculator →](#emi-calculator)`,
      properties: [],
      type: 'text',
      intent: 'emi_calc'
    };
  }

  // ─── 8. CAREERS & JOBS ───────────────────────────────────────────────────────
  if (query.includes('career') || query.includes('job') || query.includes('hiring') || query.includes('vacancy') || query.includes('work with us')) {
    return {
      message: `💼 **Careers at Raarya Groups**

We are hiring talented professionals across Coimbatore:
1. **Real Estate Sales Executive** (DTCP layout plots & villa sales)
2. **Digital Marketing & Lead Specialist**
3. **Property Verification & Legal Assistant**

📧 Send your resume to **raaryagroupsinfo@gmail.com** or call **+91 90872 40400** to apply!`,
      properties: [],
      type: 'text',
      intent: 'careers'
    };
  }

  // ─── 9. CONTACT & SUPPORT ────────────────────────────────────────────────────
  if (query.includes('contact') || query.includes('phone') || query.includes('number') || query.includes('call') || query.includes('address') || query.includes('office')) {
    return {
      message: `📞 **Contact Raarya Properties Support**

- **Representative**: Mr. Rajkumar
- **Direct Phone**: **+91 90872 40400** (Mon - Sat, 9:00 AM - 7:00 PM)
- **Official Email**: **raaryagroupsinfo@gmail.com**
- **Head Office**: 2D, A-Block, Ram Apartment, Avinashi Road, Lakshmi Mills Junction, Coimbatore - 641037.

💬 [Chat on WhatsApp](https://wa.me/919087240400) or [Submit an Enquiry Form](#contact)`,
      properties: [],
      type: 'text',
      intent: 'contact'
    };
  }

  // ─── 10. PROPERTY SEARCH & INVENTORY MATCHING (English, Tamil, Tanglish) ────
  const wantsApartment = Boolean(/app+art?m[ea]nt?s?|flats?|flts?|அபார்ட்மெண்ட்/i.test(query));
  const wantsPlot = Boolean(/pl[oa]+ts?|lands?|cents?|layouts?|sites?|edam|manai|nilam|பிளாட்|மனை|நிலம்|இடம்/i.test(query));
  const wantsVilla = Boolean(/vil+as?|villah?s?|bungalows?|வில்லா/i.test(query));
  const wantsHouse = Boolean(/hous?e?s?|homes?|veedu|individual\s*house|independent\s*house|வீடு/i.test(query) && !query.includes('home loan'));
  const wantsCommercial = Boolean(/com+er+cial|office|shops?|showrooms?|buildings?|கடைகள்/i.test(query));
  const wantsPg = Boolean(/\bpg\b|hostels?|paying\s*guest/i.test(query));
  const wantsGeneral = Boolean(/propert(?:y|ies|ys|is)|real\s*estate|listings?|spaces?|சொத்துக்கள்/i.test(query));
  const hasActionVerb = Boolean(/list|show|find|search|give|tell|get|display|view|check|see|any|looking|want|need|kaatunga|sollunga|venum|irukka|paakkanum|காட்டு|சொல்லு/i.test(query));
  const fuzzyLoc = matchLocationFuzzy(query);
  const mentionsCoimbatore = Boolean(query.includes('coimbatore') || query.includes('cbe') || query.includes('kovai') || query.includes('கோவை') || query.includes('கோயம்புத்தூர்'));

  const isExplicitPropertySearch = Boolean(
    wantsApartment || wantsPlot || wantsVilla || wantsHouse || wantsCommercial || wantsPg ||
    (wantsGeneral && (hasActionVerb || fuzzyLoc || mentionsCoimbatore)) ||
    ((fuzzyLoc || mentionsCoimbatore) && (hasActionVerb || query.includes('in') || query.includes('at') || query.includes('near') || query.includes('la') || wantsGeneral))
  );

  if (isExplicitPropertySearch) {
    let filtered = [...PROPERTIES];

    // 1. Strict Location Filter (if specific locality is requested)
    if (fuzzyLoc && fuzzyLoc.toLowerCase() !== 'coimbatore') {
      filtered = filtered.filter((p: any) => {
        const text = `${p.location || ''} ${p.title || ''} ${p.description || ''}`.toLowerCase();
        return isFuzzyMatch(text, fuzzyLoc) || isFuzzyMatch(p.location, fuzzyLoc);
      });
    }

    // 2. Property SubType Filter
    if (wantsPlot) {
      const plotFiltered = filtered.filter((p: any) => {
        const sub = (p.subType || '').toLowerCase();
        const title = (p.title || '').toLowerCase();
        return sub.includes('plot') || sub.includes('land') || title.includes('plot') || title.includes('land') || title.includes('layout') || title.includes('cent');
      });
      if (plotFiltered.length > 0) {
        filtered = plotFiltered;
      }
    } else if (wantsVilla) {
      const villaFiltered = filtered.filter((p: any) => {
        const sub = (p.subType || '').toLowerCase();
        const title = (p.title || '').toLowerCase();
        return sub.includes('villa') || title.includes('villa');
      });
      if (villaFiltered.length > 0) {
        filtered = villaFiltered;
      }
    } else if (wantsApartment) {
      const aptFiltered = filtered.filter((p: any) => {
        const sub = (p.subType || '').toLowerCase();
        const title = (p.title || '').toLowerCase();
        return sub.includes('apartment') || sub.includes('flat') || title.includes('apartment') || title.includes('flat');
      });
      if (aptFiltered.length > 0) {
        filtered = aptFiltered;
      }
    } else if (wantsHouse) {
      const houseFiltered = filtered.filter((p: any) => {
        const sub = (p.subType || '').toLowerCase();
        const title = (p.title || '').toLowerCase();
        return sub.includes('house') || sub.includes('villa') || title.includes('house') || title.includes('villa');
      });
      if (houseFiltered.length > 0) {
        filtered = houseFiltered;
      }
    } else if (wantsCommercial) {
      const commFiltered = filtered.filter((p: any) => {
        const sub = (p.subType || '').toLowerCase();
        const title = (p.title || '').toLowerCase();
        return sub.includes('commercial') || sub.includes('office') || sub.includes('shop') || title.includes('commercial');
      });
      if (commFiltered.length > 0) {
        filtered = commFiltered;
      }
    }

    // 3. Transaction Type Filter
    if (query.includes('rent') || query.includes('lease') || query.includes('vaadagai') || query.includes('வாடகை')) {
      filtered = filtered.filter((p: any) => p.type === 'rent');
    } else if (query.includes('pg') || query.includes('hostel')) {
      filtered = filtered.filter((p: any) => p.type === 'pg-hostel');
    } else if (query.includes('buy') || query.includes('sale') || query.includes('purchase') || query.includes('vaanga') || query.includes('விற்பனை')) {
      filtered = filtered.filter((p: any) => p.type === 'buy');
    }

    // 4. BHK Filter
    const bhkMatch = query.match(/(\d+)\s*(?:bhk|bedroom|bed)\b/i);
    if (bhkMatch) {
      const bhkNum = parseInt(bhkMatch[1], 10);
      filtered = filtered.filter((p: any) => p.beds === bhkNum);
    }

    if (filtered.length > 0) {
      const totalCount = filtered.length;
      const displayedProps = filtered.slice(0, 8);
      const locName = fuzzyLoc ? fuzzyLoc.charAt(0).toUpperCase() + fuzzyLoc.slice(1) : 'Coimbatore';
      const searchParam = fuzzyLoc ? `?search=${encodeURIComponent(fuzzyLoc)}` : '';
      const navTab = query.includes('pg') || query.includes('hostel') ? 'pg-hostel' : query.includes('rent') ? 'rent' : 'buy';
      const sectionName = navTab === 'pg-hostel' ? 'PG & Hostel' : navTab === 'rent' ? 'Rent' : 'Buy';

      const propListFormatted = displayedProps
        .map(
          (p: any, i: number) =>
            `${i + 1}. **${p.title}**\n   - **Price**: ${p.price} | **Type**: ${p.type === 'buy' ? 'For Sale' : p.type === 'rent' ? 'For Rent' : 'PG / Hostel'}\n   - **Location**: ${p.location}\n   - **Extent**: ${p.areaDisplay || (p.area ? `${p.area} sq.ft` : 'Verified Extent')}`
        )
        .join('\n\n');

      let leadIntro = `Here are verified properties matching your request in **${locName}**:`;
      let cardPrompt = `Review the interactive property cards below to explore photos, floor plans, and book a free site visit.`;
      let viewAllMsg = totalCount > 8
        ? `\n\n🔍 **I found ${totalCount} matching verified properties in ${locName}.** [View all ${totalCount} matching properties in our ${sectionName} section →](#${navTab}${searchParam})`
        : `\n\n🔍 **I found ${totalCount} matching verified properties in ${locName}.** [View all ${totalCount} matching properties in our ${sectionName} section →](#${navTab}${searchParam})`;

      if (isTamilScript) {
        leadIntro = `நீங்கள் கேட்ட **${locName}** பகுதியில் உள்ள சரிபார்க்கப்பட்ட சிறந்த சொத்துக்கள் இதோ:`;
        cardPrompt = `புகைப்படங்கள், அளவுகள் மற்றும் இலவச நேரடி பார்வையிடல் (Site Visit) திட்டமிட கீழே உள்ள கார்டுகளை பார்க்கவும்.`;
        viewAllMsg = `\n\n🔍 **மொத்தம் ${totalCount} சரிபார்க்கப்பட்ட சொத்துக்கள் உள்ளன.** [அனைத்தையும் பார்க்க இங்கே கிளிக் செய்யவும் →](#${navTab}${searchParam})`;
      } else if (isTanglish) {
        leadIntro = `Neenga keta **${locName}** area-la irukkira top verified properties list idho:`;
        cardPrompt = `Photos, measurements & free site visit book panna kizhaye irukkira interactive cards-ah paarunga.`;
        viewAllMsg = `\n\n🔍 **Total-ah ${totalCount} verified properties irukku.** [Ella listings-um paarkka inga click pannunga →](#${navTab}${searchParam})`;
      }

      return {
        message: `${leadIntro}\n\n${propListFormatted}\n\n${cardPrompt}${viewAllMsg}`,
        properties: displayedProps,
        type: 'property_results',
        intent: 'NEW_PROPERTY_SEARCH'
      };
    } else {
      const locName = fuzzyLoc ? fuzzyLoc.charAt(0).toUpperCase() + fuzzyLoc.slice(1) : (isTamilScript ? 'உங்கள் பகுதி' : 'your requested area');
      if (isTamilScript) {
        return {
          message: `📍 **தற்போது ${locName} பகுதியில் நேரடி பதிவுகள் இல்லை.**\n\nநாங்கள் கோயம்புத்தூரின் முன்னணி பகுதிகளான **சரவணம்பட்டி, அன்னூர், சிங்காநல்லூர், கருமத்தம்பட்டி, மேட்டுப்பாளையம் சாலை மற்றும் அவினாசி சாலையில்** உள்ள பிரீமியம் மனைகளை வழங்குகிறோம்.\n\n📞 சிறப்பு தேவைகளுக்கு எங்களை நேரடியாக தொடர்பு கொள்ளவும்: **+91 90872 40400** அல்லது [விசாரணை படிவத்தை சமர்ப்பிக்கவும்](#contact).`,
          properties: [],
          type: 'text',
          intent: 'property_search_empty'
        };
      } else if (isTanglish) {
        return {
          message: `📍 **Ipo ${locName}-la direct listings edhum match aagala bro.**\n\nNaanga Coimbatore-la high growth corridors aana **Saravanampatti, Annur, Singanallur, Karumathampatti & Mettupalayam Road**-la top DTCP verified plots offer pandrom.\n\n📞 Ungalukku customized plots venum na contact: **+91 90872 40400** or [Send Enquiry](#contact).`,
          properties: [],
          type: 'text',
          intent: 'property_search_empty'
        };
      } else {
        return {
          message: `📍 **No matching listings found in ${locName} right now.**\n\nWe currently do not have active inventory in **${locName}** matching that exact criteria. We specialize in high-growth Coimbatore corridors such as **Saravanampatti, Annur, Ganapathy, Singanallur, and Mettupalayam Road**.\n\n📞 Looking for customized property options? Call our team at **+91 90872 40400** or [Send an Enquiry](#contact).`,
          properties: [],
          type: 'text',
          intent: 'property_search_empty'
        };
      }
    }
  }

  // ─── 11. GENERAL CONVERSATION FALLBACK (COMMUNICATIVE & SMART LIKE CHATGPT) ──
  return {
    message: `I hear you! As your **Raarya AI Assistant**, I'm here to help you navigate real estate in Coimbatore, answer questions, or chat freely.\n\nFeel free to ask me:\n- *"Show plots in Saravanampatti"*\n- *"What is the difference between DTCP and RERA?"*\n- *"Calculate home loan EMI for 35 lakhs"*\n- *"How to list my property on Raarya?"*\n\nWhat can I solve or explore for you today? 😊`,
    properties: [],
    type: 'text',
    intent: 'general_conversation'
  };
}

export function generateAiResponse(userQuery: string): string {
  return generateAiResponseObject(userQuery).message;
}
