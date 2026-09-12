export class ConversationManager {
  constructor() {
    this.sessions = new Map();
  }

  getSession(sessionId) {
    if (!sessionId) sessionId = 'default';
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        sessionId,
        activeDomain: 'PROPERTY',
        propertyState: {
          city: null,
          locality: null,
          propertyType: null,
          bedrooms: null,
          bedroomsMode: 'exact',
          transactionType: null,
          minPrice: null,
          maxPrice: null,
          minArea: null,
          maxArea: null,
          amenities: [],
          sortBy: null,
          offset: 0,
          limit: 8
        },
        userMaxPrice: null,
        lastProperties: [],
        emiState: { loanAmount: null, interestRate: 8.5, tenureYears: 20 },
        eligibilityState: { monthlyIncome: null, existingEmi: 0, tenureYears: 20, interestRate: 8.5 },
        lastUpdated: Date.now()
      });
    }
    return this.sessions.get(sessionId);
  }

  getActiveDomain(sessionId) {
    return this.getSession(sessionId).activeDomain || 'PROPERTY';
  }

  setActiveDomain(sessionId, domain) {
    const session = this.getSession(sessionId);
    session.activeDomain = domain;
  }

  getPropertyState(sessionId) {
    return this.getSession(sessionId).propertyState;
  }

  clearPropertyState(sessionId) {
    const session = this.getSession(sessionId);
    session.propertyState = {
      city: null,
      locality: null,
      propertyType: null,
      bedrooms: null,
      bedroomsMode: 'exact',
      transactionType: null,
      minPrice: null,
      maxPrice: null,
      minArea: null,
      maxArea: null,
      amenities: [],
      sortBy: null,
      offset: 0,
      limit: 8
    };
    session.userMaxPrice = null;
    session.lastProperties = [];
  }

  updatePropertyState(sessionId, patch = {}, isNewSearch = false) {
    const session = this.getSession(sessionId);

    if (isNewSearch) {
      session.propertyState = {
        city: null,
        locality: null,
        propertyType: null,
        bedrooms: null,
        bedroomsMode: 'exact',
        transactionType: null,
        minPrice: null,
        maxPrice: null,
        minArea: null,
        maxArea: null,
        amenities: [],
        sortBy: null,
        offset: 0,
        limit: 8
      };
      session.userMaxPrice = null;
      session.lastProperties = [];
    }

    if (patch.maxPrice && patch.maxPrice > 0) {
      session.userMaxPrice = patch.maxPrice;
    }

    if (patch.locality && session.userMaxPrice && !patch.maxPrice) {
      session.propertyState.maxPrice = session.userMaxPrice;
    }

    // Merge non-null & non-undefined fields into propertyState
    Object.keys(patch).forEach(key => {
      const val = patch[key];
      if (val !== null && val !== undefined) {
        if (Array.isArray(val)) {
          const existing = session.propertyState[key] || [];
          session.propertyState[key] = Array.from(new Set([...existing, ...val]));
        } else {
          session.propertyState[key] = val;
        }
      }
    });

    session.lastUpdated = Date.now();
    return session.propertyState;
  }

  // Alias for backward compatibility
  updateFilters(sessionId, patch = {}, isNewSearch = false) {
    return this.updatePropertyState(sessionId, patch, isNewSearch);
  }

  updateEmiState(sessionId, newParams = {}) {
    const session = this.getSession(sessionId);
    if (!session.emiState) {
      session.emiState = { loanAmount: null, interestRate: 8.5, tenureYears: 20 };
    }
    if (newParams.loanAmount) session.emiState.loanAmount = newParams.loanAmount;
    if (newParams.interestRate) session.emiState.interestRate = newParams.interestRate;
    if (newParams.tenureYears) session.emiState.tenureYears = newParams.tenureYears;
    return session.emiState;
  }

  updateEligibilityState(sessionId, newParams = {}) {
    const session = this.getSession(sessionId);
    if (!session.eligibilityState) {
      session.eligibilityState = {
        monthlyIncome: null,
        annualIncome: null,
        requestedLoanAmount: null,
        existingEmi: 0,
        age: null,
        employmentType: null,
        creditScore: null,
        tenureYears: 20,
        interestRate: 8.5
      };
    }
    if (newParams.monthlyIncome) session.eligibilityState.monthlyIncome = newParams.monthlyIncome;
    if (newParams.annualIncome) session.eligibilityState.annualIncome = newParams.annualIncome;
    if (newParams.requestedLoanAmount) session.eligibilityState.requestedLoanAmount = newParams.requestedLoanAmount;
    if (newParams.existingEmi !== undefined && newParams.existingEmi !== null) session.eligibilityState.existingEmi = newParams.existingEmi;
    if (newParams.age) session.eligibilityState.age = newParams.age;
    if (newParams.employmentType) session.eligibilityState.employmentType = newParams.employmentType;
    if (newParams.creditScore) session.eligibilityState.creditScore = newParams.creditScore;
    if (newParams.tenureYears) session.eligibilityState.tenureYears = newParams.tenureYears;
    if (newParams.interestRate) session.eligibilityState.interestRate = newParams.interestRate;
    return session.eligibilityState;
  }

  extractStateFromHistory(messages = []) {
    const filters = {};
    let offset = 0;

    messages.forEach(msg => {
      if (msg.role === 'user') {
        const text = (msg.content || '').toLowerCase();
        
        if (text.includes('saravanampatti')) filters.locality = 'Saravanampatti';
        else if (text.includes('annur')) filters.locality = 'Annur';
        else if (text.includes('peelamedu')) filters.locality = 'Peelamedu';

        if (text.includes('apartment') || text.includes('flat')) filters.propertyType = 'APARTMENT';
        else if (text.includes('villa')) filters.propertyType = 'VILLA';

        const bhk = text.match(/(\d+)\s*(?:bhk|bedroom)/);
        if (bhk) filters.bedrooms = parseInt(bhk[1], 10);

        const maxLakh = text.match(/(?:under|below|less\s+than|max|budget)\s*₹?\s*(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|l)\b/);
        if (maxLakh) filters.maxPrice = parseFloat(maxLakh[1]) * 100000;
      }
    });

    return { filters, offset };
  }

  setLastResults(sessionId, properties = [], offset = 0) {
    const session = this.getSession(sessionId);
    session.lastProperties = properties;
    session.offset = offset;
  }

  getLastResults(sessionId) {
    const session = this.getSession(sessionId);
    return session.lastProperties || [];
  }

  handleCheaperQuery(sessionId) {
    const session = this.getSession(sessionId);
    const lastProps = session.lastProperties || [];
    const isRentSearch = session.propertyState.transactionType === 'RENT';
    
    const validPrices = lastProps
      .map(p => p.priceNumeric || (p.price ? parseInt(String(p.price).replace(/[^\d]/g, ''), 10) : 0))
      .filter(price => {
        if (price <= 0) return false;
        if (isRentSearch) return price <= 500000;
        return price >= 100000;
      });

    if (validPrices.length > 0) {
      const minDisplayedPrice = Math.min(...validPrices);
      session.propertyState.maxPrice = Math.round(minDisplayedPrice - 1);
    } else if (session.propertyState.maxPrice && session.propertyState.maxPrice > 0) {
      session.propertyState.maxPrice = Math.round(session.propertyState.maxPrice * 0.85);
    }

    session.propertyState.sortBy = 'price_asc';
    return session.propertyState;
  }
}

export const conversationManager = new ConversationManager();
