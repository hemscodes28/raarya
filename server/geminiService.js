import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GeminiService {
  constructor() {
    this.defaultModels = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];
    this.ensureEnvLoaded();
  }

  ensureEnvLoaded() {
    if (!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEYS) {
      try {
        const envPath = path.resolve(__dirname, '..', '.env');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          envContent.split(/\r?\n/).forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;
            const idx = trimmed.indexOf('=');
            if (idx !== -1) {
              const k = trimmed.substring(0, idx).trim();
              let v = trimmed.substring(idx + 1).trim();
              if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
                v = v.substring(1, v.length - 1);
              }
              if (!process.env[k]) process.env[k] = v;
            }
          });
        }
      } catch (e) {
        console.warn('[GeminiService] Could not auto-load .env file:', e.message);
      }
    }
  }

  getApiKeys() {
    this.ensureEnvLoaded();
    const rawKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
    const keys = rawKeys.split(',').map(k => k.trim()).filter(Boolean);
    return keys.length > 0 ? keys : [];
  }

  buildSystemPrompt(retrievedProperties = [], retrievedWebsite = [], contextFilters = {}) {
    let propContext = '';
    if (retrievedProperties && retrievedProperties.length > 0) {
      propContext = 'ACTUAL RETRIEVED PROPERTY RECORDS FROM LOCAL DATABASE (AUTHORITATIVE SOURCE OF TRUTH):\n' +
        retrievedProperties.map((p) => {
          return `Property ID: "${p.id}"
Title: ${p.title}
Price: ${p.price || 'Contact for price'}
Location: ${p.location}
Type: ${p.type === 'buy' ? 'For Sale' : p.type === 'rent' ? 'For Rent' : 'PG / Hostel'}
SubType: ${p.subType || 'Plot'}
Beds: ${p.beds || 'N/A'} | Baths: ${p.baths || 'N/A'} | Area: ${p.areaDisplay || (p.area ? p.area + ' sq.ft' : 'Verified Extent')}
Amenities: ${(p.amenities || []).join(', ') || 'DTCP/RERA Approved'}
Agent: ${p.agentName || 'Rajkumar'} (${p.agentPhone || '9787255522'})
---`;
        }).join('\n');
    }

    let webContext = '';
    if (retrievedWebsite && retrievedWebsite.length > 0) {
      webContext = '\nRETRIEVED WEBSITE & COMPANY KNOWLEDGE:\n' +
        retrievedWebsite.map(w => `[${w.title} (${w.category})]:\n${w.content}`).join('\n\n');
    }

    return `You are Raarya AI, a highly intelligent, empathetic, and communicative AI conversational assistant (powered by state-of-the-art LLM intelligence, just like ChatGPT) representing Raarya Properties / Raarya Groups in Coimbatore, Tamil Nadu.

CORE BEHAVIOR & CONVERSATIONAL PRINCIPLES:
1. **NATURAL & COMMUNICATIVE (Like ChatGPT)**:
   - When the user engages in normal conversation, greetings ("how are you", "hello", "who created you", "tell me a joke", "what is your purpose", "how was your day?"), respond naturally, warmly, smartly, and conversationally.
   - When the user asks general questions, real estate market questions, advice ("difference between DTCP and RERA", "guidance on home loan EMIs", "best investment zones in Coimbatore", "overview of Saravanampatti or Annur"), provide comprehensive, articulate, structured, and insightful answers.
   - Do NOT force property cards or dump random property listings when the user is simply chatting or asking a non-search question! Set \`"propertyIds": []\` for conversational/general questions.

2. **PROPERTY SEARCH & LISTINGS**:
   - When the user explicitly searches for properties, plots, villas, flats, lands, locations, budgets, or bedrooms (and retrieved records are provided below):
     - Give a friendly summary of matching options, highlight key features (title, price, location, approvals, size), and include their exact IDs in the \`"propertyIds"\` array so the interactive property cards render.
   - If the user asks for properties and NO matching records are in the database, politely explain that no exact match is available in inventory and offer helpful alternatives (e.g. relaxing budget or nearby areas).

3. **RESPONSE FORMAT**:
   Always reply in valid, clean JSON with this exact schema:
{
  "intent": "GENERAL_CONVERSATION | PROPERTY_SEARCH | ADVICE | WEBSITE_QUERY",
  "message": "Your fluent, well-formatted markdown message to display to the user.",
  "filters": {},
  "propertyIds": ["prop-1", "prop-2"], // ONLY populate when presenting actual matching property listings. For casual talk, chit-chat, or general advice, keep this empty []
  "sources": ["gemini_ai"]
}

${propContext ? '\n' + propContext : ''}
${webContext ? '\n' + webContext : ''}
`;
  }

  async generateResponse(messages, retrievedProperties = [], retrievedWebsite = [], intent = 'GENERAL_CONVERSATION', filters = {}) {
    this.ensureEnvLoaded();
    const keys = this.getApiKeys();
    const systemPrompt = this.buildSystemPrompt(retrievedProperties, retrievedWebsite, filters);

    const contents = messages.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    if (keys.length > 0) {
      const modelsToTry = [
        (process.env.GEMINI_MODEL || '').trim(),
        ...this.defaultModels
      ].filter(Boolean);

      // Try keys and models with automatic rotation
      for (const apiKey of keys) {
        for (const model of modelsToTry) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 25000);

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: contents,
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.7,
                  maxOutputTokens: 2500
                }
              }),
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
              const data = await response.json();
              const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (rawText) {
                const parsed = this.parseGeminiJson(rawText, intent, retrievedProperties);
                if (parsed) return parsed;
              }
            } else {
              const status = response.status;
              if (status === 404 || status === 429) {
                // Try next model or next key
                continue;
              }
            }
          } catch (err) {
            console.warn(`[GeminiService] Attempt with model ${model} failed:`, err.message);
          }
        }
      }
    }

    console.warn('[GeminiService] Live API unavailable or quota exhausted. Employing smart conversational fallback.');
    return this.generateOfflineFallbackResponse(messages[messages.length - 1]?.content || '', retrievedProperties, retrievedWebsite, intent, filters);
  }

  parseGeminiJson(rawText, intent, retrievedProperties) {
    try {
      let cleaned = rawText.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(cleaned);
      
      let propertyIds = [];
      if (Array.isArray(parsed.propertyIds)) {
        propertyIds = parsed.propertyIds.map(String).filter(Boolean);
      }

      return {
        success: true,
        intent: parsed.intent || intent,
        message: parsed.message || 'I am happy to assist you!',
        filters: parsed.filters || {},
        propertyIds: propertyIds,
        sources: parsed.sources || ['gemini_ai']
      };
    } catch (err) {
      return {
        success: true,
        intent: intent,
        message: rawText.replace(/```json/g, '').replace(/```/g, '').trim(),
        filters: {},
        propertyIds: [],
        sources: ['gemini_ai']
      };
    }
  }

  generateOfflineFallbackResponse(userMessage, retrievedProperties, retrievedWebsite, intent, filters) {
    const q = (userMessage || '').toLowerCase().trim();
    const cleanQ = q.replace(/[^\w\s]/g, '').trim();

    // 1. Check for casual conversation / greetings
    const isCasual = (
      cleanQ.includes('how are you') || cleanQ.includes('how r u') ||
      cleanQ.includes('who are you') || cleanQ.includes('what can you do') ||
      cleanQ === 'hi' || cleanQ === 'hello' || cleanQ === 'hey' || cleanQ === 'namaste' ||
      cleanQ.includes('joke') || cleanQ.includes('help')
    );

    if (isCasual || intent === 'GENERAL_CONVERSATION' || intent === 'GREETING' || intent === 'LOCAL_CONVERSATION') {
      let message = "Hello! 👋 I'm doing great, thank you! I am **Raarya AI**, your intelligent assistant for all real estate inquiries in Coimbatore. How can I help you today?";
      if (cleanQ.includes('joke')) {
        message = "Why do real estate agents make great friends? Because they always know how to find the right space for you! 😄 How can I assist you with your property plans today?";
      } else if (cleanQ.includes('who are you') || cleanQ.includes('what can you do')) {
        message = "I am **Raarya AI**, an intelligent conversational assistant. You can chat with me naturally about:\n- 📍 **DTCP & RERA Approved Plots & Villas** in Coimbatore (Saravanampatti, Annur, etc.)\n- 💰 **Home Loan EMI Calculations & Eligibility**\n- 📜 **Real Estate Regulations & Advice**\n- 🏢 **Company Information & Careers at Raarya**\n\nWhat would you like to explore today?";
      }
      return {
        success: true,
        intent: 'GENERAL_CONVERSATION',
        message,
        filters: {},
        propertyIds: [],
        sources: ['conversational_engine']
      };
    }

    // 2. If properties are found and user asked for properties
    if (retrievedProperties && retrievedProperties.length > 0) {
      const summaryList = retrievedProperties.slice(0, 5).map((p, i) => `${i + 1}. **${p.title}** — ₹${p.price || 'Contact for price'} | ${p.location}`).join('\n');
      return {
        success: true,
        intent: intent || 'PROPERTY_SEARCH',
        message: `Here are verified properties matching your query in Coimbatore:\n\n${summaryList}\n\nExplore the interactive property cards below for complete details, images, and to book a free site visit.`,
        filters: filters,
        propertyIds: retrievedProperties.map(p => p.id),
        sources: ['property_data']
      };
    }

    // 3. Website Query Match
    if (retrievedWebsite && retrievedWebsite.length > 0) {
      const topWeb = retrievedWebsite[0];
      return {
        success: true,
        intent: intent || 'WEBSITE_QUERY',
        message: `### ${topWeb.title}\n\n${topWeb.content}`,
        filters: {},
        propertyIds: [],
        sources: ['website_data']
      };
    }

    return {
      success: true,
      intent: 'GENERAL_CONVERSATION',
      message: "I am here to help you! Feel free to ask me anything about properties in Coimbatore, layout plots, home loan EMIs, or chat with me naturally.",
      filters: {},
      propertyIds: [],
      sources: ['conversational_engine']
    };
  }
}

export const geminiService = new GeminiService();
