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

    return `You are Raarya AI, an exceptionally intelligent, multilingual, and empathetic conversational assistant (powered by state-of-the-art LLM intelligence, just like ChatGPT) representing Raarya Properties / Raarya Groups in Coimbatore, Tamil Nadu.

CORE MULTILINGUAL INTELLIGENCE (CRITICAL):
You have native mastery of THREE communication modes:
1. **Tamil (தமிழ் Script)**:
   - If the user asks in Tamil (e.g., "வணக்கம்", "சரவணம்பட்டியில் பிளாட் இருக்கா?", "DTCP மற்றும் RERA வித்தியாசம் என்ன?", "ஒரு ஜோக் சொல்லு"):
   - Reply in pure, respectful, fluent Tamil script (e.g., "வணக்கம்! நான் ரார்யா AI. கோவையில் உங்கள் கனவு இல்லம் அல்லது பிளாட் தேர்ந்தெடுக்க நான் உதவுகிறேன்...").
2. **Tanglish (Tamil typed in English / Roman Script)**:
   - If the user queries in Tanglish (e.g., "Vanakkam bro", "Saravanampatti la plots irukka?", "Eppadi irukinga?", "Annur la 30 lakhs kulla villas kaatunga", "Oru siripaana joke sollu"):
   - Reply in natural, friendly, fluent Tanglish (e.g., "Vanakkam! Naan romba nalla irukken! Raarya-la ungalukku eppadi help pannattum? Saravanampatti-la top DTCP approved plots list kizhaye kaatren paarunga!").
3. **English**:
   - If the user queries in English, reply in articulate, professional, and engaging English.

CONVERSATIONAL BEHAVIOR (Like ChatGPT):
1. **Natural Chat & Chit-Chat**:
   - Greetings, jokes, identity questions ("who created you", "how are you", "joke sollu", "eppadi irukinga", "vanakkam"): Respond naturally and delightfully.
   - Do NOT attach property listings for casual chat! Keep \`"propertyIds": []\`.
2. **Real Estate Advice & Knowledge**:
   - For queries on DTCP vs RERA, guideline values, loan EMIs, legal verification, or Coimbatore neighborhood insights: provide structured, comprehensive, and helpful answers in the user's chosen language.
3. **Property Search**:
   - When searching for plots, villas, lands, flats, budget, or locations (e.g., Saravanampatti, Annur, Singanallur, Karumathampatti, Mettupalayam, Avinashi):
   - Summarize the best matches in the chosen language and output their IDs in \`"propertyIds"\` so visual cards render.
   - If no properties match, explain politely in their language and recommend nearby Coimbatore corridors.

RESPONSE FORMAT (Strict JSON):
{
  "intent": "GENERAL_CONVERSATION | PROPERTY_SEARCH | ADVICE | WEBSITE_QUERY",
  "message": "Your fluent markdown response in the matching language (Tamil, Tanglish, or English).",
  "filters": {},
  "propertyIds": ["prop-1", "prop-2"], // ONLY when returning actual matching property cards
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
    const cleanQ = q.replace(/[^\w\s\u0B80-\u0BFF]/g, '').trim();

    // Detect language mode
    const isTamilScript = /[\u0B80-\u0BFF]/.test(userMessage);
    const isTanglish = (
      cleanQ.includes('vanakkam') || cleanQ.includes('eppadi') || cleanQ.includes('nalama') ||
      cleanQ.includes('irukka') || cleanQ.includes('venum') || cleanQ.includes('kaatunga') ||
      cleanQ.includes('sollunga') || cleanQ.includes('vilai') || cleanQ.includes('edam') ||
      cleanQ.includes('nandri') || cleanQ.includes('pathi') || cleanQ.includes('kadhai') ||
      cleanQ.includes('siripu') || cleanQ.includes('kadi')
    );

    // 1. Check for casual conversation / greetings / jokes
    const isJoke = cleanQ.includes('joke') || cleanQ.includes('kadi') || cleanQ.includes('siripu') || cleanQ.includes('ஜோக்') || cleanQ.includes('கதை');
    const isGreeting = (
      cleanQ.includes('how are you') || cleanQ.includes('how r u') ||
      cleanQ.includes('who are you') || cleanQ.includes('what can you do') ||
      cleanQ === 'hi' || cleanQ === 'hello' || cleanQ === 'hey' || cleanQ === 'namaste' ||
      cleanQ.includes('vanakkam') || cleanQ.includes('வணக்கம்') || cleanQ.includes('eppadi') || cleanQ.includes('nalama') ||
      isJoke
    );

    if (isGreeting || intent === 'GENERAL_CONVERSATION' || intent === 'GREETING' || intent === 'LOCAL_CONVERSATION') {
      let message = "Hello! 👋 I'm doing great, thank you! I am **Raarya AI**, your intelligent assistant for all real estate inquiries in Coimbatore. How can I help you today?";
      
      if (isTamilScript) {
        if (isJoke) {
          message = "ஏன் ரியல் எஸ்டேட் ஏஜென்ட்க்கு எப்பவும் நண்பர்கள் அதிகம்? \n\nஏன்னா அவங்களுக்கு மட்டும்தான் உங்க வாழ்க்கைக்கு சரியான இடத்தை (space) எப்படி அமைத்துக் கொடுப்பது என்று தெரியும்! 😄🏠\n\nகோவையில் உங்களுக்கு தேவையான பிளாட் அல்லது வில்லா பற்றி பேசலாமா?";
        } else {
          message = "வணக்கம்! 🙏 நான் **ரார்யா AI (Raarya AI)**. கோவையில் உள்ள சிறந்த DTCP & RERA அங்கீகரிக்கப்பட்ட பிளாட்டுகள், வில்லாக்கள், மற்றும் மனை முதலீடு பற்றிய அனைத்து தகவல்களையும் தெரிந்துகொள்ள நான் உங்களுக்கு உதவுகிறேன். \n\nஇன்று உங்களுக்கு எவ்வாறு உதவட்டும்?";
        }
      } else if (isTanglish) {
        if (isJoke) {
          message = "Oru real estate agent-ku yen friends adhigam theriyuma? \n\nBecause avangalukku dhaan unga life-ku correct-aana space epdi arrange pannanum-nu theriyum! 😄🏠\n\nCoimbatore-la plots or villas pathi edhavadhu therinjikka venuma bro?";
        } else {
          message = "Vanakkam! 🙏 Naan romba nalla irukken! Naan dhaan **Raarya AI**. \n\nCoimbatore-la Saravanampatti, Annur, Singanallur matrum Avinashi Road-la irukkira top DTCP/RERA plots, villas & loan EMI calculation pathi ungalukku help panna naan ready! \n\nUngalukku enna details venum bro?";
        }
      } else {
        if (isJoke) {
          message = "Why do real estate agents make great friends? Because they always know how to find the right space for you! 😄 How can I assist you with your property plans today?";
        } else if (cleanQ.includes('who are you') || cleanQ.includes('what can you do')) {
          message = "I am **Raarya AI**, an intelligent conversational assistant. You can chat with me naturally in **English, Tamil (தமிழ்), or Tanglish** about:\n- 📍 **DTCP & RERA Approved Plots & Villas** in Coimbatore (Saravanampatti, Annur, etc.)\n- 💰 **Home Loan EMI Calculations & Eligibility**\n- 📜 **Real Estate Regulations & Advice**\n- 🏢 **Company Information & Careers at Raarya**\n\nWhat would you like to explore today?";
        }
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
      let leadMsg = `Here are verified properties matching your query in Coimbatore:`;
      if (isTamilScript) {
        leadMsg = `நீங்கள் கேட்ட இடத்திற்கு ஏற்ற சரிபார்க்கப்பட்ட சிறந்த சொத்துக்கள் இதோ:`;
      } else if (isTanglish) {
        leadMsg = `Neenga keta area-la irukkira top verified properties list idho paarunga:`;
      }

      const summaryList = retrievedProperties.slice(0, 5).map((p, i) => `${i + 1}. **${p.title}** — ₹${p.price || 'Contact for price'} | ${p.location}`).join('\n');
      return {
        success: true,
        intent: intent || 'PROPERTY_SEARCH',
        message: `${leadMsg}\n\n${summaryList}\n\n${isTamilScript ? 'முழு விவரங்கள் மற்றும் புகைப்படங்களை கீழே உள்ள கார்டுகளில் பார்க்கலாம்.' : isTanglish ? 'Complete details & photos kizhaye irukkira interactive cards-la paarkalam.' : 'Explore the interactive property cards below for complete details, images, and to book a free site visit.'}`,
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
