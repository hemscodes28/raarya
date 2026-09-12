import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  RotateCw,
  Sparkles,
  ArrowRight
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
    badge: 'Featured',
    title: 'Plots in Saravanampatti & Annur',
    subtitle: 'Search DTCP & RERA approved layout plots with 100% clear titles.',
    prompt: 'Properties in Saravanampatti and Annur'
  },
  {
    icon: Calculator,
    badge: 'Instant EMI',
    title: 'Calculate Home Loan EMI',
    subtitle: 'Get instant monthly EMI calculations & bank loan assistance.',
    prompt: 'Calculate home loan EMI for 35 lakhs'
  },
  {
    icon: Building,
    badge: 'Seller Hub',
    title: 'List Your Property on Raarya',
    subtitle: 'Learn how to post your land, house, or villa listing effortlessly.',
    prompt: 'How to list my property on Raarya'
  },
  {
    icon: Briefcase,
    badge: 'We\'re Hiring',
    title: 'Careers & Job Openings',
    subtitle: 'Explore active sales & marketing executive positions at Raarya.',
    prompt: 'Careers at Raarya Groups'
  }
];

const QUICK_CHIPS = [
  { label: '📍 Saravanampatti Plots', prompt: 'Show plots in Saravanampatti' },
  { label: '🏡 Annur Villas & Land', prompt: 'Show properties in Annur' },
  { label: '💰 Home Loan EMI Calc', prompt: 'Calculate home loan EMI' },
  { label: '🏬 Ganapathy Layouts', prompt: 'Plots for sale in Ganapathy' },
  { label: '📜 DTCP & RERA Approved', prompt: 'DTCP approved layout plots' },
  { label: '💼 Raarya Careers', prompt: 'Jobs at Raarya Groups' }
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
  "Ask me anything about land, plots & villas."
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

    // 0. Cleanly remove any leaked hex attribute artifacts
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

    // 2. Bold tags: **text** -> <strong class="font-semibold">$1</strong>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');

    // 3. Handle unclosed bracket links
    formatted = formatted.replace(
      /\[(View all \d+ matching properties in our (Buy|Rent|PG & Hostel|PG\/Hostel|PG) section\s*→?)(?!\()/gi,
      (_, label, section) => {
        const secLower = section.toLowerCase();
        const route = secLower.includes('pg') ? '#pg-hostel' : secLower === 'rent' ? '#rent' : '#buy';
        return `[${label}](${route})`;
      }
    );

    // 4. Markdown links
    formatted = formatted.replace(
      /\[(.*?)\]\((.*?)\)/g,
      (_, label, url) => {
        const cleanLabel = label.replace(/^#/, '').trim();
        const targetUrl = url.includes('preset-sites') ? '#buy' : (url.startsWith('#') ? url : `#${url}`);
        const arrow = cleanLabel.includes('→') ? '' : ' →';
        return `<a href="javascript:void(0)" data-target-route="${targetUrl}" class="font-bold text-[#D97757] hover:text-[#C8654B] underline underline-offset-4 decoration-[#D97757]/50 hover:decoration-[#C8654B] cursor-pointer inline-flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded-md hover:bg-[#D97757]/10">${cleanLabel}${arrow}</a>`;
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
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[10000] bg-[#F9F8F6] text-[#22211F] font-sans flex flex-col overflow-hidden select-text h-[100dvh]"
        >
          {/* Subtle Fine Micro Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none z-0" />

          {/* TOP CLAUDE-STYLE NAVIGATION HEADER BAR */}
          <header className="h-14 bg-[#F9F8F6]/95 border-b border-[#E3DFD7] px-3 sm:px-8 flex items-center justify-between shrink-0 select-none z-30 shadow-2xs relative">
            {/* Left Brand & Model Badge */}
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.button
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-[#6E6A63] hover:text-[#22211F] transition-colors cursor-pointer mr-1 sm:mr-2"
                title="Return to Website"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Raarya</span>
              </motion.button>

              <div className="h-4 w-[1px] bg-[#E3DFD7] hidden sm:block" />

              {/* Raarya Logo Header Tag */}
              <div className="flex items-center gap-2.5">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Raarya Logo" className="h-8 sm:h-9 w-auto object-contain shrink-0 filter drop-shadow-xs" />
                <span className="font-claude-serif font-bold text-base text-[#22211F] tracking-tight">Raarya AI</span>
              </div>

              {/* Model Pill Badge */}
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 bg-[#F0EDE6] border border-[#E3DFD7] rounded-full text-[11px] font-medium text-[#6E6A63]">
                <span className="w-2 h-2 rounded-full bg-[#D97757] animate-pulse" />
                <span>Raarya 2.5 Flash</span>
              </div>
            </div>

            {/* Right Quick Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 4px 14px rgba(217,119,87,0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewChat}
                className="px-3.5 py-1.5 bg-[#D97757] hover:bg-[#c8654b] text-white text-xs font-semibold rounded-full shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Start New Conversation"
              >
                <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" />
                <span>New Chat</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1, color: '#ef4444' }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNewChat}
                className="p-1.5 rounded-full hover:bg-[#F0EDE6] text-[#6E6A63] transition-colors cursor-pointer"
                title="Clear Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[#F0EDE6] text-[#6E6A63] hover:text-[#22211F] transition-colors cursor-pointer"
                title="Close AI Assistant"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </header>

          {/* MAIN CLAUDE CHAT CANVAS VIEWPORT */}
          <main onClick={handleChatCanvasClick} className="flex-1 overflow-y-auto custom-scrollbar-claude px-3 sm:px-6 py-4 sm:py-6 flex flex-col items-center relative z-10">
            <div className="max-w-3xl w-full flex flex-col gap-6 my-auto min-h-[calc(100vh-140px)] justify-between">
              
              {/* Fresh Chat Centered View */}
              {isFreshChat ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center py-4 sm:py-8 space-y-5 sm:space-y-6 text-center my-auto w-full"
                >
                  
                  {/* Centered Raarya Logo & Rotating Crispy Title Quote */}
                  <div className="flex items-center justify-center gap-3.5 mb-1">
                    <motion.img
                      whileHover={{ scale: 1.08, rotate: 2 }}
                      src={`${import.meta.env.BASE_URL}logo.png`}
                      alt="Raarya Logo"
                      className="h-14 sm:h-16 w-auto object-contain shrink-0 filter drop-shadow-sm transition-transform cursor-pointer"
                    />
                    <AnimatePresence mode="wait">
                      <motion.h1
                        key={currentQuote}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="font-claude-serif text-2xl sm:text-4xl font-normal text-[#22211F] tracking-tight"
                      >
                        {currentQuote}
                      </motion.h1>
                    </AnimatePresence>
                  </div>

                  {/* Centered Prompt Input Box Directly Under Header Title */}
                  <motion.div
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="w-full max-w-2xl bg-white border border-[#C9C3B6] focus-within:border-[#D97757] focus-within:ring-4 focus-within:ring-[#D97757]/15 rounded-3xl p-3.5 sm:p-4 shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-all flex flex-col gap-3 text-left group"
                  >
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
                      className="w-full bg-transparent text-[#22211F] placeholder-[#5A554C] text-[14.5px] sm:text-[15px] font-sans outline-none resize-none overflow-y-auto custom-scrollbar-claude leading-relaxed min-h-[48px]"
                    />

                    <div className="flex items-center justify-between pt-2 border-t border-[#E8E4DC]">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-[#EAE6DF] text-xs font-semibold text-[#22211F] flex items-center gap-1.5 shadow-2xs">
                          <Sparkles className="w-3.5 h-3.5 text-[#D97757] animate-spin-slow" />
                          Chat
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <span className="text-xs text-[#4A463F] font-semibold hidden sm:inline">
                          Raarya 2.5 Flash
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => handleSendMessage()}
                          disabled={!inputValue.trim() || isLoading}
                          className="w-9 h-9 rounded-xl bg-[#D97757] hover:bg-[#c8654b] disabled:bg-[#D5D0C5] disabled:text-[#656056] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed"
                          title="Send Message"
                        >
                          <Send className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Interactive Quick Chip Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                    className="flex items-center justify-center flex-wrap gap-2 max-w-2xl px-1 select-none"
                  >
                    {QUICK_CHIPS.map((chip, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSendMessage(chip.prompt)}
                        className="px-3 py-1.5 bg-white hover:bg-[#F0EDE6] border border-[#D5D0C5] hover:border-[#D97757]/60 rounded-full text-xs font-medium text-[#4A463F] hover:text-[#D97757] shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>{chip.label}</span>
                      </motion.button>
                    ))}
                  </motion.div>

                  {/* 4 Rich Interactive Prompt Cards Below Input Box */}
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.08, delayChildren: 0.2 }
                      }
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-2xl pt-1 text-left select-none"
                  >
                    {PROMPT_CARDS.map((card, idx) => {
                      const Icon = card.icon;
                      return (
                        <motion.button
                          key={idx}
                          variants={{
                            hidden: { opacity: 0, y: 15, scale: 0.96 },
                            show: { opacity: 1, y: 0, scale: 1 }
                          }}
                          whileHover={{ y: -3, scale: 1.01, boxShadow: '0 12px 28px rgba(217,119,87,0.12)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSendMessage(card.prompt)}
                          className="group relative p-4 bg-white hover:bg-[#FAF8F5] border border-[#C9C3B6] hover:border-[#D97757]/70 rounded-2xl transition-all duration-200 cursor-pointer shadow-2xs flex items-start gap-3.5 overflow-hidden"
                        >
                          {/* Accent Gradient Glow Border Bar */}
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D97757]/0 group-hover:via-[#D97757] to-transparent transition-all duration-300" />

                          <div className="p-2.5 rounded-xl bg-[#EAE6DF] group-hover:bg-[#D97757]/15 text-[#D97757] transition-colors shrink-0 mt-0.5 group-hover:scale-110 duration-200">
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-xs font-bold text-[#22211F] tracking-tight group-hover:text-[#D97757] transition-colors block truncate">
                                {card.title}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F0EDE6] group-hover:bg-[#D97757] text-[#6E6A63] group-hover:text-white transition-all shrink-0">
                                {card.badge}
                              </span>
                            </div>
                            <span className="text-[11.5px] text-[#4A463F] font-sans leading-relaxed block">
                              {card.subtitle}
                            </span>
                          </div>

                          <ArrowRight className="w-4 h-4 text-[#D97757] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0 self-center" />
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </motion.div>
              ) : (
                /* Conversation View (Active Chat) */
                <div className="space-y-6 sm:space-y-8 w-full pt-2">
                  <AnimatePresence initial={false}>
                    {messages.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="w-full flex flex-col space-y-3"
                      >
                        {msg.role === 'user' ? (
                          /* User Question: Rendered ONLY in light grey pill box */
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            className="self-end max-w-[88%] sm:max-w-[85%] bg-gradient-to-r from-[#EAE6DF] to-[#E3DFD7] border border-[#C9C3B6] text-[#22211F] font-sans font-medium rounded-2xl rounded-tr-xs px-4 sm:px-5 py-2.5 sm:py-3 text-[14px] sm:text-[14.5px] shadow-xs"
                          >
                            {msg.content}
                          </motion.div>
                        ) : (
                          /* AI Answer: Direct Claude Font Text without box */
                          <div className="self-start w-full flex flex-col space-y-3 py-2">
                            
                            {/* Top Raarya Terracotta Logo Icon */}
                            <div className="flex items-center gap-2.5 select-none">
                              <motion.img
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                src={`${import.meta.env.BASE_URL}logo.png`}
                                alt="Raarya Logo"
                                className="h-7 w-auto object-contain shrink-0 filter drop-shadow-xs cursor-pointer"
                              />
                              <span className="font-claude-serif font-bold text-sm text-[#22211F] tracking-tight">Raarya AI</span>
                            </div>

                            {/* AI Answer Content: Direct Claude Font Text */}
                            <div
                              className="text-[#22211F] font-claude-serif text-[15px] sm:text-[16px] leading-[1.7] select-text px-1"
                              dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                            />

                            {/* Inline Property Cards Showcase if properties are returned */}
                            {Boolean(
                              ((msg.properties && msg.properties.length > 0) || (msg.propertyIds && msg.propertyIds.length > 0))
                            ) && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="w-full mt-3 pt-2 pb-1 flex flex-col gap-3"
                              >
                                <div className="flex items-center justify-between px-1">
                                  <span className="text-xs font-bold text-[#6E6A63] uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-[#D97757] animate-pulse" />
                                    Matching Properties ({(msg.properties || []).length || (msg.propertyIds || []).length})
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 w-full">
                                  {(
                                    (msg.properties && msg.properties.length > 0)
                                      ? msg.properties
                                      : (msg.propertyIds || []).map(id => PROPERTIES.find(p => p.id === id)).filter(Boolean) as PropertyListing[]
                                  ).slice(0, 6).map((prop, pIdx) => (
                                    <motion.div
                                      key={prop.id}
                                      initial={{ opacity: 0, y: 12 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.05 * pIdx }}
                                      className="w-full"
                                    >
                                      <PropertyCard
                                        property={prop}
                                        onClick={() => setSelectedPropertyModal(prop)}
                                      />
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            )}

                            {/* Claude Action Toolbar */}
                            <div className="flex items-center gap-3 pt-2 text-[#4A463F] text-xs select-none px-1">
                              <motion.button
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleCopyText(index, msg.content)}
                                className="flex items-center gap-1 hover:text-[#22211F] transition-colors cursor-pointer p-1 rounded-md hover:bg-[#EAE6DF]"
                                title="Copy Answer"
                              >
                                {copiedIndex === index ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleFeedback(index, 'up')}
                                className={`p-1 rounded-md hover:bg-[#EAE6DF] transition-colors cursor-pointer ${
                                  feedbackState[index] === 'up' ? 'text-[#D97757]' : 'hover:text-[#22211F]'
                                }`}
                                title="Helpful Answer"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleFeedback(index, 'down')}
                                className={`p-1 rounded-md hover:bg-[#EAE6DF] transition-colors cursor-pointer ${
                                  feedbackState[index] === 'down' ? 'text-[#D97757]' : 'hover:text-[#22211F]'
                                }`}
                                title="Not Helpful"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </motion.button>

                              <motion.button
                                whileHover={{ rotate: 180, scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  const lastUser = messages.filter(m => m.role === 'user').pop();
                                  if (lastUser) handleSendMessage(lastUser.content);
                                }}
                                className="p-1 rounded-md hover:bg-[#EAE6DF] hover:text-[#22211F] transition-colors cursor-pointer"
                                title="Regenerate Response"
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                              </motion.button>

                              <span className="text-[11px] text-[#6E6A63] font-medium">Just now</span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Loading State */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="self-start w-full flex flex-col space-y-2 py-2"
                    >
                      <div className="flex items-center gap-2.5 select-none">
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Raarya Logo" className="h-7 w-auto object-contain shrink-0 animate-pulse filter drop-shadow-xs" />
                        <span className="font-claude-serif font-bold text-sm text-[#22211F]">Thinking...</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#4A463F] text-xs font-serif px-1 py-1">
                        <span className="w-2 h-2 bg-[#D97757]/60 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-[#D97757] rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-2 h-2 bg-[#D97757]/60 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* FLOATING BOTTOM INPUT BAR (Visible during active conversation) */}
              {!isFreshChat && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full sticky bottom-3 sm:bottom-4 z-30 pt-2 pb-1"
                >
                  <div className="bg-white border border-[#C9C3B6] focus-within:border-[#D97757] focus-within:ring-4 focus-within:ring-[#D97757]/15 rounded-2xl p-2.5 sm:p-3 shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col gap-2.5">
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
                      className="w-full bg-transparent text-[#22211F] placeholder-[#5A554C] text-[14px] sm:text-[14.5px] outline-none resize-none overflow-y-auto custom-scrollbar-claude font-sans leading-relaxed min-h-[48px]"
                    />

                    <div className="flex items-center justify-between pt-1 border-t border-[#E8E4DC]">
                      <span className="text-[10.5px] sm:text-[11px] text-[#4A463F] font-semibold flex items-center gap-1.5 select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Raarya Verified Database • DTCP Approved Listings
                      </span>

                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => handleSendMessage()}
                        disabled={!inputValue.trim() || isLoading}
                        className="w-9 h-9 rounded-xl bg-[#D97757] hover:bg-[#c8654b] disabled:bg-[#D5D0C5] disabled:text-[#656056] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed"
                        title="Send Message"
                      >
                        <Send className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

            </div>
          </main>
        </motion.div>
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
