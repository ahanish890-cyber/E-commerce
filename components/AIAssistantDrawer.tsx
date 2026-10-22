import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User as UserIcon, ChevronRight } from 'lucide-react';
import { Product } from '../types';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeGender: string;
  onSelectProduct: (product: Product) => void;
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
  onSelectProduct
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: "Hello! I'm your OmniFit AI Fashion Stylist. Tell me what occasion you're dressing for, your budget, or specific styles you love, and I'll find the best pieces in our catalog."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
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

      const data = await res.json();
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

  const samplePrompts = [
    "Summer wedding guest dress under $150",
    "Casual Oxford shirts for men",
    "Tailored outerwear with Virtual Try-On",
    "Minimalist everyday sneakers"
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-gray-200">
        {/* Header */}
        <div className="bg-[#131921] text-white p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-lg text-gray-950">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm">OmniFit Fashion Stylist</h3>
              <p className="text-[11px] text-gray-300">Catalog-aware outfit recommendations</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm bg-neutral-50">
          {messages.map(m => (
            <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#131921] text-[#febd69] flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                m.sender === 'user' 
                  ? 'bg-[#131921] text-white rounded-br-xs' 
                  : 'bg-white border border-gray-200 text-gray-800 shadow-xs rounded-bl-xs'
              }`}>
                <p>{m.text}</p>
                {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <p className="font-bold text-[11px] text-gray-900">Featured In-Stock Products:</p>
                    {m.recommendedProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectProduct(p);
                          onClose();
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-orange-50 hover:border-[#e77600] cursor-pointer transition-colors"
                      >
                        <img src={p.image} alt={p.name} className="w-10 h-12 object-cover rounded shrink-0 bg-white" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{p.name}</p>
                          <p className="text-gray-500">${p.price.toFixed(2)} • {p.brand}</p>
                        </div>
                        <ChevronRight size={14} className="text-[#007185] shrink-0" />
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
                Searching catalog & styling combinations...
              </span>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="p-2 bg-white border-t border-gray-200 flex flex-wrap gap-1">
          {samplePrompts.map(prompt => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setInput(prompt);
              }}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] rounded-full transition-colors truncate max-w-full"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your fashion stylist..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#e77600]"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 font-bold rounded-lg text-xs flex items-center gap-1 disabled:opacity-50 transition-all"
          >
            <Send size={14} /> Send
          </button>
        </form>
      </div>
    </div>
  );
};
