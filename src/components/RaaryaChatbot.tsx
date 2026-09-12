import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  Send,
  Trash2,
  X,
  ArrowLeft,
  Plus,
  MapPin,
  Calculator,
  Building,
  Briefcase,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCw
} from 'lucide-react';
import { apiChat } from '../utils/api';
import { PROPERTIES, PropertyListing } from '../constants';
import { PropertyCard } from './PropertyCard';
import { PropertyDetailModal } from './PropertyDetailModal';

interface RaaryaChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  content: string;
  type?: string;
  properties?: PropertyListing[];
  propertyIds?: string[];
  sources?: string[];
  intent?: string;
}

const PROMPT_CARDS = [
  {
    icon: MapPin,
    title: 'Plots in Saravanampatti & Annur',
    subtitle: 'Search DTCP & RERA approved layout plots with clear titles.',
    prompt: 'Properties in Saravanampatti and Annur'
  },
  {
    icon: Calculator,
    title: 'Calculate Home Loan EMI',
    subtitle: 'Get instant monthly EMI calculations & bank loan assistance.',
    prompt: 'Calculate home loan EMI for 35 lakhs'
  },
  {
    icon: Building,
    title: 'List Your Property on Raarya',
    subtitle: 'Learn how to post your land, house, or villa listing.',
    prompt: 'How to list my property on Raarya'
  },
  {
    icon: Briefcase,
    title: 'Careers & Job Openings',
    subtitle: 'Explore active sales & marketing executive positions.',
    prompt: 'Careers at Raarya Groups'
  }
];

const CRISPY_QUOTES = [
  "Let's noodle",
  "Where to next?",
  "Let's find your dream space.",
  "What shall we build today?",
  "Ready to explore prime properties?",
  "What's on your mind today?",
  "Let's turn your vision into an address.",
  "How can I assist your property journey?",
  "Let's discover your next home.",
  "What can I solve for you today?",
  "Looking for DTCP & RERA layout plots?",
  "Let's calculate your home loan EMI.",
  "Where would you like to live next?",
  "Let's find the location that feels right.",
  "Ready to invest in prime land?",
  "What property insights do you need?",
  "Let's map out your real estate goals.",
  "Ready to discover Saravanampatti & Annur plots?",
  "Let's find your perfect villa plot.",
  "How can Raarya AI assist you today?",
  "Let me help you build your future.",
  "Searching for verified property listings?",
  "Let's compare layout prices and EMI options.",
  "Ready to list your property on Raarya?",
  "Let's explore exclusive land opportunities.",
  "What's your dream location in Coimbatore?",
  "Let's simplify your home buying journey.",
  "Ask me anything about land, plots & villas.",
  "Ready to start a new conversation?",
  "Let's calculate home loan eligibility.",
  "Where should your next chapter begin?",
  "Let's find clear-titled layout plots.",
  "Looking for independent rental houses?",
  "Let's estimate your monthly installment.",
  "Ready to explore sales & career openings?",
  "Let's find peace of mind in real estate.",
  "What real estate question is on your mind?",
  "Let's locate DTCP approved layout plots.",
  "Ready to make a smart property move?",
  "Let's discover Gated Community plots.",
  "How can I make your search effortless?",
  "Let's find your sanctuary.",
  "Ready to explore Saravanampatti plots?",
  "Let's check property rates and trends.",
  "Where innovation meets luxury living.",
  "Let's calculate your ideal budget.",
  "Ready to discover Annur land listings?",
  "Let's find the best plot for your family.",
  "What real estate deal can I find for you?",
  "Let's make property search delightful.",
  "Ready for verified land recommendations?",
  "Let's discover prime commercial & residential plots.",
  "What location are you curious about?",
  "Let's calculate loan tenure and interest.",
  "Ready to post your property listing?",
  "Let's find plots near top schools & tech parks.",
  "What property feature matters most to you?",
  "Let's explore Coimbatore's growth corridors.",
  "Ready to find high-return land investments?",
  "Let's make home buying transparent & simple.",
  "What type of property are you seeking today?",
  "Let's discover villa plots with clear titles.",
  "Ready to calculate your monthly EMI?",
  "Let's find serviced PG & hostel stays.",
  "What's your preferred property budget?",
  "Let's navigate the property market together.",
  "Ready to find your ideal living space?",
  "Let's turn questions into clear answers.",
  "What property location would you love to see?",
  "Let's check RERA approval & plot dimensions.",
  "Ready to explore premium real estate?",
  "Let's find plots with 100% clear legal titles.",
  "What real estate advice do you need?",
  "Let me help you find the right neighborhood.",
  "Ready to plan your real estate investment?",
  "Let's calculate your loan repayment schedule.",
  "What plot size fits your vision?",
  "Let's discover peaceful residential layouts.",
  "Ready to explore career opportunities at Raarya?",
  "Let's find affordable luxury plots today.",
  "What property topic can we dive into?",
  "Let's compare Saravanampatti vs Annur plots.",
  "Ready to get instant property estimates?",
  "Let's find your ideal corner plot.",
  "What real estate guidance can I provide?",
  "Let's locate prime spots near Avinashi Road.",
  "Ready to build your dream villa?",
  "Let's make property discovery seamless.",
  "What property price range are you targeting?",
  "Let's find Gated Layouts with top amenities.",
  "Ready to take the next step in property?",
  "Let's calculate bank loan approval chances.",
  "What real estate query can I solve for you?",
  "Let's discover plots with 30ft & 40ft blacktop roads.",
  "Ready to find your forever home site?",
  "Let's explore verified land deals in Coimbatore.",
  "What property details would you like to review?",
  "Let's find clear-title plots with street lights & water connection.",
  "Ready to chat with Raarya AI?",
  "Let's find your perfect piece of earth."
];

export function RaaryaChatbot({ isOpen, onClose }: RaaryaChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<number, 'up' | 'down'>>({});
  const [selectedPropertyModal, setSelectedPropertyModal] = useState<PropertyListing | null>(null);
  const sessionIdRef = useRef<string>('sess_' + Math.random().toString(36).substring(2, 10));
  const [currentQuote, setCurrentQuote] = useState(() => 
    CRISPY_QUOTES[Math.floor(Math.random() * CRISPY_QUOTES.length)]
  );

  const isSendingRef = useRef<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const freshTextareaRef = useRef<HTMLTextAreaElement>(null);
  const activeTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea dynamically like Claude AI
  const adjustTextareaHeight = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    const scrollHeight = el.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, 48), 260);
    el.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    adjustTextareaHeight(freshTextareaRef.current);
    adjustTextareaHeight(activeTextareaRef.current);
  }, [inputValue, messages, isOpen]);

  // Pick a fresh quote whenever the chatbot is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentQuote(CRISPY_QUOTES[Math.floor(Math.random() * CRISPY_QUOTES.length)]);
    }
  }, [isOpen]);

  // Lock background body scroll when chatbot modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle closing when ESC is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close chatbot when a hash link custom event is fired
  useEffect(() => {
    const handleCloseEvent = () => onClose();
    window.addEventListener('close-chatbot', handleCloseEvent);
    return () => window.removeEventListener('close-chatbot', handleCloseEvent);
  }, [onClose]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading || isSendingRef.current) return;

    isSendingRef.current = true;
    if (!textToSend) setInputValue('');

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await apiChat(newMessages, sessionIdRef.current);
      if (response.success) {
        let matchedProps: PropertyListing[] = [];
        if (Array.isArray(response.properties) && response.properties.length > 0) {
          matchedProps = response.properties;
        } else if (Array.isArray(response.propertyIds) && response.propertyIds.length > 0) {
          matchedProps = response.propertyIds
            .map(id => PROPERTIES.find(p => p.id === id))
            .filter(Boolean) as PropertyListing[];
        }

        setMessages(prev => [
          ...prev,
          {
            role: 'model',
            content: response.message || response.content || 'I found matching information for your request.',
            type: response.type || (matchedProps.length > 0 ? 'property_results' : 'text'),
            properties: matchedProps,
            propertyIds: response.propertyIds,
            sources: response.sources,
            intent: response.intent || (matchedProps.length > 0 ? 'NEW_PROPERTY_SEARCH' : '')
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'model',
            content: response.message || 'I encountered an issue connecting to the chat service. Please try again.'
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: 'An unexpected error occurred. Please try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    sessionIdRef.current = 'sess_' + Math.random().toString(36).substring(2, 10);
    setCurrentQuote(CRISPY_QUOTES[Math.floor(Math.random() * CRISPY_QUOTES.length)]);
  };

  const handleCopyText = (index: number, text: string) => {
    navigator.clipboard.writeText(text.replace(/\*\*/g, '').replace(/#+/g, ''));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleFeedback = (index: number, type: 'up' | 'down') => {
    setFeedbackState(prev => ({ ...prev, [index]: type }));
  };

  // Claude-Style Markdown text formatter
  const formatMarkdown = (text: string) => {
    if (!text) return '';

    // 0. Cleanly remove any leaked hex attribute artifacts like 22211F]">, 22211F], 22211F">, or raw HTML tags
    let cleanedText = text
      .replace(/\[?#?[A-Fa-f0-9]{6}\]?"?>*/g, '')
      .replace(/\b[A-Fa-f0-9]{6}\]?"?>*/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/^#{1,6}\s*(.*)$/gm, '**$1**')
      .replace(/#+/g, '');

    // 1. Safe escaping of HTML characters to prevent XSS
    let formatted = cleanedText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 2. Bold tags: **text** -> <strong class="font-semibold">$1</strong> (Inherits container text color)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');

    // 3. Handle unclosed bracket links like "[View all X matching properties in our Buy/Rent/PG section →"
    formatted = formatted.replace(
      /\[(View all \d+ matching properties in our (Buy|Rent|PG & Hostel|PG\/Hostel|PG) section\s*→?)(?!\()/gi,
      (_, label, section) => {
        const secLower = section.toLowerCase();
        const route = secLower.includes('pg') ? '#pg-hostel' : secLower === 'rent' ? '#rent' : '#buy';
        return `[${label}](${route})`;
      }
    );

    // 4. Markdown links: [label](url) -> <a href="javascript:void(0)" data-target-route="url" class="...">label</a>
    formatted = formatted.replace(
      /\[(.*?)\]\((.*?)\)/g,
      (_, label, url) => {
        const cleanLabel = label.replace(/^#/, '').trim();
        const targetUrl = url.includes('preset-sites') ? '#buy' : (url.startsWith('#') ? url : `#${url}`);
        const arrow = cleanLabel.includes('→') ? '' : ' →';
        return `<a href="javascript:void(0)" data-target-route="${targetUrl}" class="font-bold text-[#D97757] hover:text-[#C8654B] underline underline-offset-4 decoration-[#D97757]/50 hover:decoration-[#C8654B] cursor-pointer inline-flex items-center gap-1 transition-colors px-1 py-0.5 rounded hover:bg-[#D97757]/10">${cleanLabel}${arrow}</a>`;
      }
    );

    // 5. Linebreaks and list elements
    const lines = formatted.split('\n');
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return `<li class="ml-4 list-disc pl-1 mt-1.5 text-[15.5px] text-[#22211F] font-claude-serif leading-relaxed">${trimmed.substring(2)}</li>`;
      }
      if (/^\d+\.\s/.test(trimmed)) {
        const itemText = trimmed.replace(/^\d+\.\s/, '');
        return `<li class="ml-4 list-decimal pl-1 mt-1.5 text-[15.5px] text-[#22211F] font-claude-serif leading-relaxed">${itemText}</li>`;
      }
      return `<p class="mt-2 text-[15.5px] leading-[1.7] text-[#22211F] font-claude-serif">${trimmed}</p>`;
    });

    return processedLines.join('');
  };

  const handleChatCanvasClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (!anchor) return;

    e.preventDefault();
    e.stopPropagation();

    const targetRoute = anchor.getAttribute('data-target-route') || anchor.getAttribute('href') || '';
    if (!targetRoute || targetRoute === 'javascript:void(0)') return;

    onClose();

    const cleanRoute = targetRoute.replace(/^#\/?/, '');
    const finalHash = cleanRoute ? `#${cleanRoute}` : '#';

    window.location.hash = finalHash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const isFreshChat = messages.length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] bg-[#F9F8F6] text-[#22211F] font-sans flex flex-col overflow-hidden select-text">
          
          {/* TOP CLAUDE-STYLE NAVIGATION HEADER BAR */}
          <header className="h-14 bg-[#F9F8F6]/95 border-b border-[#E3DFD7] px-4 sm:px-8 flex items-center justify-between shrink-0 select-none z-30">
            {/* Left Brand & Model Badge */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#6E6A63] hover:text-[#22211F] transition-colors cursor-pointer mr-2"
                title="Return to Website"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Raarya</span>
              </button>

              <div className="h-4 w-[1px] bg-[#E3DFD7] hidden sm:block" />

              {/* Raarya Logo Header Tag */}
              <div className="flex items-center gap-2.5">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Raarya Logo" className="h-8 sm:h-9 w-auto object-contain shrink-0 filter drop-shadow-xs" />
                <span className="font-claude-serif font-bold text-base text-[#22211F]">Raarya AI</span>
              </div>

              {/* Model Pill Badge */}
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 bg-[#F0EDE6] border border-[#E3DFD7] rounded-full text-[11px] font-medium text-[#6E6A63]">
                <span className="w-2 h-2 rounded-full bg-[#D97757]" />
                <span>Raarya 2.5 Flash</span>
              </div>
            </div>

            {/* Right Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleNewChat}
                className="px-3.5 py-1.5 bg-[#D97757] hover:bg-[#c8654b] text-white text-xs font-semibold rounded-full shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Start New Conversation"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Chat</span>
              </button>

              <button
                onClick={handleNewChat}
                className="p-1.5 rounded-full hover:bg-[#F0EDE6] text-[#6E6A63] hover:text-[#22211F] transition-colors cursor-pointer"
                title="Clear Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[#F0EDE6] text-[#6E6A63] hover:text-[#22211F] transition-colors cursor-pointer"
                title="Close AI Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* MAIN CLAUDE CHAT CANVAS VIEWPORT */}
          <main onClick={handleChatCanvasClick} className="flex-1 overflow-y-auto custom-scrollbar-claude px-4 sm:px-6 py-6 flex flex-col items-center">
            <div className="max-w-3xl w-full flex flex-col gap-6 my-auto min-h-[calc(100vh-140px)] justify-between">
              
              {/* Fresh Chat Centered View (Screenshot 2 Template Alignment) */}
              {isFreshChat ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-6 text-center my-auto w-full">
                  
                  {/* Centered Raarya Logo & Rotating Crispy Title Quote */}
                  <div className="flex items-center justify-center gap-3.5 mb-1">
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Raarya Logo" className="h-14 sm:h-16 w-auto object-contain shrink-0 filter drop-shadow-sm" />
                    <h1 className="font-claude-serif text-3xl sm:text-4xl font-normal text-[#22211F] tracking-tight">
                      {currentQuote}
                    </h1>
                  </div>

                  {/* Centered Prompt Input Box Directly Under Header Title (Auto-expanding Claude Style) */}
                  <div className="w-full max-w-2xl bg-white border border-[#C9C3B6] focus-within:border-[#D97757] focus-within:ring-4 focus-within:ring-[#D97757]/15 rounded-3xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-all flex flex-col gap-3 text-left">
                    <textarea
                      ref={freshTextareaRef}
                      value={inputValue}
                      onChange={e => {
                        setInputValue(e.target.value);
                        adjustTextareaHeight(e.target);
                      }}
                      onInput={e => adjustTextareaHeight(e.currentTarget)}
                      onKeyDown={handleKeyPress}
                      placeholder="How can I help you today?"
                      rows={1}
                      className="w-full bg-transparent text-[#22211F] placeholder-[#5A554C] text-[15px] font-sans outline-none resize-none overflow-y-auto custom-scrollbar-claude leading-relaxed min-h-[48px]"
                    />

                    <div className="flex items-center justify-between pt-2 border-t border-[#E8E4DC]">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-[#EAE6DF] text-xs font-semibold text-[#22211F]">
                          Chat
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#4A463F] font-semibold hidden sm:inline">
                          Raarya 2.5 Flash
                        </span>
                        <button
                          onClick={() => handleSendMessage()}
                          disabled={!inputValue.trim() || isLoading}
                          className="w-9 h-9 rounded-xl bg-[#D97757] hover:bg-[#c8654b] disabled:bg-[#D5D0C5] disabled:text-[#656056] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed"
                          title="Send Message"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 4 Prompt Cards Below Input Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-2xl pt-2 text-left select-none">
                    {PROMPT_CARDS.map((card, idx) => {
                      const Icon = card.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(card.prompt)}
                          className="group p-4 bg-white hover:bg-[#F0EDE6]/80 border border-[#C9C3B6] hover:border-[#D97757]/60 rounded-2xl transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex items-start gap-3"
                        >
                          <div className="p-2 rounded-xl bg-[#EAE6DF] group-hover:bg-[#D97757]/10 text-[#D97757] transition-colors shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#22211F] tracking-tight group-hover:text-[#D97757] transition-colors block">
                              {card.title}
                            </span>
                            <span className="text-[11.5px] text-[#4A463F] font-sans leading-relaxed block mt-0.5">
                              {card.subtitle}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Conversation View (Active Chat) */
                <div className="space-y-8 w-full pt-2">
                  {messages.map((msg, index) => (
                    <div key={index} className="w-full flex flex-col space-y-3">
                      {msg.role === 'user' ? (
                        /* User Question: Rendered ONLY in light grey pill box (Screenshot 4 Template) */
                        <div className="self-end max-w-[85%] bg-[#EAE6DF] border border-[#C9C3B6] text-[#22211F] font-sans font-medium rounded-2xl rounded-tr-xs px-5 py-3 text-[14.5px] shadow-xs">
                          {msg.content}
                        </div>
                      ) : (
                        /* AI Answer: NO BOX BACKGROUND AT ALL! Flows directly onto warm canvas (Screenshot 4 Template) */
                        <div className="self-start w-full flex flex-col space-y-3 py-2">
                          
                          {/* Top Raarya Terracotta Logo Icon */}
                          <div className="flex items-center gap-2.5 select-none">
                            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Raarya Logo" className="h-7 w-auto object-contain shrink-0 filter drop-shadow-xs" />
                            <span className="font-claude-serif font-bold text-sm text-[#22211F]">Raarya AI</span>
                          </div>

                          {/* AI Answer Content: Direct Claude Font Text without any box */}
                          <div
                            className="text-[#22211F] font-claude-serif text-[15.5px] sm:text-[16px] leading-[1.7] select-text px-1"
                            dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                          />

                          {/* Inline Property Cards Showcase if properties are returned */}
                          {Boolean(
                            ((msg.properties && msg.properties.length > 0) || (msg.propertyIds && msg.propertyIds.length > 0))
                          ) && (
                            <div className="w-full mt-3 pt-2 pb-1 flex flex-col gap-3">
                              <div className="flex items-center justify-between px-1">
                                <span className="text-xs font-bold text-[#6E6A63] uppercase tracking-wider">
                                  Matching Properties ({(msg.properties || []).length || (msg.propertyIds || []).length})
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                {(
                                  (msg.properties && msg.properties.length > 0)
                                    ? msg.properties
                                    : (msg.propertyIds || []).map(id => PROPERTIES.find(p => p.id === id)).filter(Boolean) as PropertyListing[]
                                ).slice(0, 6).map((prop) => (
                                  <div key={prop.id} className="w-full">
                                    <PropertyCard
                                      property={prop}
                                      onClick={() => setSelectedPropertyModal(prop)}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}


                          {/* Claude Action Toolbar (Copy, Like, Dislike, Retry, Timestamp - Screenshot 4 Template) */}
                          <div className="flex items-center gap-3 pt-2 text-[#4A463F] text-xs select-none px-1">
                            <button
                              onClick={() => handleCopyText(index, msg.content)}
                              className="flex items-center gap-1 hover:text-[#22211F] transition-colors cursor-pointer p-1 rounded-md hover:bg-[#EAE6DF]"
                              title="Copy Answer"
                            >
                              {copiedIndex === index ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => handleFeedback(index, 'up')}
                              className={`p-1 rounded-md hover:bg-[#EAE6DF] transition-colors cursor-pointer ${
                                feedbackState[index] === 'up' ? 'text-[#D97757]' : 'hover:text-[#22211F]'
                              }`}
                              title="Helpful Answer"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleFeedback(index, 'down')}
                              className={`p-1 rounded-md hover:bg-[#EAE6DF] transition-colors cursor-pointer ${
                                feedbackState[index] === 'down' ? 'text-[#D97757]' : 'hover:text-[#22211F]'
                              }`}
                              title="Not Helpful"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                const lastUser = messages.filter(m => m.role === 'user').pop();
                                if (lastUser) handleSendMessage(lastUser.content);
                              }}
                              className="p-1 rounded-md hover:bg-[#EAE6DF] hover:text-[#22211F] transition-colors cursor-pointer"
                              title="Regenerate Response"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>

                            <span className="text-[11px] text-[#6E6A63] font-medium">Just now</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading State */}
                  {isLoading && (
                    <div className="self-start w-full flex flex-col space-y-2 py-2">
                      <div className="flex items-center gap-2.5 select-none">
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Raarya Logo" className="h-7 w-auto object-contain shrink-0 animate-pulse filter drop-shadow-xs" />
                        <span className="font-claude-serif font-bold text-sm text-[#22211F]">Thinking...</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#4A463F] text-xs font-serif px-1 py-1">
                        <span className="w-2 h-2 bg-[#D97757]/60 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-[#D97757] rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-2 h-2 bg-[#D97757]/60 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* FLOATING BOTTOM INPUT BAR (Only visible during active conversation - Auto-expanding Claude style) */}
              {!isFreshChat && (
                <div className="w-full sticky bottom-4 z-30 pt-2 pb-2">
                  <div className="bg-white border border-[#C9C3B6] focus-within:border-[#D97757] focus-within:ring-4 focus-within:ring-[#D97757]/15 rounded-2xl p-3 shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col gap-2.5">
                    <textarea
                      ref={activeTextareaRef}
                      value={inputValue}
                      onChange={e => {
                        setInputValue(e.target.value);
                        adjustTextareaHeight(e.target);
                      }}
                      onInput={e => adjustTextareaHeight(e.currentTarget)}
                      onKeyDown={handleKeyPress}
                      placeholder="Reply to Raarya AI or ask about plots, home loans, or properties..."
                      rows={1}
                      className="w-full bg-transparent text-[#22211F] placeholder-[#5A554C] text-[14.5px] outline-none resize-none overflow-y-auto custom-scrollbar-claude font-sans leading-relaxed min-h-[48px]"
                    />

                    <div className="flex items-center justify-between pt-1 border-t border-[#E8E4DC]">
                      <span className="text-[11px] text-[#4A463F] font-semibold flex items-center gap-1.5 select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Raarya Verified Database • DTCP Approved Listings
                      </span>

                      <button
                        onClick={() => handleSendMessage()}
                        disabled={!inputValue.trim() || isLoading}
                        className="w-9 h-9 rounded-xl bg-[#D97757] hover:bg-[#c8654b] disabled:bg-[#D5D0C5] disabled:text-[#656056] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed"
                        title="Send Message"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </main>
        </div>
      )}

      {selectedPropertyModal && (
        <PropertyDetailModal
          property={selectedPropertyModal}
          onClose={() => setSelectedPropertyModal(null)}
        />
      )}
    </AnimatePresence>
  );
}
