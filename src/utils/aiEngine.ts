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
  const cleanQ = query.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

  // ─── 1. GREETINGS & INTRODUCTIONS ─────────────────────────────────────────────
  const isGreeting = (
    /^(hi+|hello+|helo+|hey+|namaste|good\s*(morning|afternoon|evening|day)|greetings|howdy|vanakkam)[\s\w]*$/i.test(query) ||
    cleanQ.startsWith('hi ') || cleanQ.startsWith('hello ') || cleanQ.startsWith('hey ') ||
    cleanQ === 'hi' || cleanQ === 'hello' || cleanQ === 'hey' || cleanQ === 'namaste' || cleanQ === 'vanakkam'
  );

  if (isGreeting && !query.includes('plot') && !query.includes('villa') && !query.includes('flat') && !query.includes('property') && !query.includes('emi') && !query.includes('rent')) {
    return {
      message: `👋 **Hello! Welcome to Raarya AI!** 😊\n\nI'm your intelligent conversational assistant for **Raarya Properties & Real Estate** in Coimbatore. How are you doing today?\n\n**Here are a few things I can assist you with:**\n- 🏡 **Find Plots & Villas**: Ask for *"Show DTCP plots in Saravanampatti"* or *"Villas in Annur"*\n- 📊 **Calculate Home Loan EMI**: Ask *"Calculate EMI for 40 Lakhs"*\n- 📜 **Real Estate Advice**: Ask *"Difference between DTCP and RERA approval"*\n- 🏢 **List Your Property**: Ask *"How to list property on Raarya"*\n- 💬 Or simply chat with me about anything!\n\nHow can I help you right now?`,
      properties: [],
      type: 'text',
      intent: 'greetings'
    };
  }

  // ─── 2. CASUAL CHAT, WELLBEING & IDENTITY (ChatGPT-style) ───────────────────
  const isCasualChat = (
    cleanQ.includes('how are you') || cleanQ.includes('how r u') || cleanQ.includes('how are u') ||
    cleanQ.includes('how are you doing') || cleanQ.includes('how is it going') || cleanQ.includes('whats up') ||
    cleanQ.includes('hows your day') || cleanQ.includes('how is life') || cleanQ.includes('who are you') ||
    cleanQ.includes('what is your name') || cleanQ.includes('what can you do') || cleanQ.includes('who created you') ||
    cleanQ.includes('are you ai') || cleanQ.includes('are you a robot') || cleanQ.includes('can we chat') ||
    cleanQ.includes('tell me about yourself')
  );

  if (isCasualChat) {
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

  // ─── 3. JOKES & HUMOR ────────────────────────────────────────────────────────
  const isJoke = (
    cleanQ.includes('joke') || cleanQ.includes('funny') || cleanQ.includes('laugh') ||
    cleanQ.includes('make me smile') || cleanQ.includes('tell me something funny')
  );

  if (isJoke) {
    const jokes = [
      `Why did the house go to the doctor?\n\nBecause it had a terrible case of **window pane**! 🏠😄\n\nHope that brought a smile to your face! How can I assist your property search today?`,
      `Why are real estate agents great matchmakers?\n\nBecause they always know how to find the **perfect plot**! 🏡😉\n\nWhat kind of dream space are you looking to find today?`,
      `Why did the brick feel so proud?\n\nBecause it was part of a **solid foundation** at Raarya Properties! 🧱✨\n\nCan I help you discover plots or calculate loan EMIs today?`
    ];
    const pickedJoke = jokes[Math.floor(Math.random() * jokes.length)];
    return {
      message: pickedJoke,
      properties: [],
      type: 'text',
      intent: 'joke'
    };
  }

  // ─── 4. ACKNOWLEDGEMENTS & THANKS ────────────────────────────────────────────
  const isAck = (
    cleanQ === 'thanks' || cleanQ === 'thank you' || cleanQ === 'thanku' || cleanQ === 'ok' ||
    cleanQ === 'okay' || cleanQ === 'great' || cleanQ === 'awesome' || cleanQ === 'nice' ||
    cleanQ === 'cool' || cleanQ === 'good' || cleanQ === 'super' || cleanQ === 'got it' ||
    cleanQ === 'bye' || cleanQ === 'goodbye' || cleanQ === 'see you'
  );

  if (isAck) {
    return {
      message: `You're very welcome! 😊 Feel free to ask whenever you need help finding properties, calculating loan EMIs, or exploring prime layouts in Coimbatore. Have a fantastic day!`,
      properties: [],
      type: 'text',
      intent: 'acknowledgement'
    };
  }

  // ─── 5. REAL ESTATE LEGAL & ADVISORY KNOWLEDGE (DTCP / RERA / ADVICE) ────────
  if (
    (query.includes('dtcp') || query.includes('rera') || query.includes('guideline value') || query.includes('patta') || query.includes('chitta') || query.includes('document')) &&
    (query.includes('what is') || query.includes('difference') || query.includes('explain') || query.includes('why') || query.includes('how to verify') || query.includes('meaning') || !query.includes('show'))
  ) {
    return {
      message: `### 📜 Understanding DTCP vs RERA in Tamil Nadu

**1. What is DTCP Approval?**
- **DTCP** (*Directorate of Town and Country Planning*) approves land layouts, ensuring standard road widths (minimum 30ft/23ft), residential zoning, and Open Space Reservation (OSR) for parks and utilities.
- It guarantees that the land has legal permission to be developed and sold as individual plots.

**2. What is TNRERA Approval?**
- **RERA** (*Real Estate Regulatory Authority*) protects buyer rights, ensures timely project handover, and prevents fraudulent developer practices.
- Every layout or building project developed after 2017 with more than 8 plots or 500 sq. meters must have TNRERA registration.

**3. Why is this critical in Coimbatore?**
- ✅ **100% Bank Loan Approvals**: Leading national banks (SBI, HDFC, ICICI) only finance DTCP & RERA approved properties.
- ✅ **Clean Title & Safe Investment**: Avoids unapproved panchayat land issues or building permit rejections.
- ✅ **Higher Appreciation**: Verified DTCP layout plots in Saravanampatti, Annur, and Karumathampatti offer faster capital growth.

💡 *All layout plots on Raarya Properties are 100% verified with clear DTCP and RERA approvals.*

Would you like to explore available DTCP plots in Saravanampatti or Annur?`,
      properties: [],
      type: 'text',
      intent: 'advisory'
    };
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

  // ─── 10. PROPERTY SEARCH & INVENTORY MATCHING ────────────────────────────────
  const wantsApartment = Boolean(/app+art?m[ea]nt?s?|flats?|flts?/i.test(query));
  const wantsPlot = Boolean(/pl[oa]+ts?|lands?|cents?|layouts?|sites?/i.test(query));
  const wantsVilla = Boolean(/vil+as?|villah?s?|bungalows?/i.test(query));
  const wantsHouse = Boolean(/hous?e?s?|homes?|individual\s*house|independent\s*house/i.test(query) && !query.includes('home loan'));
  const wantsCommercial = Boolean(/com+er+cial|office|shops?|showrooms?|buildings?/i.test(query));
  const wantsPg = Boolean(/\bpg\b|hostels?|paying\s*guest/i.test(query));
  const wantsGeneral = Boolean(/propert(?:y|ies|ys|is)|real\s*estate|listings?|spaces?/i.test(query));
  const hasActionVerb = Boolean(/list|show|find|search|give|tell|get|display|view|check|see|any|looking|want|need/i.test(query));
  const fuzzyLoc = matchLocationFuzzy(query);
  const mentionsCoimbatore = Boolean(query.includes('coimbatore') || query.includes('cbe') || query.includes('kovai'));

  const isExplicitPropertySearch = Boolean(
    wantsApartment || wantsPlot || wantsVilla || wantsHouse || wantsCommercial || wantsPg ||
    (wantsGeneral && (hasActionVerb || fuzzyLoc || mentionsCoimbatore)) ||
    ((fuzzyLoc || mentionsCoimbatore) && (hasActionVerb || query.includes('in') || query.includes('at') || query.includes('near') || wantsGeneral))
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
    if (query.includes('rent') || query.includes('lease')) {
      filtered = filtered.filter((p: any) => p.type === 'rent');
    } else if (query.includes('pg') || query.includes('hostel')) {
      filtered = filtered.filter((p: any) => p.type === 'pg-hostel');
    } else if (query.includes('buy') || query.includes('sale') || query.includes('purchase')) {
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
      const locHeader = fuzzyLoc ? ` in **${fuzzyLoc.charAt(0).toUpperCase() + fuzzyLoc.slice(1)}**` : ' in Coimbatore';
      const searchParam = fuzzyLoc ? `?search=${encodeURIComponent(fuzzyLoc)}` : '';
      const navTab = query.includes('pg') || query.includes('hostel') ? 'pg-hostel' : query.includes('rent') ? 'rent' : 'buy';
      const sectionName = navTab === 'pg-hostel' ? 'PG & Hostel' : navTab === 'rent' ? 'Rent' : 'Buy';

      const propListFormatted = displayedProps
        .map(
          (p: any, i: number) =>
            `${i + 1}. **${p.title}**\n   - **Price**: ${p.price} | **Type**: ${p.type === 'buy' ? 'For Sale' : p.type === 'rent' ? 'For Rent' : 'PG / Hostel'}\n   - **Location**: ${p.location}\n   - **Extent**: ${p.areaDisplay || (p.area ? `${p.area} sq.ft` : 'Verified Extent')}`
        )
        .join('\n\n');

      const viewAllMsg = totalCount > 8
        ? `\n\n🔍 **I found ${totalCount} matching verified properties${locHeader}.** Here are 8 to get you started. [View all ${totalCount} matching properties in our ${sectionName} section →](#${navTab}${searchParam})`
        : `\n\n🔍 **I found ${totalCount} matching verified properties${locHeader}.** [View all ${totalCount} matching properties in our ${sectionName} section →](#${navTab}${searchParam})`;

      return {
        message: `Here are verified properties matching your request${locHeader}:\n\n${propListFormatted}\n\nReview the interactive property cards below to explore photos, floor plans, and book a free site visit.${viewAllMsg}`,
        properties: displayedProps,
        type: 'property_results',
        intent: 'NEW_PROPERTY_SEARCH'
      };
    } else {
      const locName = fuzzyLoc ? fuzzyLoc.charAt(0).toUpperCase() + fuzzyLoc.slice(1) : 'your requested location';
      return {
        message: `📍 **No matching listings found in ${locName} right now.**\n\nWe currently do not have active inventory in **${locName}** matching that exact criteria. We specialize in high-growth Coimbatore corridors such as **Saravanampatti, Annur, Ganapathy, Singanallur, and Mettupalayam Road**.\n\n📞 Looking for customized property options? Call our team at **+91 90872 40400** or [Send an Enquiry](#contact).`,
        properties: [],
        type: 'text',
        intent: 'property_search_empty'
      };
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
