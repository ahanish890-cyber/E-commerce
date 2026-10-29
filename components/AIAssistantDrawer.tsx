import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User as UserIcon, ChevronRight, ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../types';
import { formatINR } from '../utils/currency';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeGender: string;
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendedProducts?: Product[];
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  activeGender,
  onSelectProduct,
  onAddToCart
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: "Namaste! I'm your OmniFit AI Fashion Stylist. Tell me what occasion you're dressing for (e.g., college, office presentation, wedding, festival), your budget in ₹ INR, or desired clothing styles, and I will recommend matching pieces from our verified Indian catalog."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    const userText = queryText.trim();
    setInput('');
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          activeGender: activeGender !== 'all' ? activeGender : undefined
        })
      });

      const data = await res.json().catch(() => ({}));
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "Here are matching garments from our verified catalog:",
        recommendedProducts: data.recommendedProducts || []
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'assistant',
          text: "I experienced a hiccup connecting to the style intelligence engine. Please try again shortly."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (product: Product) => {
    if (onAddToCart) {
      onAddToCart(product);
      setAddedIds(prev => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedIds(prev => ({ ...prev, [product.id]: false }));
      }, 2500);
    }
  };

  const quickPrompts = [
    "College presentation outfit under ₹2,000",
    "Office formal shirts & trousers under ₹3,000",
    "Traditional kurta set for family wedding",
    "Festive Diwali ethnic wear",
    "Weekend casual outing with friends"
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-gray-200">
        {/* Header */}
        <div className="bg-[#131921] text-white p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-lg text-gray-950">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm">OmniFit Stylist Assistant</h3>
              <p className="text-[11px] text-gray-300">Catalogue-aware styling & outfit pairings</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm bg-neutral-50">
          {messages.map(m => (
            <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#131921] text-[#febd69] flex items-center justify-center shrink-0 shadow-xs">
                  <Bot size={16} />
                </div>
              )}
              <div className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed ${
                m.sender === 'user' 
                  ? 'bg-[#131921] text-white rounded-br-xs' 
                  : 'bg-white border border-gray-200 text-gray-800 shadow-xs rounded-bl-xs'
              }`}>
                <div className="whitespace-pre-line">{m.text}</div>
                {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5">
                    <p className="font-bold text-[11px] text-gray-900 uppercase tracking-wider">
                      Verified Catalogue Matches:
                    </p>
                    {m.recommendedProducts.map(p => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/80 hover:bg-orange-50/60 hover:border-[#e77600] transition-colors space-y-2"
                      >
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-12 h-14 object-cover rounded-md bg-white shrink-0 border" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">{p.name}</p>
                            <p className="text-[#b12704] font-black text-xs">{formatINR(p.price)}</p>
                            <p className="text-[10px] text-gray-500 truncate">{p.material || p.brand}</p>
                            {p.sizes && (
                              <div className="flex gap-1 mt-1">
                                {p.sizes.slice(0, 4).map(s => (
                                  <span key={s} className="px-1 py-0.2 bg-white border rounded text-[9px] text-gray-600 font-bold">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-1 border-t border-gray-200/60">
                          <button
                            onClick={() => {
                              onSelectProduct(p);
                              onClose();
                            }}
                            className="flex-1 py-1.5 px-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-md font-bold text-[11px] text-gray-800 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Eye size={12} /> View Details
                          </button>
                          {onAddToCart && (
                            <button
                              onClick={() => handleQuickAdd(p)}
                              className={`py-1.5 px-3 rounded-md font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                addedIds[p.id] 
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950'
                              }`}
                            >
                              {addedIds[p.id] ? (
                                <>
                                  <Check size={12} /> Added
                                </>
                              ) : (
                                <>
                                  <ShoppingBag size={12} /> Add to Cart
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-gray-500 italic">
              <div className="w-8 h-8 rounded-full bg-[#131921] text-[#febd69] flex items-center justify-center">
                <Bot size={16} />
              </div>
              <span className="flex items-center gap-1">
                Searching real catalogue & styling outfit pairings...
              </span>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="p-2.5 bg-white border-t border-gray-200 flex flex-wrap gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block w-full mb-0.5">
            Suggested Prompts:
          </span>
          {quickPrompts.map(prompt => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSendQuery(prompt)}
              className="px-2.5 py-1 bg-gray-100 hover:bg-orange-50 hover:text-[#c45500] hover:border-[#e77600] border border-transparent text-gray-700 text-[11px] rounded-full transition-colors cursor-pointer text-left truncate max-w-full font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery(input);
          }} 
          className="p-3 bg-white border-t border-gray-200 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask stylist by occasion, budget in ₹, or style..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#e77600]"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 font-bold rounded-lg text-xs flex items-center gap-1 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
          >
            <Send size={14} /> Send
          </button>
        </form>
      </div>
    </div>
  );
};
