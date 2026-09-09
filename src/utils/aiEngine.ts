import { PROPERTIES } from '../constants';

export function generateAiResponse(userQuery: string): string {
  const query = userQuery.toLowerCase().trim();

  // 1. EMI Calculation & Loan Query
  if (
    query.includes('emi') ||
    query.includes('loan') ||
    query.includes('interest rate') ||
    query.includes('calculate') ||
    query.includes('finance')
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

    return `📊 **Home Loan EMI Calculator & Financial Breakdown**

Here is the estimated loan calculation for **₹${formattedAmount}**:

- **Loan Amount**: ₹${amount.toLocaleString('en-IN')}
- **Interest Rate**: 8.5% p.a. (Estimated)
- **Loan Tenure**: ${tenureYears} Years (${totalMonths} Months)
- **Monthly EMI**: **₹${formattedEmi} / month**
- **Total Interest Payable**: ₹${formattedInterest}

💡 Our financial advisors at Raarya Groups can help you secure pre-approved bank loans from HDFC, SBI, and ICICI with minimum paperwork.

📞 **Need direct loan help?** Call our financial manager at **+91 9787255522** or [Send an Enquiry](#contact).`;
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

📧 **How to Apply**: Email your resume/CV to **raaryagroups@gmail.com** or call HR directly at **+91 9787255522**.`;
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
- **Direct Phone**: **+91 9787255522**
- **Alternate Phone**: **+91 9876543210**
- **Official Email**: **raaryagroups@gmail.com**
- **Office Location**: Saravanampatti Main Road, Annur Corridor, Coimbatore, Tamil Nadu

💬 **Instant Assistance**: [Chat on WhatsApp](https://api.whatsapp.com/send?phone=+919787255522&text=Hi%20Rajkumar,%20I%20have%20an%20enquiry%20regarding%20Raarya%20Properties) or [Submit an Enquiry Form](#contact).`;
  }

  // 4. Listing a Property / Adding Property
  if (
    query.includes('list') ||
    query.includes('sell') ||
    query.includes('add property') ||
    query.includes('post') ||
    query.includes('register property')
  ) {
    return `🏡 **How to List Your Property on Raarya**

Want to sell or rent your plot, house, villa, or commercial property?

1. **Log In**: Create or sign in to your Raarya account.
2. **Open Dashboard**: Go to your User Profile and click **Add New Property**.
3. **Enter Details**: Provide location, area extent, pricing, and photos.
4. **Verification**: Our team will verify legal approvals (DTCP/RERA) and make your listing live within 2 hours!

Need help listing? Call **+91 9787255522** to speak with our listing manager.`;
  }

  // 5. Property Search & Recommendations by Location, Type, or Keyword
  const searchKeywords = query
    .replace(/[^\w\s]/gi, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['the', 'and', 'for', 'are', 'you', 'with', 'in', 'property', 'properties', 'plots', 'plot'].includes(w));

  let matchedProps = PROPERTIES.filter((p) => {
    const text = `${p.title} ${p.location} ${p.type} ${p.subType || ''} ${p.description || ''} ${JSON.stringify(
      p.overviewDetails || {}
    )}`.toLowerCase();

    if (query.includes('saravanampatti') && text.includes('saravanampatti')) return true;
    if (query.includes('annur') && text.includes('annur')) return true;
    if (query.includes('kovaipudur') && text.includes('kovaipudur')) return true;
    if (query.includes('vadamadurai') && text.includes('vadamadurai')) return true;
    if (query.includes('thudiyalur') && text.includes('thudiyalur')) return true;
    if (query.includes('buy') && p.type === 'buy') return true;
    if (query.includes('rent') && p.type === 'rent') return true;
    if ((query.includes('pg') || query.includes('hostel')) && p.type === 'pg-hostel') return true;

    return searchKeywords.some((kw) => text.includes(kw));
  });

  if (matchedProps.length === 0) {
    matchedProps = PROPERTIES.slice(0, 4);
  } else {
    matchedProps = matchedProps.slice(0, 4);
  }

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

📞 **Book a Free Site Visit**: Call **+91 9787255522** or [Send an Enquiry](#contact).`;
}
