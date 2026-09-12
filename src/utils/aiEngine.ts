import { PROPERTIES } from '../constants';

export function generateAiResponse(userQuery: string): string {
  const query = userQuery.toLowerCase().trim();

  // 0. Greetings & Welcome
  if (/^(hi+|hello|hey|namaste|good\s*(morning|afternoon|evening)|greetings|howdy)[\s!.]*$/i.test(query)) {
    return `👋 **Hello! Welcome to Raarya Properties!**

I am your AI Property Assistant. How can I assist you with your real estate search today?

Here are a few quick things you can ask me:
- 🏡 **Find Plots & Villas**: Ask for *"Properties in Singanallur"* or *"Plots in Saravanampatti"*
- 📊 **Calculate Home Loans**: Ask *"Calculate EMI for 35 Lakhs"*
- 🏡 **Post Your Listing**: Ask *"How to list my property"*
- 📞 **Contact Us**: Ask for contact numbers or office location`;
  }

  // 0.5. About Company & Raarya Properties (Flexible Semantic & Pattern Matching)
  const isCompanyQuery = Boolean(
    ((query.includes('raar') || query.includes('rarya') || query.includes('raarya') || query.includes('company') || query.includes('business') || query.includes('organization') || query.includes('firm') || query.includes('platform') || query.includes('agency')) &&
     (query.includes('about') || query.includes('know') || query.includes('tell') || query.includes('info') || query.includes('detail') || query.includes('service') || query.includes('what is') || query.includes('who is') || query.includes('what does') || query.includes('what do') || query.includes('explain') || query.includes('describe') || query.includes('overview') || query.includes('summary') || query.includes('background') || query.includes('history') || query.includes('kind') || query.includes('type') || query.includes('nature') || query.includes('profile') || query.includes('mission') || query.includes('vision')) &&
     !(query.includes('bhk') || query.includes('bedroom') || query.includes('lakh') || query.includes('lac') || query.includes('crore') || query.includes('under') || query.includes('below') || query.includes('cheap') || query.includes('villa') || query.includes('apartment') || query.includes('plot') || query.includes('land') || query.includes('house'))) ||
    query.includes('about us') ||
    query.includes('about company') ||
    query.includes('about the company') ||
    query.includes('about this company') ||
    query.includes('about raarya') ||
    query.includes('know about') ||
    query.includes('tell about') ||
    query.includes('info about') ||
    query.includes('information about') ||
    query.includes('details of company') ||
    query.includes('details about') ||
    query.includes('what is raarya') ||
    query.includes('who is raarya') ||
    query.includes('what does raarya') ||
    query.includes('what do you do') ||
    query.includes('what is this company') ||
    query.includes('what kind of company') ||
    query.includes('what type of company') ||
    query.includes('company info') ||
    query.includes('company details') ||
    query.includes('company profile') ||
    query.includes('company overview')
  );

  if (isCompanyQuery) {
    return `### 🏠 About Raarya Properties

Raarya Properties is a premier real estate platform based in Coimbatore, Tamil Nadu. We specialize in verified DTCP & RERA approved layout plots, luxury villas, independent houses, commercial land, and student PG/hostels.

**Services Offered by Raarya:**
- **Plot & Villa Sales**: High appreciation DTCP & RERA approved layout plots and luxury villas across key Coimbatore corridors.
- **Free Property Listing**: List your land, house, or commercial space for free to reach thousands of active buyers.
- **Home Loan Assistance**: Up to 90% bank funding with partner banks (HDFC, SBI, ICICI, Axis Bank) starting from 8.5% interest rate.
- **Interactive Tools**: Online EMI Calculator and Home Loan Eligibility Checker.
- **Assisted Site Visits**: Free accompanied site visits with complete legal title inspection.

📍 **Head Office Address**: 2D, A-Block, Ram Apartment, Avinashi Road, Lakshmi Mills Junction, Coimbatore - 641037, Tamil Nadu, India.
📞 **Phone**: **+91 90872 40400**
✉️ **Email**: **raaryagroupsinfo@gmail.com**
⏰ **Working Hours**: Monday to Saturday, 9:00 AM to 7:00 PM.`;
  }

  // 1. EMI Calculation & Loan / Eligibility Query
  if (
    query.includes('emi') ||
    query.includes('loan') ||
    query.includes('interest') ||
    query.includes('calculate') ||
    query.includes('finance') ||
    query.includes('eligibility') ||
    query.includes('eligible') ||
    query.includes('bank') ||
    query.includes('mortgage')
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

    return `📊 **Home Loan Eligibility & EMI Calculator**

Here is the estimated loan calculation for **₹${formattedAmount}**:

- **Loan Amount**: ₹${amount.toLocaleString('en-IN')}
- **Interest Rate**: 8.5% p.a. (Estimated)
- **Loan Tenure**: ${tenureYears} Years (${totalMonths} Months)
- **Monthly EMI**: **₹${formattedEmi} / month**
- **Total Interest Payable**: ₹${formattedInterest}

💡 **Eligibility Criteria**:
- Salaried & Self-Employed individuals (Age 21-65)
- Up to **90% bank funding** available for DTCP & RERA approved plots/villas
- Partnered with HDFC Bank, SBI, ICICI, and Axis Bank.

📞 **Need direct loan eligibility verification?** Call our financial manager at **+91 90872 40400** or [Send an Enquiry](#contact).`;
  }

  // 2. Careers & Job Opportunities
  if (
    query.includes('career') ||
    query.includes('job') ||
    query.includes('hiring') ||
    query.includes('vacancy') ||
    query.includes('work') ||
    query.includes('join')
  ) {
    return `💼 **Careers & Job Openings at Raarya Groups**

Raarya Groups is expanding across Coimbatore & Western Tamil Nadu! We are hiring for:

1. **Senior Real Estate Advisor / Executive** (Plot & residential sales)
2. **Site Marketing Specialist** (Lead generation & customer site visits)
3. **Property Verification Executive** (DTCP & legal paperwork)

**Benefits & Work Culture:**
- Competitive salary + highest industry sales incentives
- Career growth & professional training

📧 **How to Apply**: Email your resume/CV to **raaryagroupsinfo@gmail.com** or call HR directly at **+91 90872 40400**.`;
  }

  // 3. Direct Contact & Customer Support
  if (
    query.includes('contact') ||
    query.includes('phone') ||
    query.includes('number') ||
    query.includes('call') ||
    query.includes('office') ||
    query.includes('address') ||
    query.includes('agent') ||
    query.includes('rajkumar')
  ) {
    return `📞 **Contact Raarya Groups & Customer Service**

You can reach our official team directly:

- **Representative**: Mr. Rajkumar
- **Direct Phone**: **+91 90872 40400**
- **Official Email**: **raaryagroupsinfo@gmail.com**
- **Office Location**: 2D, A-Block, Ram Apartment, Avinashi Road, Lakshmi Mills Junction, Coimbatore - 641037, Tamil Nadu, India
- **Working Hours**: Monday to Saturday, 9:00 AM to 7:00 PM

💬 **Instant Assistance**: [Chat on WhatsApp](https://wa.me/919087240400) or [Submit an Enquiry Form](#contact).`;
  }

  // 4. Listing a Property / Adding Property
  if (
    query.includes('how to list') ||
    query.includes('post my property') ||
    query.includes('add my property') ||
    query.includes('sell my property') ||
    query.includes('register my property') ||
    query.includes('list my property')
  ) {
    return `🏡 **How to List Your Property on Raarya**

Want to sell or rent your plot, house, villa, or commercial property?

1. **Log In**: Create or sign in to your Raarya account.
2. **Open Dashboard**: Go to your User Profile and click **Add New Property**.
3. **Enter Details**: Provide location, area extent, pricing, and photos.
4. **Verification**: Our team will verify legal approvals (DTCP/RERA) and make your listing live within 2 hours!

Need help listing? Call **+91 90872 40400** to speak with our listing manager.`;
  }

  // 5. Property Search & Recommendations by Location, Type, or Keyword
  const knownLocations = [
    'singanallur', 'sulur', 'ondipudur', 'peelamedu', 'gandhipuram', 'vadamadurai',
    'thudiyalur', 'hopes', 'ramanathapuram', 'saibaba colony', 'ganapathy', 'saravanampatti',
    'annur', 'kinathukadavu', 'karumathampatti', 'sirumugai', 'thekkalur', 'coimbatore',
    'avinashi', 'kaniyur', 'kovaipudur', 'kurumbapalayam', 'kittampalayam'
  ];

  const matchedLocations = knownLocations.filter(loc => query.includes(loc));

  const cleanWords = query
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['the', 'and', 'for', 'are', 'you', 'with', 'in', 'property', 'properties', 'plots', 'plot', 'show', 'give', 'need', 'want', 'about', 'company', 'raarya', 'tell', 'what', 'does', 'who', 'services', 'provide'].includes(w));

  let matchedProps = PROPERTIES.filter((p) => {
    const text = `${p.title} ${p.location} ${p.type} ${p.subType || ''} ${p.description || ''} ${JSON.stringify(
      p.overviewDetails || {}
    )}`.toLowerCase();

    // Check keyword matches in text
    const hasWordMatch = cleanWords.some(kw => text.includes(kw));

    if (matchedLocations.length > 0) {
      const specificLocations = matchedLocations.filter(l => l !== 'coimbatore');
      const targetLocs = specificLocations.length > 0 ? specificLocations : matchedLocations;
      const locationMatches = targetLocs.some(loc => text.includes(loc));
      return locationMatches || hasWordMatch;
    }

    if (query.includes('buy') && p.type === 'buy') return true;
    if (query.includes('rent') && p.type === 'rent') return true;
    if ((query.includes('pg') || query.includes('hostel')) && p.type === 'pg-hostel') return true;

    return hasWordMatch;
  });

  // Sort by relevance (number of matching words)
  matchedProps.sort((a, b) => {
    const textA = `${a.title} ${a.location} ${a.description}`.toLowerCase();
    const textB = `${b.title} ${b.location} ${b.description}`.toLowerCase();
    const countA = cleanWords.filter(w => textA.includes(w)).length;
    const countB = cleanWords.filter(w => textB.includes(w)).length;
    return countB - countA;
  });

  if (matchedProps.length === 0) {
    if (matchedLocations.length > 0) {
      const locName = matchedLocations[0].charAt(0).toUpperCase() + matchedLocations[0].slice(1);
      return `📍 **No verified properties found in ${locName} right now.**

We currently do not have active property listings in **${locName}** in our database. We specialize in high-growth corridors across Coimbatore (including Saravanampatti, Annur, Kittampalayam, Singanallur, Karumathampatti, Mettupalayam, and Avinashi Road).

📞 **Looking for off-market options in ${locName}?** Contact our customer support team at **+91 90872 40400** or [Send an Enquiry](#contact).`;
    }
    return `📍 **No verified properties found matching your requested area or criteria.**

We currently do not have property listings matching your request in our active portfolio. We specialize in high-growth corridors across Coimbatore (including Saravanampatti, Annur, Kittampalayam, Singanallur, Karumathampatti, Mettupalayam, and Avinashi Road).

📞 **Looking for custom property sourcing?** Contact our support team at **+91 90872 40400** or [Send an Enquiry](#contact).`;
  }

  matchedProps = matchedProps.slice(0, 12);

  const propListFormatted = matchedProps
    .map(
      (p, i) =>
        `${i + 1}. **${p.title}**
   - **Price**: ${p.price} | **Type**: ${p.type === 'buy' ? 'For Sale' : p.type === 'rent' ? 'For Rent' : 'PG / Hostel'}
   - **Location**: ${p.location}
   - **Extent**: ${p.areaDisplay || (p.area ? `${p.area} sq.ft` : 'Verified Extent')}
   - [Click to View Details](#buy)`
    )
    .join('\n\n');

  return `🔍 **Verified Properties Matching Your Query**

Here are curated property listings from **Raarya Properties**:

${propListFormatted}

✅ **All Raarya layout plots are 100% DTCP & RERA approved with clear legal titles.**

📞 **Book a Free Site Visit**: Call **+91 90872 40400** or [Send an Enquiry](#contact).`;
}
