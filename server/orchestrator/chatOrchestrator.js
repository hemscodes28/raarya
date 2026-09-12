import { propertyRepo, deduplicateProperties, formatIndianCurrency } from '../propertyRepository.js';
import { websiteSearchService } from '../websiteSearch.js';
import { detectIntentAndExtractFilters, extractEligibilityParamsFromText } from '../intentDetector.js';
import { conversationManager } from '../conversationManager.js';
import { geminiService } from '../geminiService.js';
import { jsonSchemaValidator } from '../validators/jsonSchemaValidator.js';

function calculateEmiDetails({ loanAmount, interestRate = 8.5, tenureYears = 20 }) {
  const P = loanAmount;
  const R = interestRate;
  const N = tenureYears;
  const monthlyRate = R / 12 / 100;
  const totalMonths = N * 12;

  let emi = 0;
  if (monthlyRate === 0) {
    emi = P / totalMonths;
  } else {
    emi = (P * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  const totalPayment = emi * totalMonths;
  const totalInterest = Math.max(0, totalPayment - P);

  return {
    loanAmount: P,
    interestRate: R,
    tenureYears: N,
    monthlyEmi: Math.round(emi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest)
  };
}

function calculateEligibilityDetails({ monthlyIncome, requestedLoanAmount, existingEmi = 0, tenureYears = 20, interestRate = 8.5 }) {
  const FOIR = 0.40;
  const currentEmi = existingEmi || 0;
  const availableEmi = Math.max(0, ((monthlyIncome || 0) * FOIR) - currentEmi);
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = tenureYears * 12;

  let maxEligibleLoan = 0;
  if (availableEmi > 0) {
    if (monthlyRate === 0) {
      maxEligibleLoan = availableEmi * totalMonths;
    } else {
      maxEligibleLoan = (availableEmi * (Math.pow(1 + monthlyRate, totalMonths) - 1)) / (monthlyRate * Math.pow(1 + monthlyRate, totalMonths));
    }
  }

  let requestedLoanEmi = 0;
  if (requestedLoanAmount && requestedLoanAmount > 0) {
    const P = requestedLoanAmount;
    if (monthlyRate === 0) {
      requestedLoanEmi = P / totalMonths;
    } else {
      requestedLoanEmi = (P * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }
  }

  return {
    monthlyIncome,
    requestedLoanAmount,
    existingEmi: currentEmi,
    availableEmi: Math.round(availableEmi),
    maxEligibleLoan: Math.round(maxEligibleLoan),
    requestedLoanEmi: Math.round(requestedLoanEmi),
    tenureYears,
    interestRate
  };
}

function logTelemetry({ userMessage, activeDomainBefore, detected, stateDecision, propertyStateBefore, propertyStateAfter, activeDomainAfter, retrievalDomain, resultType, serviceCalled }) {
  console.log('\n[USER]');
  console.log(userMessage);
  console.log('[ACTIVE DOMAIN BEFORE]');
  console.log(activeDomainBefore);
  console.log('[INTENT]');
  console.log(detected.intent);
  console.log('[DOMAIN]');
  console.log(detected.domain || activeDomainAfter);
  console.log('[CONFIDENCE]');
  console.log(detected.confidence || 0.95);
  console.log('[ENTITIES]');
  console.log(JSON.stringify(detected.entities || {}, null, 2));
  console.log('[CONTEXT ACTION]');
  console.log(detected.contextAction || stateDecision);
  console.log('[STATE BEFORE]');
  console.log(JSON.stringify(propertyStateBefore, null, 2));
  console.log('[STATE AFTER]');
  console.log(JSON.stringify(propertyStateAfter, null, 2));
  console.log('[SERVICE CALLED]');
  console.log(serviceCalled);
  console.log('[RESPONSE TYPE]');
  console.log(resultType);

  console.log('\n[USER MESSAGE]');
  console.log(userMessage);
  console.log('[ACTIVE DOMAIN BEFORE]');
  console.log(activeDomainBefore);
  console.log('[DETECTED INTENT]');
  console.log(detected.intent);
  console.log('[STATE DECISION]');
  console.log(stateDecision);
  console.log('[PROPERTY STATE BEFORE]');
  console.log(JSON.stringify(propertyStateBefore, null, 2));
  console.log('[PROPERTY PATCH]');
  console.log(JSON.stringify(detected.filters || {}, null, 2));
  console.log('[PROPERTY STATE AFTER]');
  console.log(JSON.stringify(propertyStateAfter, null, 2));
  console.log('[ACTIVE DOMAIN AFTER]');
  console.log(activeDomainAfter);
  console.log('[RETRIEVAL DOMAIN]');
  console.log(retrievalDomain);
  console.log('[RESULT TYPE]');
  console.log(resultType);
}

export class ChatOrchestrator {
  async processChat({ messages, sessionId = 'default' }) {
    const requestId = 'req_' + Math.random().toString(36).substring(2, 8);
    const latestUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';

    // Fetch active conversation state & domain before extraction
    const activeDomainBefore = conversationManager.getActiveDomain(sessionId);
    const propertyStateBefore = JSON.parse(JSON.stringify(conversationManager.getPropertyState(sessionId)));

    // Detect Intent & Extract entity search filters / patches
    const detected = detectIntentAndExtractFilters(latestUserMessage, propertyStateBefore, activeDomainBefore);

    // Compute State Decision
    let stateDecision = "FOLLOWUP";
    if (detected.isNewSearch) {
      stateDecision = "NEW_SEARCH";
    } else if (['WEBSITE_QUERY', 'NAVIGATION_QUERY', 'EMI_QUERY', 'EMI_FOLLOWUP', 'ELIGIBILITY_QUERY'].includes(detected.intent)) {
      stateDecision = "DOMAIN_SWITCH";
    } else if (['ACKNOWLEDGEMENT', 'GREETING', 'THANKS', 'LOCAL_CONVERSATION'].includes(detected.intent)) {
      stateDecision = "NONE";
    }

    // ─── ROUTE 1: ACKNOWLEDGEMENTS / GREETINGS / CASUAL CHAT ────────────────────
    if (['ACKNOWLEDGEMENT', 'GREETING', 'THANKS', 'LOCAL_CONVERSATION'].includes(detected.intent) || detected.domain === 'ACKNOWLEDGEMENT') {
      conversationManager.setActiveDomain(sessionId, 'ACKNOWLEDGEMENT');

      logTelemetry({
        userMessage: latestUserMessage,
        activeDomainBefore,
        detected,
        stateDecision: 'NONE',
        propertyStateBefore,
        propertyStateAfter: propertyStateBefore,
        activeDomainAfter: 'ACKNOWLEDGEMENT',
        retrievalDomain: 'NONE',
        resultType: 'LOCAL_CONVERSATION',
        serviceCalled: 'CONVERSATIONAL_RESPONSE'
      });

      let message = 'Hi! 👋 How can I help you today?';
      const cleanLower = latestUserMessage.toLowerCase();
      if (cleanLower.includes('how are you') || cleanLower.includes('how r u')) {
        message = "I'm doing great, thank you! I am Raarya AI, your real estate assistant for Coimbatore properties. How can I assist your home search today?";
      } else if (cleanLower.includes('help') || cleanLower.includes('who are you')) {
        message = "I can help you search layout plots, villas, and apartments across Coimbatore, calculate home loan EMIs, check loan eligibility, and provide company details! What would you like to explore?";
      } else if (cleanLower.includes('ohh its nice') || cleanLower.includes('oh its nice') || cleanLower.includes('nice') || cleanLower.includes('good') || cleanLower.includes('great')) {
        message = "Glad you liked them! 😊 Let me know if you'd like to explore more properties or refine your search.";
      } else if (cleanLower.includes('thanks') || cleanLower.includes('thank you') || cleanLower.includes('thanku') || cleanLower.includes('ok') || cleanLower.includes('okay')) {
        message = "You're very welcome! Let me know if you need anything else for your property search in Coimbatore. Have a great day! 😊";
      }

      return {
        success: true,
        requestId,
        type: 'local_conversation',
        intent: detected.intent,
        message,
        content: message,
        propertyIds: [],
        properties: [],
        filters: {},
        hasMore: false,
        source: 'local'
      };
    }

    // ─── ROUTE 2: WEBSITE NAVIGATION ──────────────────────────────────────────
    if (detected.intent === 'NAVIGATION_QUERY' || detected.targetRoute || detected.domain === 'NAVIGATION') {
      conversationManager.setActiveDomain(sessionId, 'NAVIGATION');

      logTelemetry({
        userMessage: latestUserMessage,
        activeDomainBefore,
        detected,
        stateDecision: 'DOMAIN_SWITCH',
        propertyStateBefore,
        propertyStateAfter: propertyStateBefore,
        activeDomainAfter: 'NAVIGATION',
        retrievalDomain: 'NONE',
        resultType: 'NAVIGATION',
        serviceCalled: 'NAVIGATION_SERVICE'
      });

      const targetRoute = detected.targetRoute || '#buy';
      const routeName = targetRoute === '#emi-calculator' ? 'EMI Calculator' :
                        targetRoute === '#eligibility-check' ? 'Loan Eligibility Checker' :
                        targetRoute === '#buy' ? 'Buy Section' :
                        targetRoute === '#rent' ? 'Rent Section' :
                        targetRoute === '#contact' ? 'Contact Page' :
                        targetRoute === '#careers' ? 'Careers Page' : 'Requested Page';

      const message = `Click below to navigate directly to the **${routeName}**:\n\n[Open ${routeName} →](${targetRoute})`;

      return {
        success: true,
        requestId,
        type: 'navigation',
        intent: 'NAVIGATION_QUERY',
        message,
        content: message,
        route: targetRoute,
        propertyIds: [],
        properties: [],
        filters: {},
        hasMore: false,
        source: 'navigation'
      };
    }

    // ─── ROUTE 3: EMI CALCULATOR DOMAIN ──────────────────────────────────────────
    if (detected.intent === 'EMI_QUERY' || detected.intent === 'EMI_FOLLOWUP' || detected.intent === 'MIXED_PROPERTY_EMI' || detected.domain === 'EMI') {
      conversationManager.setActiveDomain(sessionId, 'EMI');
      const emiState = conversationManager.updateEmiState(sessionId, detected.emiParams);

      logTelemetry({
        userMessage: latestUserMessage,
        activeDomainBefore,
        detected,
        stateDecision: 'DOMAIN_SWITCH',
        propertyStateBefore,
        propertyStateAfter: propertyStateBefore,
        activeDomainAfter: 'EMI',
        retrievalDomain: 'NONE',
        resultType: 'EMI_RESULT',
        serviceCalled: 'EMI_SERVICE'
      });

      let message = "";
      let details = null;
      if (emiState.loanAmount) {
        details = calculateEmiDetails(emiState);
        const lakhStr = (details.loanAmount / 100000).toFixed(1).replace(/\.0$/, '');
        message = `For a ₹${lakhStr} Lakh loan at ${details.interestRate}% annual interest over ${details.tenureYears} years, your estimated monthly EMI is **₹${details.monthlyEmi.toLocaleString('en-IN')}/month**.\n\n- **Loan Amount**: ₹${details.loanAmount.toLocaleString('en-IN')}\n- **Interest Rate**: ${details.interestRate}% p.a.\n- **Tenure**: ${details.tenureYears} Years (${details.tenureYears * 12} months)\n- **Monthly EMI**: **₹${details.monthlyEmi.toLocaleString('en-IN')} / month**\n- **Total Interest Payable**: ₹${details.totalInterest.toLocaleString('en-IN')}\n- **Total Amount Payable**: ₹${details.totalPayment.toLocaleString('en-IN')}\n\n*Note: This calculation is based on standard reducing balance math. Actual rates depend on lender underwriting.*\n\n[Open Interactive EMI Calculator →](#emi-calculator)`;
      } else {
        message = `Sure! I can calculate your monthly EMI right here. Please share:\n1. Your required loan amount (e.g. ₹12 Lakhs)\n2. Expected interest rate (default is 8.5%)\n3. Preferred loan tenure (default is 20 years)\n\n[Open Interactive EMI Calculator →](#emi-calculator)`;
      }

      if (detected.domain === 'EMI' || detected.intent === 'EMI_QUERY' || detected.intent === 'EMI_FOLLOWUP') {
        return {
          success: true,
          requestId,
          type: 'emi_result',
          intent: detected.intent,
          message,
          content: message,
          principal: details ? details.loanAmount : null,
          annualInterestRate: details ? details.interestRate : null,
          tenureYears: details ? details.tenureYears : null,
          tenureMonths: details ? details.tenureYears * 12 : null,
          monthlyEMI: details ? details.monthlyEmi : null,
          propertyIds: [],
          properties: [],
          filters: {},
          hasMore: false,
          source: 'emi_tool'
        };
      }
    }

    // ─── ROUTE 4: LOAN ELIGIBILITY DOMAIN ────────────────────────────────────────
    if (detected.domain === 'ELIGIBILITY' || detected.intent === 'ELIGIBILITY_QUERY' || detected.intent === 'ELIGIBILITY_FOLLOWUP' || detected.intent === 'MIXED_PROPERTY_ELIGIBILITY') {
      conversationManager.setActiveDomain(sessionId, 'ELIGIBILITY');

      let effectiveEligibilityParams = detected.eligibilityParams || {};

      // If intent correction (e.g. "No, eligibility check."), extract inputs from prior user message
      if (detected.isEligibilityCorrection) {
        const userMsgs = messages.filter(m => m.role === 'user');
        if (userMsgs.length >= 2) {
          const prevUserMsg = userMsgs[userMsgs.length - 2].content;
          const reExtracted = extractEligibilityParamsFromText(prevUserMsg);
          Object.keys(reExtracted).forEach(k => {
            if (reExtracted[k] !== null && reExtracted[k] !== undefined) {
              if (effectiveEligibilityParams[k] === null || effectiveEligibilityParams[k] === undefined) {
                effectiveEligibilityParams[k] = reExtracted[k];
              }
            }
          });
        }
      }

      // If came from EMI domain follow-up (e.g. "Am I eligible for that loan?"), pull requestedLoanAmount from emiState if missing
      const session = conversationManager.getSession(sessionId);
      if (!effectiveEligibilityParams.requestedLoanAmount && session.emiState?.loanAmount) {
        effectiveEligibilityParams.requestedLoanAmount = session.emiState.loanAmount;
      }

      const elState = conversationManager.updateEligibilityState(sessionId, effectiveEligibilityParams);

      console.log('\n[ELIGIBILITY INTENT]');
      console.log(detected.intent);
      console.log('\n[ELIGIBILITY INPUTS]');
      console.log(JSON.stringify({
        monthlyIncome: elState.monthlyIncome,
        requestedLoanAmount: elState.requestedLoanAmount,
        existingEmi: elState.existingEmi,
        age: elState.age
      }, null, 2));
      console.log('\n[ELIGIBILITY SERVICE]\nCALLED');
      console.log('\n[PROPERTY SERVICE]\nNOT_CALLED');
      console.log('\n[EMI SERVICE]\nNOT_CALLED');
      console.log('\n[RESPONSE TYPE]\nELIGIBILITY_RESPONSE');

      let message = "";
      let assessment = "";
      const assumptions = [
        `Interest rate assumed at ${elState.interestRate}% p.a.`,
        `Loan tenure assumed at ${elState.tenureYears} years`,
        `FOIR (Fixed Obligation to Income Ratio) capped at 40% of monthly income`
      ];

      if (elState.monthlyIncome || elState.requestedLoanAmount) {
        const details = calculateEligibilityDetails(elState);
        const incomeStr = details.monthlyIncome ? `₹${details.monthlyIncome.toLocaleString('en-IN')}` : 'Not specified';
        const requestedLoanStr = details.requestedLoanAmount ? `₹${(details.requestedLoanAmount / 100000).toFixed(1).replace(/\.0$/, '')} Lakhs (₹${details.requestedLoanAmount.toLocaleString('en-IN')})` : 'Not specified';
        const maxLoanLakhStr = (details.maxEligibleLoan / 100000).toFixed(1).replace(/\.0$/, '');

        let statusLine = "";
        if (details.monthlyIncome && details.requestedLoanAmount) {
          if (details.requestedLoanAmount <= details.maxEligibleLoan) {
            statusLine = `Based on a gross monthly income of ${incomeStr} and a requested loan of ${requestedLoanStr}, your requested loan amount appears to be **within a reasonable preliminary affordability range** for standard lender guidelines.`;
          } else {
            statusLine = `Based on a gross monthly income of ${incomeStr}, your maximum estimated eligible loan capacity is **₹${maxLoanLakhStr} Lakhs**, which is lower than your requested amount of ${requestedLoanStr}.`;
          }
        } else if (details.monthlyIncome) {
          statusLine = `Based on a gross monthly income of ${incomeStr}, your estimated maximum eligible home loan is **₹${maxLoanLakhStr} Lakhs** (₹${details.maxEligibleLoan.toLocaleString('en-IN')}).`;
        } else {
          statusLine = `For a requested home loan of ${requestedLoanStr}, eligibility will depend on your gross monthly income, existing EMIs, and age.`;
        }

        assessment = statusLine;

        message = `### 🏦 Preliminary Home Loan Eligibility Assessment\n\n${statusLine}\n\n**Key Factors & Breakdown:**\n- **Gross Monthly Income**: ${incomeStr}\n${details.requestedLoanAmount ? `- **Requested Loan Amount**: ${requestedLoanStr}\n` : ''}- **Existing Monthly EMIs**: ₹${(details.existingEmi || 0).toLocaleString('en-IN')}\n- **Max Allowable EMI Capacity (40% FOIR Rule)**: ₹${details.availableEmi.toLocaleString('en-IN')} / month\n- **Estimated Maximum Loan Capacity**: **₹${maxLoanLakhStr} Lakhs** (₹${details.maxEligibleLoan.toLocaleString('en-IN')})\n${details.requestedLoanEmi ? `- **Estimated EMI for Requested Loan**: ₹${details.requestedLoanEmi.toLocaleString('en-IN')} / month\n` : ''}\n> **Important Note**: This is a preliminary affordability estimate based on standard 40% FOIR guidelines. Final approval depends on bank underwriting, CIBIL credit score, age, income stability, and property valuation.\n\nTo refine your estimate, please let me know if you have any existing monthly EMIs or your preferred loan tenure.\n\n[Check Detailed Eligibility on Website →](#eligibility-check)`;
      } else {
        message = `Yes! Raarya Properties has an instant Home Loan Eligibility Checker.\n\nTo estimate your home loan eligibility, please tell me:\n1. Your gross monthly salary / income (e.g. ₹1 Lakh)\n2. Requested home loan amount (e.g. ₹25 Lakhs)\n3. Any existing monthly loan EMIs (if applicable)\n\nOr check your eligibility directly using our website tool:\n\n[Check Detailed Eligibility on Website →](#eligibility-check)`;
      }

      return {
        success: true,
        requestId,
        type: 'ELIGIBILITY_RESPONSE',
        intent: detected.intent,
        message,
        content: message,
        eligibility: {
          monthlyIncome: elState.monthlyIncome,
          requestedLoanAmount: elState.requestedLoanAmount,
          existingEmi: elState.existingEmi,
          age: elState.age,
          assessment,
          assumptions
        },
        navigation: null,
        propertyIds: [],
        properties: [],
        filters: {},
        hasMore: false,
        source: 'eligibility_tool'
      };
    }

    // ─── ROUTE 5: WEBSITE / COMPANY QUERY ─────────────────────────────────────────
    if (detected.intent === 'WEBSITE_QUERY' || detected.intent === 'WEBSITE_COMPANY_QUERY' || detected.domain === 'WEBSITE') {
      conversationManager.setActiveDomain(sessionId, 'WEBSITE');

      console.log('\n[USER MESSAGE]');
      console.log(latestUserMessage);
      console.log('[ACTIVE DOMAIN BEFORE]');
      console.log(activeDomainBefore);
      console.log('[DETECTED INTENT]');
      console.log(detected.intent);
      console.log('[STATE DECISION]');
      console.log(stateDecision);
      console.log('[PROPERTY STATE BEFORE]');
      console.log(JSON.stringify(propertyStateBefore, null, 2));
      console.log('[PROPERTY PATCH]');
      console.log(JSON.stringify(detected.filters, null, 2));
      console.log('[PROPERTY STATE AFTER]');
      console.log(JSON.stringify(propertyStateBefore, null, 2));
      console.log('[ACTIVE DOMAIN AFTER]');
      console.log('WEBSITE');
      console.log('[RETRIEVAL DOMAIN]');
      console.log('WEBSITE');
      console.log('[RESULT TYPE]');
      console.log('WEBSITE_ANSWER');

      const websiteResults = websiteSearchService.search(latestUserMessage, 2);
      let message = "Raarya Properties is a premier real estate platform based in Coimbatore, Tamil Nadu. We specialize in verified DTCP & RERA approved layout plots, luxury villas, independent houses, commercial land, and student PG/hostels, while offering services like free property listings, home-loan assistance, EMI calculation, and loan eligibility checking.";

      if (detected.intent === 'WEBSITE_COMPANY_QUERY' || latestUserMessage.toLowerCase().includes('company') || latestUserMessage.toLowerCase().includes('raarya')) {
        const aboutDoc = websiteSearchService.knowledgeBase.find(d => d.id === 'about-company');
        const servicesDoc = websiteSearchService.knowledgeBase.find(d => d.id === 'services');

        const companyText = aboutDoc ? aboutDoc.content : message;

        message = `### 🏠 About Raarya Properties\n\n${companyText}\n\n**Services Provided by Raarya:**\n- **Plot & Villa Sales**: DTCP & RERA approved plots and luxury villas across Coimbatore corridors.\n- **Free Property Listing**: Post land, houses, or commercial space for sale or rent.\n- **Home Loan Assistance**: Up to 90% bank funding with partner banks (HDFC, SBI, ICICI, Axis) starting at 8.5% p.a.\n- **Tools & Calculators**: Interactive EMI Calculator and Home Loan Eligibility Checker.\n- **Assisted Site Visits**: Free accompanied site visits with complete legal title inspection.`;
      } else if (websiteResults && websiteResults.length > 0) {
        const top = websiteResults[0];
        message = `### ${top.title}\n\n${top.content}`;
      }

      // STRICT ENFORCEMENT: 0 property cards and 0 propertyRepository calls for company/website queries
      return {
        success: true,
        requestId,
        type: 'website_information',
        intent: detected.intent,
        message,
        content: message,
        sources: websiteResults.map(w => w.title),
        propertyIds: [],
        properties: [],
        filters: {},
        hasMore: false,
        source: 'website_knowledge'
      };
    }

    // ─── ROUTE 6: PROPERTY DETAIL LOOKUP ─────────────────────────────────────────
    if (detected.intent === 'PROPERTY_DETAIL' || detected.isDetailFollowup) {
      console.log(`[Chat ${requestId}] Route: PROPERTY_DETAIL`);

      let targetProp = null;
      if (detected.propertyId) {
        targetProp = propertyRepo.findById(detected.propertyId);
      } else {
        const lastProps = conversationManager.getLastResults(sessionId);
        const lowerQ = latestUserMessage.toLowerCase();
        let idx = 0;
        if (lowerQ.includes('second')) idx = 1;
        else if (lowerQ.includes('third')) idx = 2;
        else if (lowerQ.includes('fourth')) idx = 3;
        
        targetProp = lastProps[idx] || lastProps[0];
      }

      if (targetProp) {
        const message = `### Property Overview: **${targetProp.title}**\n\n- **Price**: ${targetProp.price || 'Contact for price'}\n- **Type**: ${targetProp.type === 'buy' ? 'For Sale' : targetProp.type === 'rent' ? 'For Rent' : 'PG / Hostel'} (${targetProp.subType || 'Residential'})\n- **Location**: ${targetProp.location}\n- **Extent**: ${targetProp.areaDisplay || (targetProp.area ? targetProp.area + ' sq.ft' : 'Verified Extent')}\n- **Bedrooms**: ${targetProp.beds || 'N/A'} BHK | **Bathrooms**: ${targetProp.baths || 'N/A'}\n- **Agent Contact**: ${targetProp.agentName || 'Rajkumar'} (${targetProp.agentPhone || '9787255522'})\n\n[Book a Free Site Visit](#contact)`;

        return {
          success: true,
          requestId,
          intent: 'PROPERTY_DETAIL',
          message,
          content: message,
          propertyIds: [targetProp.id],
          properties: [targetProp],
          filters: {},
          hasMore: false,
          source: 'local_property'
        };
      }
    }

    // ─── ROUTE 7: PROPERTY SEARCH & FOLLOW-UP (AUTHORITATIVE DOMAIN) ─────────────
    conversationManager.setActiveDomain(sessionId, 'PROPERTY');

    // Handle "cheaper" query
    if (detected.isCheaperQuery) {
      conversationManager.handleCheaperQuery(sessionId);
    }

    // Update Property State using Patch & Merge
    const propertyStateAfter = conversationManager.updatePropertyState(
      sessionId,
      detected.filters,
      detected.isNewSearch
    );

    // LOG REQUIRED DEBUG STATEMENTS
    console.log('\n[USER MESSAGE]');
    console.log(latestUserMessage);
    console.log('[ACTIVE DOMAIN BEFORE]');
    console.log(activeDomainBefore);
    console.log('[DETECTED INTENT]');
    console.log(detected.intent);
    console.log('[STATE DECISION]');
    console.log(stateDecision);
    console.log('[PROPERTY STATE BEFORE]');
    console.log(JSON.stringify(propertyStateBefore, null, 2));
    console.log('[PROPERTY PATCH]');
    console.log(JSON.stringify(detected.filters, null, 2));
    console.log('[PROPERTY STATE AFTER]');
    console.log(JSON.stringify(propertyStateAfter, null, 2));
    console.log('[ACTIVE DOMAIN AFTER]');
    console.log('PROPERTY');
    console.log('[RETRIEVAL DOMAIN]');
    console.log('PROPERTY');
    console.log('[RESULT TYPE]');
    console.log('PROPERTY_RESULTS');

    // Check if message is a budget opinion (e.g. "That's a bit high for me") without providing an explicit new budget number
    const isOpinionNoNumber = detected.isBudgetOpinion && !detected.filters.maxPrice;
    if (isOpinionNoNumber) {
      const currentBhk = propertyStateAfter.bedrooms ? `${propertyStateAfter.bedrooms} BHK ` : '';
      const currentType = (propertyStateAfter.propertyType || 'apartment').toLowerCase();
      const currentLoc = propertyStateAfter.locality ? ` in ${propertyStateAfter.locality}` : propertyStateAfter.city ? ` in ${propertyStateAfter.city}` : '';
      
      const message = `Sure — what target budget would you like me to set for your ${currentBhk}${currentType} search${currentLoc}? (e.g. ₹65 Lakhs)`;

      return {
        success: true,
        requestId,
        type: 'local_conversation',
        intent: 'PROPERTY_FOLLOWUP',
        message,
        content: message,
        propertyIds: [],
        properties: [],
        filters: propertyStateAfter,
        hasMore: false,
        source: 'local'
      };
    }

    // Pagination offset for SHOW_MORE
    let currentOffset = propertyStateAfter.offset || 0;
    if (detected.intent === 'PROPERTY_SHOW_MORE') {
      currentOffset += 8;
      propertyStateAfter.offset = currentOffset;
    }

    // Execute Deterministic Property Repository Search
    const searchResult = propertyRepo.search(propertyStateAfter, latestUserMessage, 8, currentOffset);

    // Handle 0 match case while PRESERVING propertyState intact
    if (searchResult.total === 0) {
      const bhkStr = propertyStateAfter.bedrooms ? `${propertyStateAfter.bedrooms} BHK ` : '';
      const typeStr = (propertyStateAfter.propertyType || 'property').toLowerCase();
      const locStr = propertyStateAfter.locality ? `in ${propertyStateAfter.locality}` : propertyStateAfter.city ? `in ${propertyStateAfter.city}` : '';
      const priceStr = propertyStateAfter.maxPrice ? ` within ₹${(propertyStateAfter.maxPrice / 100000).toFixed(1).replace(/\.0$/, '')} Lakh` : '';

      const noMatchMsg = `I couldn't find any verified ${bhkStr}${typeStr}s ${locStr}${priceStr} in our current inventory. Would you like me to try nearby locations or adjust the budget?`;

      return {
        success: true,
        requestId,
        type: 'property_results',
        intent: detected.intent,
        message: noMatchMsg,
        content: noMatchMsg,
        propertyIds: [],
        properties: [],
        filters: propertyStateAfter,
        hasMore: false,
        source: 'local_property_search'
      };
    }

    // Save displayed property results for index references
    conversationManager.setLastResults(sessionId, searchResult.properties.slice(0, 8), currentOffset);

    // Generate Grounded AI Response
    const websiteResults = websiteSearchService.search(latestUserMessage, 2);
    const rawAiResp = await geminiService.generateResponse(
      messages,
      searchResult.properties,
      websiteResults,
      detected.intent,
      propertyStateAfter
    );

    const validated = jsonSchemaValidator.validateAndSanitize(
      rawAiResp,
      detected.intent,
      searchResult.properties
    );

    let resolvedProperties = [];
    if (Array.isArray(validated.propertyIds) && validated.propertyIds.length > 0) {
      resolvedProperties = validated.propertyIds
        .map(id => propertyRepo.findById(id))
        .filter(Boolean);
    }

    if (resolvedProperties.length === 0 && searchResult.properties.length > 0) {
      resolvedProperties = searchResult.properties.slice(0, 8);
      validated.propertyIds = resolvedProperties.map(p => p.id);
    }

    resolvedProperties = deduplicateProperties(resolvedProperties);

    const totalMatches = searchResult.total;
    const navTab = propertyStateAfter.transactionType === 'RENT' ? 'rent' : 'buy';
    
    // Extract target locality or area keyword for Buy/Rent page search filter
    let searchLocality = '';

    // 1. Check if propertyStateAfter has a specific locality (not equal to 'Coimbatore')
    if (propertyStateAfter.locality && propertyStateAfter.locality.toLowerCase() !== 'coimbatore') {
      searchLocality = propertyStateAfter.locality;
    }

    // 2. Check latestUserMessage for specific location names (excluding 'coimbatore')
    if (!searchLocality && latestUserMessage) {
      const knownLocations = [
        'singanallur', 'sulur', 'ondipudur', 'peelamedu', 'gandhipuram', 'vadamadurai',
        'thudiyalur', 'hopes', 'ramanathapuram', 'saibaba colony', 'ganapathy', 'saravanampatti',
        'annur', 'kinathukadavu', 'karumathampatti', 'sirumugai', 'thekkalur',
        'avinashi', 'kaniyur', 'kovaipudur', 'kurumbapalayam', 'kittampalayam', 'vadavalli',
        'mettupalayam', 'karanampettai', 'arasur', 'tiruppur', 'erode', 'karamadai', 'sevur'
      ];
      const lowerMsg = latestUserMessage.toLowerCase();
      const foundLoc = knownLocations.find(l => lowerMsg.includes(l));
      if (foundLoc) {
        searchLocality = foundLoc.charAt(0).toUpperCase() + foundLoc.slice(1);
      }
    }

    // 3. Fallback: extract specific locality from first resolved property's location string
    if (!searchLocality && resolvedProperties.length > 0 && resolvedProperties[0].location) {
      const locStr = resolvedProperties[0].location;
      const firstPart = locStr.split(',')[0].trim();
      const cleanLoc = firstPart.split('-')[0].trim();
      if (cleanLoc && cleanLoc.toLowerCase() !== 'coimbatore') {
        searchLocality = cleanLoc;
      }
    }

    const searchParam = searchLocality ? `?search=${encodeURIComponent(searchLocality)}` : '';

    if (totalMatches > 8) {
      validated.message += `\n\n🔍 **I found ${totalMatches} matching properties.** Here are 8 to get you started. [View all ${totalMatches} matching properties in our ${navTab === 'rent' ? 'Rent' : 'Buy'} section →](#${navTab}${searchParam})`;
    } else if (totalMatches > 0 && searchLocality) {
      validated.message += `\n\n🔍 **I found ${totalMatches} matching properties.** [View all ${totalMatches} matching properties in our ${navTab === 'rent' ? 'Rent' : 'Buy'} section →](#${navTab}${searchParam})`;
    }

    // Append EMI calculation for mixed queries
    if (detected.isEmiQuery || detected.intent === 'MIXED_PROPERTY_EMI') {
      const emiState = conversationManager.updateEmiState(sessionId, detected.emiParams);
      if (!emiState.loanAmount && resolvedProperties.length > 0 && resolvedProperties[0].priceNumeric) {
        emiState.loanAmount = resolvedProperties[0].priceNumeric;
      }
      if (emiState.loanAmount) {
        const details = calculateEmiDetails(emiState);
        validated.message += `\n\n---\n### 📊 Estimated EMI for ${resolvedProperties[0]?.title || 'Property Search'}\n- **Estimated Loan Amount**: ₹${details.loanAmount.toLocaleString('en-IN')}\n- **Estimated Monthly EMI**: **₹${details.monthlyEmi.toLocaleString('en-IN')} / month** (${details.interestRate}% for ${details.tenureYears} years)\n\n[Open Interactive EMI Calculator →](#emi-calculator)`;
      }
    }

    const finalResponse = {
      success: true,
      requestId,
      type: 'property_results',
      intent: validated.intent,
      message: validated.message,
      content: validated.message,
      propertyIds: validated.propertyIds,
      properties: resolvedProperties,
      filters: propertyStateAfter,
      totalMatches,
      hasMore: searchResult.hasMore,
      navTarget: navTab,
      source: 'local_property_search'
    };

    if (finalResponse.type !== 'property_results' && finalResponse.type !== 'PROPERTY_RESULTS') {
      finalResponse.properties = [];
    }

    return finalResponse;
  }
}

export const chatOrchestrator = new ChatOrchestrator();
