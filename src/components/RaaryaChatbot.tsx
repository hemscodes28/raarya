import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Trash2, X, Sparkles } from 'lucide-react';
import { apiChat } from '../utils/api';

interface RaaryaChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

const SUGGESTIONS = [
  'Properties in Saravanampatti',
  'Plots in Annur',
  'Calculate home loan EMI',
  'Careers at Raarya',
  'Direct contact number',
  'List my property'
];

export function RaaryaChatbot({ isOpen, onClose }: RaaryaChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: 'Hello! Welcome to **Raarya Properties**. I am your virtual real estate assistant. How can I help you today?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    if (!textToSend) setInputValue('');

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await apiChat(newMessages);
      if (response.success && response.content) {
        setMessages(prev => [...prev, { role: 'model', content: response.content }]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'model',
            content: response.message || 'I encountered an issue connecting to the chat service. Please check your network connection.'
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: 'An unexpected error occurred. Please try again later.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear your chat history?')) {
      setMessages([
        {
          role: 'model',
          content: 'Hello! Welcome to **Raarya Properties**. I am your virtual real estate assistant. How can I help you today?'
        }
      ]);
    }
  };

  // Safe markdown text formatter supporting bold, links, and lists
  const formatMarkdown = (text: string) => {
    // 1. Safe escaping of HTML characters to prevent XSS
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 2. Bold tags: **text** -> <strong>text</strong>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 3. Markdown links: [label](url) -> <a href="url" class="...">label</a>
    // Specially handle hash links to close chatbot panel automatically if user clicks site navigation
    formatted = formatted.replace(
      /\[(.*?)\]\((.*?)\)/g,
      (_, label, url) => {
        const isHash = url.startsWith('#');
        const clickAttr = isHash ? 'onclick="window.dispatchEvent(new CustomEvent(\'close-chatbot\'))"' : '';
        return `<a href="${url}" ${clickAttr} class="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 decoration-amber-500/40">${label}</a>`;
      }
    );

    // 4. Linebreaks and list elements
    const lines = formatted.split('\n');
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) {
        return `<li class="ml-4 list-disc pl-1 mt-1 text-[13px] text-[#f5ebd7]/90">${trimmed.substring(2)}</li>`;
      }
      if (trimmed.startsWith('* ')) {
        return `<li class="ml-4 list-disc pl-1 mt-1 text-[13px] text-[#f5ebd7]/90">${trimmed.substring(2)}</li>`;
      }
      return `<p class="mt-1 text-[13.5px] leading-relaxed">${line}</p>`;
    });

    return processedLines.join('');
  };

  // Close chatbot when a hash link custom event is fired
  useEffect(() => {
    const handleCloseEvent = () => onClose();
    window.addEventListener('close-chatbot', handleCloseEvent);
    return () => window.removeEventListener('close-chatbot', handleCloseEvent);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#060606]/65 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="relative w-full max-w-[650px] h-[620px] max-h-[85vh] rounded-[32px] flex flex-col bg-[#0c0a09]/75 backdrop-blur-3xl border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] text-white overflow-hidden z-10 font-outfit"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {/* Top gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c5a880] to-transparent opacity-80" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-black/30 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-4">
                {/* Glowing Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c5a880]/20 to-[#9a7d55]/10 border border-[#c5a880]/30 flex items-center justify-center relative shadow-[0_0_20px_rgba(197,168,128,0.15)] shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0c0a09] shadow-[0_0_8px_#10b981]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[16px] font-bold text-white tracking-wide leading-tight">Raarya AI Advisor</span>
                  <span className="text-[9px] text-[#c5a880] font-black tracking-[0.2em] uppercase mt-1">Real Estate Concierge</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearChat}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300 cursor-pointer border-0 outline-none active:scale-95"
                  title="Clear Chat History"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300 cursor-pointer border-0 outline-none active:scale-95"
                  title="Close Advisor"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages viewport */}
            <div className="flex-grow overflow-y-auto px-6 py-5 space-y-5 bg-gradient-to-b from-transparent to-black/20 custom-scrollbar relative">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'model' && (
                    <div className="w-7 h-7 rounded-full bg-amber-500/5 flex items-center justify-center border border-[#c5a880]/20 text-[#c5a880] mr-3 mt-1 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                  
                  <div
                    className={`px-4.5 py-3 text-[14px] leading-relaxed rounded-2xl max-w-[80%] shadow-md ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[#c5a880] to-[#a88a5e] text-black font-semibold rounded-tr-none'
                        : 'bg-white/[0.03] border border-white/5 text-[#e3ded6] rounded-tl-none font-light'
                    }`}
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                  />
                </div>
              ))}

              {isLoading && (
                <div className="flex w-full justify-start items-center">
                  <div className="w-7 h-7 rounded-full bg-amber-500/5 flex items-center justify-center border border-[#c5a880]/20 text-[#c5a880] mr-3 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 px-4.5 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-md shrink-0">
                    <span className="w-1.5 h-1.5 bg-[#c5a880]/55 rounded-full animate-[bounce_1.4s_infinite_100ms]" />
                    <span className="w-1.5 h-1.5 bg-[#c5a880]/85 rounded-full animate-[bounce_1.4s_infinite_200ms]" />
                    <span className="w-1.5 h-1.5 bg-[#c5a880]/55 rounded-full animate-[bounce_1.4s_infinite_300ms]" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick-reply Suggestion Chips */}
            <div className="px-6 py-3 bg-black/10 border-t border-white/5 flex gap-2.5 overflow-x-auto select-none custom-scrollbar shrink-0">
              {SUGGESTIONS.map(chip => (
                <button
                  key={chip}
                  onClick={() => handleSendMessage(chip)}
                  className="px-4 py-2 text-[11px] font-medium text-amber-400 hover:text-black bg-amber-500/5 hover:bg-[#c5a880] border border-[#c5a880]/20 hover:border-[#c5a880] rounded-full whitespace-nowrap transition-all duration-300 cursor-pointer outline-none active:scale-95 shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Message Input Box */}
            <div className="p-4 bg-black/40 border-t border-white/5 flex items-center gap-3 shrink-0">
              <textarea
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message or ask about a property..."
                rows={1}
                className="flex-1 bg-white/[0.04] focus:bg-white/[0.08] border border-white/10 focus:border-[#c5a880]/40 rounded-2xl py-3 px-4 text-[13.5px] text-white placeholder-white/30 outline-none transition-all duration-300 resize-none max-h-20 custom-scrollbar"
              />
              
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#c5a880] to-[#9a7d55] disabled:from-white/10 disabled:to-white/5 disabled:text-white/20 text-black flex items-center justify-center hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:active:scale-100 transition-all outline-none border-none cursor-pointer shrink-0 shadow-lg shadow-[#c5a880]/10 hover:shadow-[#c5a880]/20"
                title="Send Message"
              >
                {isLoading ? (
                  <Sparkles className="w-4 h-4 text-black/50 animate-spin" />
                ) : (
                  <Send className="w-4.5 h-4.5 text-black" />
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
