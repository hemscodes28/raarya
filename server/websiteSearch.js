import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class WebsiteSearchService {
  constructor() {
    this.knowledgeBase = [];
    this.loadKnowledgeBase();
  }

  loadKnowledgeBase() {
    // 1. Static Company & Website Information Pages
    const staticPages = [
      {
        id: 'about-company',
        title: 'About Raarya Properties & Raarya Groups',
        category: 'Company Info',
        content: `Raarya Properties (Raarya Groups) is a leading real estate firm based in Coimbatore, Tamil Nadu, India. 
We specialize in verified DTCP & RERA approved layout plots, luxury villas, residential land, independent houses, and student PG/hostels.
Our approach pairs local market intelligence with transparent digital walk-throughs and clear legal title verification.
Office Address: 2D, A-Block, Ram Apartment, Avinashi Road, Lakshmi Mills Junction, Coimbatore - 641037, Tamil Nadu, India.
Working Hours: Monday to Saturday, 9:00 AM to 7:00 PM.
Representative: Mr. Rajkumar. Contact: +91 90872 40400. Email: raaryagroupsinfo@gmail.com.`
      },
      {
        id: 'services',
        title: 'Services Provided by Raarya',
        category: 'Services',
        content: `Raarya Properties offers complete real estate services:
1. Plot & Villa Sales: High appreciation DTCP/RERA approved plots in key growth corridors like Saravanampatti, Annur, Thekkalur, Karumathampatti, Kinathukadavu.
2. Property Listing & Seller Marketing: Post your land, house, or villa listing for free and reach thousands of buyers within 2 hours.
3. Home Loan Assistance: Up to 90% bank funding with partnered banks (HDFC Bank, SBI, ICICI Bank, Axis Bank) starting from 8.5% interest rate.
4. Site Visits: Free assisted site visits with clear title paperwork inspection.`
      },
      {
        id: 'home-loans',
        title: 'Home Loan Eligibility & EMI Calculator',
        category: 'Financial Services',
        content: `Raarya partnered banks offer attractive home loan packages:
- Interest rate: Starting at 8.5% per annum.
- Loan Tenure: Up to 30 years.
- Funding: Up to 90% bank funding for DTCP/RERA layout plots & villas.
- Partnered Banks: HDFC Bank, SBI, ICICI, Axis Bank.
- Eligibility: Salaried and self-employed individuals aged 21 to 65.
Calculate monthly EMI directly on our #emi-calculator page or check loan eligibility on #eligibility-check.`
      },
      {
        id: 'careers',
        title: 'Careers & Job Openings at Raarya Groups',
        category: 'Careers',
        content: `Raarya Groups is actively hiring across Western Tamil Nadu & Coimbatore:
1. Senior Real Estate Advisor / Executive: Plot & villa sales.
2. Site Marketing Specialist: Customer site visits and lead generation.
3. Property Verification Executive: Legal documentation and DTCP approvals.
Compensation: Competitive base salary plus high industry sales incentives.
Apply by emailing your resume to raaryagroupsinfo@gmail.com or calling HR at +91 90872 40400.`
      },
      {
        id: 'post-property',
        title: 'Post Property / List Property Module',
        category: 'Website Feature',
        content: `Post Property is the website feature on Raarya that allows property owners, sellers, and landlords to list their land, house, villa, or commercial space for sale or rent.
To post a property on Raarya:
1. Click the 'Post Property' button or log in to your account.
2. Verify your mobile number with OTP.
3. Fill in your property details (location, price, area/extent, photos, and DTCP/RERA approval status).
4. Submit the listing. The Raarya verification team reviews legal paperwork and publishes your listing live within 2 hours!`
      },
      {
        id: 'buy-module',
        title: 'Buy Properties Module',
        category: 'Website Feature',
        content: `The Buy section on Raarya allows home buyers and investors to explore verified layout plots, luxury villas, independent houses, and commercial land for sale across Coimbatore and Western Tamil Nadu. All listings include interactive property cards, location maps, extent in sq.ft/cents, and agent contact details for booking free site visits.`
      },
      {
        id: 'rent-module',
        title: 'Rent Properties Module',
        category: 'Website Feature',
        content: `The Rent section on Raarya displays verified residential houses, 2 BHK/3 BHK apartments, and commercial buildings available for monthly rent or lease in Coimbatore.`
      },
      {
        id: 'pg-hostel-module',
        title: 'PG & Hostel Module',
        category: 'Website Feature',
        content: `The PG / Hostel section on Raarya helps students and working professionals find verified Paying Guest accommodations and student hostels near IT parks (TIDEL Park, Saravanampatti) and major colleges in Coimbatore.`
      },
      {
        id: 'contact-us',
        title: 'Contact Information & Customer Support',
        category: 'Contact',
        content: `Contact Raarya Customer Support:
Phone: +91 90872 40400
WhatsApp: +91 90872 40400
Email: raaryagroupsinfo@gmail.com
Address: 2D, A-Block, Ram Apartment, Avinashi Road, Lakshmi Mills Junction, Coimbatore - 641037, Tamil Nadu, India.
Working Hours: Monday to Saturday, 9:00 AM to 7:00 PM.`
      }
    ];

    // 2. Load Blog Articles from blogs_data.json
    let blogArticles = [];
    try {
      const blogsPath = path.join(__dirname, '..', 'src', 'data', 'blogs_data.json');
      if (fs.existsSync(blogsPath)) {
        const raw = fs.readFileSync(blogsPath, 'utf8');
        const blogs = JSON.parse(raw || '[]');
        blogArticles = blogs.map(b => ({
          id: b.id || b.slug,
          title: b.title,
          category: `Blog - ${b.category || 'Real Estate'}`,
          content: `${b.title}. ${b.excerpt || ''}. ${(b.contentBlocks || []).map(cb => cb.text).join(' ')}`
        }));
      }
    } catch (err) {
      console.error('[WebsiteSearch] Error loading blogs_data.json:', err);
    }

    this.knowledgeBase = [...staticPages, ...blogArticles];
    console.log(`[WebsiteSearch] Loaded ${this.knowledgeBase.length} website knowledge documents.`);
  }

  search(query, limit = 3) {
    if (!query) return [];
    const cleanQuery = String(query).toLowerCase().trim();
    const words = cleanQuery.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);

    const scored = this.knowledgeBase.map(doc => {
      let score = 0;
      const titleLower = doc.title.toLowerCase();
      const contentLower = doc.content.toLowerCase();

      words.forEach(word => {
        if (titleLower.includes(word)) score += 10;
        if (contentLower.includes(word)) score += 3;
      });

      // Special domain matches
      if ((cleanQuery.includes('post') || cleanQuery.includes('list')) && doc.id === 'post-property') score += 30;
      if (cleanQuery.includes('service') && doc.id === 'services') score += 20;
      if (cleanQuery.includes('about') && doc.id === 'about-company') score += 20;
      if ((cleanQuery.includes('contact') || cleanQuery.includes('phone') || cleanQuery.includes('email') || cleanQuery.includes('call')) && doc.id === 'contact-us') score += 25;
      if ((cleanQuery.includes('career') || cleanQuery.includes('job') || cleanQuery.includes('hiring')) && doc.id === 'careers') score += 25;
      if ((cleanQuery.includes('loan') || cleanQuery.includes('emi') || cleanQuery.includes('interest')) && doc.id === 'home-loans') score += 25;
      if (cleanQuery.includes('buy') && doc.id === 'buy-module') score += 25;
      if (cleanQuery.includes('rent') && doc.id === 'rent-module') score += 25;
      if (cleanQuery.includes('hostel') || cleanQuery.includes('pg') && doc.id === 'pg-hostel-module') score += 25;

      return { doc, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored
      .filter(item => item.score > 0)
      .slice(0, limit)
      .map(item => item.doc);
  }
}

export const websiteSearchService = new WebsiteSearchService();
