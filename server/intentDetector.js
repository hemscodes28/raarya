import { matchLocationFuzzy } from './fuzzyMatcher.js';

export function extractEligibilityParamsFromText(text) {
  if (!text || typeof text !== 'string') return {};

  let monthlyIncome = null;
  let requestedLoanAmount = null;
  let existingEmi = null;
  let age = null;

  const q = text.trim().toLowerCase();

  // Monthly Income / Salary extraction
  const incomeMatch = q.match(/(?:income|salary|sallary|earning|earn)(?:\s+(?:is|of|around|about|in|the|a|an|at|my|per))*\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakhs?|lacs?|l|k|thousand)?\b/i) ||
                      q.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakhs?|lacs?|l|k|thousand)?\s*(?:salary|sallary|income|per\s*month)/i);
  if (incomeMatch) {
    let val = parseFloat(incomeMatch[1].replace(/,/g, ''));
    const matchText = incomeMatch[0].toLowerCase();
    if (matchText.includes('lakh') || matchText.includes('lac') || (val <= 500 && !matchText.includes('k') && !matchText.includes('thousand'))) {
      monthlyIncome = val * 100000;
    } else if (matchText.includes('k') || matchText.includes('thousand')) {
      monthlyIncome = val * 1000;
    } else {
      monthlyIncome = val;
    }
  }

  // Requested Loan Amount extraction
  const reqLoanMatch = q.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakhs?|lacs?|l|crores?|cr)\s*(?:home\s*loan|loan)/i) ||
                       q.match(/(?:loan|home\s*loan)\s*(?:of|is|for|amount)?\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakhs?|lacs?|l|crores?|cr)/i) ||
                       q.match(/eligible\s*for\s*(?:a)?\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakhs?|lacs?|l|crores?|cr)/i);
  if (reqLoanMatch) {
    let val = parseFloat(reqLoanMatch[1].replace(/,/g, ''));
    const matchText = reqLoanMatch[0].toLowerCase();
    if (matchText.includes('crore') || matchText.includes('cr')) {
      requestedLoanAmount = val * 10000000;
    } else if (matchText.includes('lakh') || matchText.includes('lac') || matchText.includes('l')) {
      requestedLoanAmount = val * 100000;
    }
  }

  // Existing EMI extraction
  const emiMatch = q.match(/(?:existing|current|already\s*(?:have|pay|paying)|have|pay|paying)\s*(?:an)?\s*(?:existing|current)?\s*emi\s*(?:is|of)?\s*₹?\s*(\d+(?:,\d+)*)/i) ||
                   q.match(/(?:pay|paying|have)\s*₹?\s*(\d+(?:,\d+)*)\s*(?:as|in)?\s*emi/i) ||
                   q.match(/emi\s*(?:is|of)?\s*₹?\s*(\d+(?:,\d+)*)/i);
  if (emiMatch) existingEmi = parseInt(emiMatch[1].replace(/,/g, ''), 10);

  // Age extraction
  const ageMatch = q.match(/(?:i'?m|age\s*is|age)\s*(\d{2})\s*(?:years?\s*old)?/i);
  if (ageMatch) age = parseInt(ageMatch[1], 10);

  return { monthlyIncome, requestedLoanAmount, existingEmi, age };
}

export function detectIntentAndExtractFilters(userQuery, previousState = {}, activeDomainBefore = 'PROPERTY') {
  if (!userQuery || typeof userQuery !== 'string') {
    return {
      domain: 'GENERAL_CONVERSATION',
      intent: 'LOCAL_CONVERSATION',
      confidence: 0.9,
      entities: {},
      contextAction: 'CONVERSATIONAL_RESPONSE',
      filters: {},
      propertyId: null
    };
  }

  const q = userQuery.trim().toLowerCase();
  const cleanQ = q.replace(/[^\w\s]/g, '').trim();

  const hasActivePropertyContext = Boolean(
    previousState &&
    (previousState.propertyType || previousState.bedrooms || previousState.maxPrice || previousState.city || previousState.locality || previousState.transactionType)
  );

  // 1. ACKNOWLEDGEMENTS, THANKS, GREETINGS, CASUAL CHAT & GOODBYE
  const isGreeting = (
    /^(h+e+l+o+|h+i+|h+e+y+|namaste|good\s*(morning|afternoon|evening)|greetings|howdy|hii+|helloo+)(\s+(raarya|ai|bot|assistant|groups|properties|there|team|sir|madam))*$/i.test(cleanQ) ||
    (cleanQ === 'hi' || cleanQ === 'hello' || cleanQ === 'helo' || cleanQ === 'hey' || cleanQ === 'hii' || cleanQ === 'helloo')
  );

  const isCasualChat = (
    /^(how\s*(are|r)\s*(you|u)|how\s*is\s*it\s*going|what'?s\s*up|how\s*do\s*you\s*do)$/i.test(cleanQ) ||
    cleanQ === 'how are you' || cleanQ === 'how r u'
  );

  const isHelp = (
    cleanQ.includes('who are you') ||
    cleanQ.includes('what can you do') ||
    cleanQ.includes('who created you') ||
    cleanQ === 'help' ||
    cleanQ === 'capabilities'
  );

  const isAcknowledgement = (
    /^(thanks|thank\s*you|thanku|thx|ty|great|awesome|cool|ok|okay|bye|goodbye|see\s*you|nice|good|ohh?\s*ok|ohh?\s*okay|got\s*it|understood|sounds\s*good|perfect|that'?s\s*nice|interesting|wow|ohh?\s*its\s*nice|ohh?\s*it'?s\s*nice)$/i.test(cleanQ) ||
    cleanQ === 'thanks' || cleanQ === 'thank you' || cleanQ === 'thanku' || cleanQ === 'ok' || cleanQ === 'okay' ||
    cleanQ === 'ohh ok' || cleanQ === 'oh ok' || cleanQ === 'ohh okay' || cleanQ === 'oh okay' ||
    cleanQ === 'ohh its nice' || cleanQ === 'oh its nice' || cleanQ === 'nice' || cleanQ === 'good' || cleanQ === 'great' || cleanQ === 'awesome'
  );

  const hasSearchKeyword = Boolean(
    q.includes('property') || q.includes('properties') || q.includes('apartment') || q.includes('villa') ||
    q.includes('plot') || q.includes('bhk') || q.includes('lakh') || q.includes('crore') ||
    q.includes('emi') || q.includes('loan') || q.includes('show') || q.includes('under') ||
    q.includes('search') || q.includes('find') || q.includes('more')
  );

  if ((isGreeting || isCasualChat || isHelp || isAcknowledgement) && !hasSearchKeyword) {
    const intent = isGreeting ? 'GREETING' :
                   isAcknowledgement ? 'ACKNOWLEDGEMENT' :
                   isCasualChat ? 'LOCAL_CONVERSATION' : 'LOCAL_CONVERSATION';
    return {
      domain: 'ACKNOWLEDGEMENT',
      intent,
      confidence: 0.98,
      entities: {},
      contextAction: 'CONVERSATIONAL_RESPONSE',
      isNewSearch: false,
      isCheaperQuery: false,
      isShowMore: false,
      isDetailFollowup: false,
      isBudgetOpinion: false,
      isEmiQuery: false,
      isEligibilityQuery: false,
      targetRoute: null,
      emiParams: null,
      eligibilityParams: null,
      filters: {
        city: null, locality: null, propertyType: null, bedrooms: null, bedroomsMode: 'exact',
        maxPrice: null, minPrice: null, transactionType: null, amenities: null
      },
      propertyId: null
    };
  }

  // 1.5. COMPANY / ABOUT RAARYA QUERY (Flexible Semantic & Pattern Matching)
  const isCompanyQuery = Boolean(
    // A. Direct Company Mentions + Query Intent Signals
    (
      (q.includes('raar') || q.includes('rarya') || q.includes('raarya') || q.includes('company') || q.includes('business') || q.includes('organization') || q.includes('firm') || q.includes('platform') || q.includes('agency')) &&
      (q.includes('about') || q.includes('know') || q.includes('tell') || q.includes('info') || q.includes('detail') || q.includes('service') || q.includes('what is') || q.includes('who is') || q.includes('what does') || q.includes('what do') || q.includes('explain') || q.includes('describe') || q.includes('overview') || q.includes('summary') || q.includes('background') || q.includes('history') || q.includes('kind') || q.includes('type') || q.includes('nature') || q.includes('profile') || q.includes('mission') || q.includes('vision')) &&
      !(q.includes('bhk') || q.includes('bedroom') || q.includes('lakh') || q.includes('lac') || q.includes('crore') || q.includes('under') || q.includes('below') || q.includes('cheap') || q.includes('villa') || q.includes('apartment') || q.includes('plot') || q.includes('land') || q.includes('house'))
    ) ||
    // B. Flexible Pattern Matches
    cleanQ.includes('about us') ||
    cleanQ.includes('about company') ||
    cleanQ.includes('about the company') ||
    cleanQ.includes('about this company') ||
    cleanQ.includes('about raarya') ||
    cleanQ.includes('know about') ||
    cleanQ.includes('tell about') ||
    cleanQ.includes('info about') ||
    cleanQ.includes('information about') ||
    cleanQ.includes('details of company') ||
    cleanQ.includes('details about') ||
    cleanQ.includes('what is raarya') ||
    cleanQ.includes('who is raarya') ||
    cleanQ.includes('what does raarya') ||
    cleanQ.includes('what do you do') ||
    cleanQ.includes('what is this company') ||
    cleanQ.includes('what kind of company') ||
    cleanQ.includes('what type of company') ||
    cleanQ.includes('company info') ||
    cleanQ.includes('company details') ||
    cleanQ.includes('company profile') ||
    cleanQ.includes('company overview')
  );

  if (isCompanyQuery) {
    return {
      domain: 'WEBSITE',
      intent: 'WEBSITE_COMPANY_QUERY',
      confidence: 0.99,
      entities: {},
      contextAction: 'USE_WEBSITE_KNOWLEDGE',
      isNewSearch: false,
      isCheaperQuery: false,
      isShowMore: false,
      isDetailFollowup: false,
      isBudgetOpinion: false,
      isEmiQuery: false,
      isEligibilityQuery: false,
      targetRoute: null,
      emiParams: null,
      eligibilityParams: null,
      filters: { city: null, locality: null, propertyType: null, bedrooms: null, bedroomsMode: 'exact', maxPrice: null, minPrice: null, transactionType: null, amenities: null },
      propertyId: null
    };
  }
  const propIdMatch = q.match(/\b(prop-[a-z0-9-]+|prop_[a-z0-9_]+|p\d{3,})\b/i);
  let targetPropertyId = propIdMatch ? propIdMatch[1] : null;

  const isPropertyDetailQuery = Boolean(
    targetPropertyId ||
    q.includes('price of this property') ||
    q.includes('details of this property') ||
    q.includes('tell me about the first') ||
    q.includes('tell me about the second') ||
    q.includes('tell me about the third') ||
    q.includes('tell me about this property') ||
    (q.includes('tell me about') && (q.includes('property') || q.includes('prop-')))
  );

  if (isPropertyDetailQuery) {
    return {
      domain: 'PROPERTY',
      intent: 'PROPERTY_DETAIL',
      confidence: 0.95,
      entities: { propertyId: targetPropertyId },
      contextAction: 'FETCH_PROPERTY_DETAIL',
      isNewSearch: false,
      isCheaperQuery: false,
      isShowMore: false,
      isDetailFollowup: true,
      isBudgetOpinion: false,
      isEmiQuery: false,
      isEligibilityQuery: false,
      targetRoute: null,
      emiParams: null,
      eligibilityParams: null,
      filters: {},
      propertyId: targetPropertyId
    };
  }

  // 3. LOAN ELIGIBILITY QUERY & INTENT CORRECTION
  const isEligibilityCorrection = Boolean(
    q.includes('no eligibility') ||
    q.includes('no, eligibility') ||
    q.includes('not emi, eligibility') ||
    q.includes('meant eligibility') ||
    q.includes('asked about eligibility') ||
    q.includes('want an eligibility check') ||
    q.includes('know if i qualify') ||
    q.includes("don't want emi") ||
    q.includes('dont want emi') ||
    q === 'no eligibility check' ||
    q === 'eligibility check'
  );

  const isExplicitEmiDemand = Boolean(
    q.includes('what will my emi be') ||
    q.includes('what is my emi') ||
    q.includes('what is the emi') ||
    q.includes('calculate monthly emi') ||
    q.includes('calculate emi') ||
    q.includes('monthly instalment') ||
    q.includes('monthly installment') ||
    q.includes('monthly payment') ||
    q.includes('pay every month') ||
    q.includes('repay every month')
  );

  const isEligibilityFollowUpSignal = Boolean(
    (activeDomainBefore === 'ELIGIBILITY' || previousState.activeDomain === 'ELIGIBILITY') &&
    (
      q.includes('emi') || q.includes('age') || q.includes('years old') ||
      q.includes('salary') || q.includes('income') || q.includes('earn') ||
      q.includes('loan') || q.includes('lakh')
    )
  );

  const isEmiToEligibilityFollowup = Boolean(
    (activeDomainBefore === 'EMI' || previousState.activeDomain === 'EMI') &&
    (q.includes('eligible') || q.includes('qualify') || q.includes('can i get that') || q.includes('am i eligible for that'))
  );

  const isHomeLoanAlone = Boolean(
    cleanQ === 'home loan' ||
    cleanQ === 'home loans' ||
    cleanQ === 'home lone' ||
    cleanQ === 'home lones' ||
    cleanQ === 'about home loan' ||
    cleanQ === 'tell me about home loan' ||
    cleanQ === 'what is home loan'
  );

  if (isHomeLoanAlone) {
    return {
      domain: 'ELIGIBILITY',
      intent: 'HOME_LOAN_INFO',
      confidence: 0.98,
      entities: {},
      contextAction: 'HOME_LOAN_INFO',
      isNewSearch: false,
      isCheaperQuery: false,
      isShowMore: false,
      isDetailFollowup: false,
      isBudgetOpinion: false,
      isEmiQuery: false,
      isEligibilityQuery: true,
      targetRoute: '#eligibility-check',
      emiParams: null,
      eligibilityParams: {},
      filters: {},
      propertyId: null
    };
  }

  const isEligibilityKeyword = Boolean(
    q.includes('eligibility') ||
    q.includes('eligibilty') ||
    q.includes('elligibility') ||
    q.includes('eligiblity') ||
    q.includes('eligible') ||
    q.includes('qualify') ||
    q.includes('afford') ||
    q.includes('can i get') ||
    q.includes('am i eligible') ||
    q.includes('will i be eligible') ||
    q.includes('would i qualify') ||
    q.includes('will i qualify') ||
    q.includes('can i qualify') ||
    q.includes('how much home loan can i get') ||
    q.includes('how much loan can i get') ||
    q.includes('what home loan amount can i get') ||
    q.includes('can i get a loan based on my income') ||
    q.includes('can i get a home loan with my salary') ||
    q.includes('loan eligibility') ||
    q.includes('home loan eligibility')
  );

  const isEligibilityQuery = (isEligibilityCorrection || isEmiToEligibilityFollowup || isEligibilityFollowUpSignal || (isEligibilityKeyword && !isExplicitEmiDemand));

  let eligibilityParams = null;
  if (isEligibilityQuery) {
    eligibilityParams = extractEligibilityParamsFromText(userQuery);
  }

  const isExplicitWebsiteQuestion = Boolean(
    q.includes('what is post property') ||
    q.includes('meaning for post property') ||
    q.includes('what is the emi calculator') ||
    q.includes('what is emi calculator') ||
    q.includes('what is eligibility check') ||
    q.includes('what is the eligibility check') ||
    q.includes('what services') ||
    q.includes('how to post') ||
    q.includes('how do i post') ||
    q.includes('how can i contact') ||
    q.includes('contact you') ||
    q.includes('office address') ||
    q.includes('phone number')
  );

  // 4. EMI CALCULATOR QUERY & FOLLOW-UP
  const isExplicitEmiQuery = Boolean(
    !isEligibilityQuery &&
    !isExplicitWebsiteQuestion &&
    (
      q.includes('emi') ||
      q.includes('monthly instalment') ||
      q.includes('monthly installment') ||
      q.includes('monthly payment') ||
      q.includes('pay every month') ||
      q.includes('repay every month') ||
      q.includes('installment') ||
      q.includes('loan calculator') ||
      q.includes('emi calculator') ||
      q.includes('loan repayment') ||
      q.includes('how much will i pay') ||
      q.includes('what will my emi be') ||
      q.includes('how much do i pay') ||
      (q.includes('loan') && (q.includes('interest') || q.includes('duration') || q.includes('tenure') || q.includes('rate') || q.includes('amount') || q.includes('borrow') || q.includes('lakh') || q.includes('crore'))) ||
      (q.includes('calculate') && q.includes('loan'))
    )
  );

  const isEmiFollowUpSignal = Boolean(
    !isEligibilityQuery &&
    (activeDomainBefore === 'EMI' || previousState.activeDomain === 'EMI') &&
    !hasSearchKeyword &&
    (
      q.includes('percent') || q.includes('%') || q.includes('p.a') || q.includes('rate') ||
      q.includes('years') || q.includes('yrs') || q.includes('yr') ||
      q.match(/\b\d+(?:\.\d+)?\s*(?:%|percent)\b/i) ||
      q.match(/\b\d+\s*(?:years?|yrs?|yr)\b/i)
    )
  );

  const isEmiQuery = isExplicitEmiQuery || isEmiFollowUpSignal;

  let emiParams = null;
  if (isEmiQuery) {
    let loanAmount = null;
    let interestRate = null;
    let tenureYears = null;

    const lakhLoan = q.match(/(?:loan\s*(?:amount)?\s*(?:is|of)?|for)?\s*₹?\s*(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|l)\b/i);
    const crLoan = q.match(/(?:loan\s*(?:amount)?\s*(?:is|of)?|for)?\s*₹?\s*(\d+(?:\.\d+)?)\s*(?:crores?|cr)\b/i);
    const rawLoan = q.match(/(?:loan\s*amount\s*is|borrow|amount\s*is|loan\s*of)\s*₹?\s*(\d{5,9})\b/i) || q.match(/₹?\s*(\d{6,8})\b/);

    if (crLoan) loanAmount = parseFloat(crLoan[1]) * 10000000;
    else if (lakhLoan) loanAmount = parseFloat(lakhLoan[1]) * 100000;
    else if (rawLoan) loanAmount = parseInt(rawLoan[1], 10);

    const rateMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:%|percent|p\.a\.|annual)/i) || q.match(/(?:interest|rate)\s*(?:is|at)?\s*(\d+(?:\.\d+)?)/i);
    if (rateMatch) interestRate = parseFloat(rateMatch[1]);

    const tenureMatch = q.match(/(\d+)\s*(?:years?|yrs?|yr)\b/i);
    if (tenureMatch) tenureYears = parseInt(tenureMatch[1], 10);

    emiParams = { loanAmount, interestRate, tenureYears };
  }

  // 5. WEBSITE NAVIGATION QUERY
  let targetRoute = null;
  const isNavigation = Boolean(
    q.includes('open') ||
    q.includes('take me to') ||
    q.includes('where is the') ||
    q.includes('show me the page') ||
    q.includes('go to')
  );

  if (isNavigation) {
    if (q.includes('emi') || q.includes('calculator')) targetRoute = '#emi-calculator';
    else if (q.includes('eligibility')) targetRoute = '#eligibility-check';
    else if (q.includes('post') || q.includes('sell')) targetRoute = '#post-property';
    else if (q.includes('buy') || q.includes('properties for sale')) targetRoute = '#buy';
    else if (q.includes('rent') || q.includes('rental')) targetRoute = '#rent';
    else if (q.includes('contact') || q.includes('enquiry')) targetRoute = '#contact';
    else if (q.includes('career') || q.includes('job')) targetRoute = '#careers';
    else if (q.includes('company') || q.includes('about') || q.includes('blog')) targetRoute = '#company';
  }

  // 6. WEBSITE / COMPANY KNOWLEDGE QUERY
  const isWebsiteQuery = Boolean(
    isExplicitWebsiteQuestion ||
    q.includes('service') ||
    q.includes('about company') ||
    q.includes('who is raarya') ||
    q.includes('what is raarya') ||
    q.includes('post property') ||
    q.includes('post a property') ||
    q.includes('list property') ||
    q.includes('listing property') ||
    q.includes('how to post') ||
    q.includes('how do i post') ||
    q.includes('meaning for post') ||
    q.includes('what is post') ||
    q.includes('what is the emi calculator') ||
    q.includes('what is emi calculator') ||
    q.includes('what is eligibility check') ||
    q.includes('what is home loan') ||
    q.includes('career') ||
    q.includes('job') ||
    q.includes('hiring') ||
    q.includes('work at raarya') ||
    q.includes('join raarya') ||
    q.includes('how to list') ||
    q.includes('post my property') ||
    q.includes('contact') ||
    q.includes('phone number') ||
    q.includes('office address') ||
    q.includes('where is your office') ||
    q.includes('tell me about the company') ||
    q.includes('buying process') ||
    q.includes('renting process') ||
    q.includes('site visit') ||
    q.includes('areas cover') ||
    q.includes('what is buy') ||
    q.includes('what is rent') ||
    q.includes('what is pg') ||
    q.includes('what is hostel') ||
    q.includes('home loan section')
  );

  // Non-property domain short-circuit
  if (targetRoute) {
    return {
      domain: 'NAVIGATION',
      intent: 'NAVIGATION_QUERY',
      confidence: 0.99,
      entities: { targetRoute },
      contextAction: 'NAVIGATE_TO_ROUTE',
      targetRoute,
      filters: { city: null, locality: null, propertyType: null, bedrooms: null, bedroomsMode: 'exact', maxPrice: null, minPrice: null, transactionType: null, amenities: null }
    };
  }

  if (isEmiQuery && !q.includes('apartment') && !q.includes('villa') && !q.includes('plot') && !q.includes('flat') && !q.includes('house')) {
    return {
      domain: 'EMI',
      intent: isEmiFollowUpSignal ? 'EMI_FOLLOWUP' : 'EMI_QUERY',
      confidence: 0.97,
      entities: emiParams || {},
      contextAction: isEmiFollowUpSignal ? 'UPDATE_AND_CALCULATE_EMI' : 'CALCULATE_EMI',
      isEmiQuery: true,
      emiParams,
      filters: { city: null, locality: null, propertyType: null, bedrooms: null, bedroomsMode: 'exact', maxPrice: null, minPrice: null, transactionType: null, amenities: null }
    };
  }

  if (isEligibilityQuery && !q.includes('apartment') && !q.includes('villa') && !q.includes('plot') && !q.includes('flat')) {
    return {
      domain: 'ELIGIBILITY',
      intent: isEligibilityFollowUpSignal || isEmiToEligibilityFollowup ? 'ELIGIBILITY_FOLLOWUP' : 'ELIGIBILITY_QUERY',
      confidence: 0.97,
      entities: eligibilityParams || {},
      contextAction: 'CHECK_LOAN_ELIGIBILITY',
      isEligibilityQuery: true,
      isEligibilityCorrection,
      eligibilityParams,
      filters: { city: null, locality: null, propertyType: null, bedrooms: null, bedroomsMode: 'exact', maxPrice: null, minPrice: null, transactionType: null, amenities: null }
    };
  }

  if (isWebsiteQuery) {
    return {
      domain: 'WEBSITE',
      intent: 'WEBSITE_QUERY',
      confidence: 0.99,
      entities: {},
      contextAction: 'USE_WEBSITE_KNOWLEDGE',
      filters: { city: null, locality: null, propertyType: null, bedrooms: null, bedroomsMode: 'exact', maxPrice: null, minPrice: null, transactionType: null, amenities: null }
    };
  }

  // 7. PROPERTY SEARCH PARAMETER EXTRACTION
  let maxPrice = null;
  let minPrice = null;
  let bedrooms = null;
  let bedroomsMode = 'exact';
  let propertyType = null;
  let type = null;
  let locality = null;

  const hasPropertySearchAnchor = Boolean(
    q.includes('apartment') || q.includes('flat') || q.includes('villa') ||
    q.includes('plot') || q.includes('land') || q.includes('house') ||
    q.includes('commercial') || q.includes('bhk') || q.includes('bedroom') ||
    q.includes('show') || q.includes('find') || q.includes('search') ||
    q.includes('properties in') || q.includes('looking for property')
  );

  const maxLakhMatch = q.match(/(?:under|below|less\s+than|max|within|budget|around|keep\s*(?:it)?\s*(?:around|at)?|make\s*(?:it)?|bring\s*(?:it)?\s*(?:down)?\s*(?:to)?|about|up\s+to|cap\s+at|target|price)\s*₹?\s*(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|l)\b/i);
  const maxCrMatch = q.match(/(?:under|below|less\s+than|max|within|budget|around|keep\s*(?:it)?\s*(?:around|at)?|make\s*(?:it)?|bring\s*(?:it)?\s*(?:down)?\s*(?:to)?|about|up\s+to|cap\s+at|target|price)\s*₹?\s*(\d+(?:\.\d+)?)\s*(?:crores?|cr)\b/i);

  if (maxCrMatch) {
    maxPrice = parseFloat(maxCrMatch[1]) * 10000000;
  } else if (maxLakhMatch) {
    maxPrice = parseFloat(maxLakhMatch[1]) * 100000;
  }

  if (!maxPrice && !isEmiQuery) {
    const lakhAlone = q.match(/\b(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|l)\b/i);
    const crAlone = q.match(/\b(\d+(?:\.\d+)?)\s*(?:crores?|cr)\b/i);
    const isContextualPrice = Boolean(
      hasPropertySearchAnchor ||
      hasActivePropertyContext ||
      q.includes('under') || q.includes('below') || q.includes('budget') || q.includes('max') || q.includes('less') || q.includes('around') || q.includes('keep') || q.includes('make') || q.includes('bring') || q.includes('down')
    );

    if (crAlone && isContextualPrice) {
      maxPrice = parseFloat(crAlone[1]) * 10000000;
    } else if (lakhAlone && isContextualPrice) {
      maxPrice = parseFloat(lakhAlone[1]) * 100000;
    }
  }

  // Bedrooms
  const bhkMatch = q.match(/(\d+)\s*(?:bhk|bedroom|bedrooms|bed|beds|rooms?)\b/i) || q.match(/(one|two|three|four|five)\s*(?:bhk|bedroom|bedrooms|bed|beds|rooms?)\b/i);
  if (bhkMatch) {
    const numMap = { one: 1, two: 2, three: 3, four: 4, five: 5 };
    const matchedBedrooms = numMap[bhkMatch[1].toLowerCase()] || parseInt(bhkMatch[1], 10);

    const isNegatedBhk = Boolean(
      q.includes(`not ${matchedBedrooms}`) ||
      q.includes(`not ${bhkMatch[1]}`) ||
      q.includes(`no ${matchedBedrooms}`) ||
      q.includes(`without ${matchedBedrooms}`) ||
      q.includes(`other than ${matchedBedrooms}`)
    );

    if (!isNegatedBhk) {
      bedrooms = matchedBedrooms;
    }
  }

  // Property Type (Typo-Tolerant)
  if (/app?art?ment?s?|flats?/i.test(q)) propertyType = 'APARTMENT';
  else if (/vil+as?/i.test(q)) propertyType = 'VILLA';
  else if (/plots?|lands?|layouts?|cents?/i.test(q)) propertyType = 'PLOT';
  else if (/house?s?|homes?/i.test(q) && !q.includes('home loan')) propertyType = 'HOUSE';
  else if (/com+er+cial|office|shops?|showrooms?/i.test(q)) propertyType = 'COMMERCIAL';
  else if (/\bpg\b|hostels?/i.test(q)) propertyType = 'PG/HOSTEL';

  // Transaction Type
  if (q.includes('rent') || q.includes('lease') || q.includes('rental')) type = 'RENT';
  else if (q.includes('pg') || q.includes('hostel')) type = 'PG-HOSTEL';
  else if (q.includes('buy') || q.includes('sale') || q.includes('purchase') || (maxPrice && maxPrice >= 100000)) type = 'SALE';

  // Localities with Fuzzy Matcher Integration
  const matchedFuzzyLoc = matchLocationFuzzy(q);
  if (matchedFuzzyLoc && matchedFuzzyLoc.toLowerCase() !== 'coimbatore') {
    locality = matchedFuzzyLoc;
  } else {
    const knownLocalities = [
      'singanallur', 'sulur', 'ondipudur', 'peelamedu', 'gandhipuram', 'vadamadurai', 
      'thudiyalur', 'hopes', 'ramanathapuram', 'saibaba colony', 'ganapathy', 'saravanampatti', 
      'annur', 'kinathukadavu', 'karumathampatti', 'sirumugai', 'thekkalur', 'coimbatore', 
      'avinashi', 'kaniyur', 'kovaipudur', 'kurumbapalayam', 'kalapatti', 'tidel park', 'karanampettai', 'arasur', 'tiruppur', 'karamadai', 'sevur'
    ];

    for (const loc of knownLocalities) {
      if (q.includes(loc)) {
        locality = loc.charAt(0).toUpperCase() + loc.slice(1);
        break;
      }
    }
  }

  // Amenities
  const amenities = [];
  if (q.includes('swimming pool') || q.includes('pool')) amenities.push('swimming pool');
  if (q.includes('parking') || q.includes('car parking')) amenities.push('parking');
  if (q.includes('gym') || q.includes('fitness')) amenities.push('gym');
  if (q.includes('garden') || q.includes('park')) amenities.push('garden');
  if (q.includes('dtcp')) amenities.push('DTCP Approved');
  if (q.includes('rera')) amenities.push('RERA Approved');
  if (q.includes('water') || q.includes('water supply')) amenities.push('24/7 Water Supply');
  if (q.includes('road') || q.includes('blacktop road')) amenities.push('Tar Road Access');

  // Explicit Reset Phrases
  const isExplicitReset = Boolean(
    q.includes('just properties in') ||
    q.includes('forget previous') ||
    q.includes('forget the previous') ||
    q.includes('start a new search') ||
    q.includes('new search') ||
    q.includes('something completely different') ||
    q.includes('dont use previous') ||
    q.includes("don't use previous") ||
    q.includes("don't use the previous") ||
    q.includes('not 2 bhk') ||
    q.includes('not 2bhk') ||
    q.includes('not 3 bhk') ||
    q.includes('not 3bhk') ||
    q.includes('without those restrictions') ||
    q.includes("don't use previous criteria") ||
    q.includes('dont use previous criteria') ||
    q.includes("don't use the previous criteria")
  );

  // Property Modifiers & Intent Classification
  const isCheaperQuery = Boolean(q.includes('cheaper') || q.includes('cheapest') || q.includes('lower price') || q.includes('less price') || q.includes('more affordable'));
  const isShowMore = Boolean(q.includes('show me more') || q.includes('show more') || q.includes('more options') || q.includes('any others') || q.includes('more properties') || q.includes('do you have more'));
  const isDetailFollowup = Boolean(q.includes('first one') || q.includes('second one') || q.includes('third one') || q.includes('first property') || q.includes('second property') || q.includes('tell me more about the first') || q.includes('details of this property') || q.includes('details of property') || q.includes('that one'));

  const isBudgetOpinion = Boolean(
    q.includes('high') ||
    q.includes('too high') ||
    q.includes('bit high') ||
    q.includes('expensive') ||
    q.includes('too expensive') ||
    q.includes('way out of budget') ||
    q.includes('above my budget') ||
    q.includes('out of reach') ||
    q.includes('bring it down') ||
    q.includes('bring down') ||
    q.includes('lower') ||
    q.includes('go lower') ||
    q.includes('can you go lower') ||
    q.includes('cheaper') ||
    q.includes('something cheaper')
  );

  const isLocationFollowup = Boolean(
    q.includes('what about') ||
    q.includes('how about') ||
    q.includes('instead') ||
    q.includes('same location') ||
    q.includes('keep coimbatore') ||
    q.includes('keep the same location') ||
    q.includes('also in')
  );

  const hasFollowupConnector = Boolean(
    isBudgetOpinion ||
    isCheaperQuery ||
    isShowMore ||
    isDetailFollowup ||
    q.startsWith('under') ||
    q.startsWith('below') ||
    q.startsWith('only') ||
    q.startsWith('which') ||
    q.startsWith('what about') ||
    q.includes('instead') ||
    q.includes('actually') ||
    q.includes('make it') ||
    q.includes('keep') ||
    q.includes('around') ||
    q.includes("let's") ||
    q.includes('lets') ||
    q.includes('change') ||
    q.includes('try ') ||
    q.includes('maybe ') ||
    q.includes('stretch to')
  );

  const isNewLocationSearch = Boolean(
    locality && !isLocationFollowup && !hasFollowupConnector
  );

  const isFollowUpModifier = Boolean(
    hasActivePropertyContext &&
    !isExplicitReset &&
    !isNewLocationSearch &&
    (
      hasFollowupConnector ||
      (maxPrice !== null && hasFollowupConnector) ||
      (bedrooms !== null && hasFollowupConnector)
    )
  );

  const isNewSearchAnchor = Boolean(
    isExplicitReset ||
    isNewLocationSearch ||
    (!hasFollowupConnector && (q.includes('find') || q.includes('search') || q.includes('looking for') || q.includes('need') || q.includes('show') || q.includes('properties in'))) ||
    (locality && !hasFollowupConnector)
  );

  let intent = 'NEW_PROPERTY_SEARCH';
  let contextAction = 'CREATE_NEW_PROPERTY_SEARCH';

  if (isShowMore && hasActivePropertyContext) {
    intent = 'PROPERTY_SHOW_MORE';
    contextAction = 'SHOW_MORE_PROPERTY_RESULTS';
  } else if (isExplicitReset || isNewSearchAnchor) {
    intent = 'NEW_PROPERTY_SEARCH';
    contextAction = 'CREATE_NEW_PROPERTY_SEARCH';
  } else if (isFollowUpModifier) {
    intent = 'PROPERTY_FOLLOWUP';
    contextAction = 'MERGE_PROPERTY_FOLLOWUP';
  } else if (hasPropertySearchAnchor || (maxPrice && !hasActivePropertyContext)) {
    intent = 'NEW_PROPERTY_SEARCH';
    contextAction = 'CREATE_NEW_PROPERTY_SEARCH';
  } else if (hasActivePropertyContext) {
    intent = 'PROPERTY_FOLLOWUP';
    contextAction = 'MERGE_PROPERTY_FOLLOWUP';
  }

  const extractedPatch = {
    city: locality === 'Chennai' ? 'Chennai' : (locality || propertyType || bedrooms || maxPrice) ? 'Coimbatore' : null,
    locality,
    propertyType,
    bedrooms,
    bedroomsMode,
    maxPrice,
    minPrice,
    transactionType: type,
    amenities: amenities.length > 0 ? amenities : null
  };

  return {
    domain: 'PROPERTY',
    intent,
    confidence: 0.95,
    entities: extractedPatch,
    contextAction,
    isNewSearch: intent === 'NEW_PROPERTY_SEARCH',
    isCheaperQuery,
    isShowMore,
    isDetailFollowup,
    isBudgetOpinion,
    isEmiQuery: false,
    isEligibilityQuery: false,
    targetRoute: null,
    emiParams: null,
    eligibilityParams: null,
    filters: extractedPatch,
    propertyId: targetPropertyId
  };
}
