'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { MessageSquare, X, Send, Bot, RefreshCw, ShoppingCart, Check } from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  suggestedItems?: any[];
  timestamp: Date;
}

export default function Chatbot() {
  const { addToCart } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Vanakkam! I'm DosaBot, your South Indian food guide. Hungry? Ask me for recommendations, spicy combos, or current coupons!",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemMap, setAddedItemMap] = useState<{ [key: string]: boolean }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userText = inputText;
    setInputText('');

    const userMessage: Message = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chatbot', message: userText })
      });
      const data = await res.json();
      
      const botMessage: Message = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: data.response || "Sorry, my recipe book got wet. Could you ask that again?",
        suggestedItems: data.suggestedItems || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Chatbot API error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: 'bot-err-' + Date.now(),
          sender: 'bot',
          text: "Forgive me, connection is a bit slow like filter coffee brewing. Can you retry?",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggested = (item: any) => {
    addToCart(item, 1, [], []);
    setAddedItemMap(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemMap(prev => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-saffron-500 text-cream-50 shadow-premium hover:shadow-premium-lg hover:scale-105 transition-all duration-300 animate-bounce"
          aria-label="Open support chat"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="flex h-[500px] w-[350px] flex-col rounded-2xl border border-cream-200 bg-cream-50 shadow-premium-lg dark:border-coffee-800 dark:bg-coffee-950 overflow-hidden animate-in slide-in-from-bottom duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-saffron-500 to-brass-500 px-4 py-3.5 text-cream-50">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 animate-pulse" />
              <div>
                <h4 className="font-semibold text-sm leading-none">DosaBot Support</h4>
                <span className="text-[10px] text-cream-100/80">Online • Happy to help</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-cream-100 hover:bg-cream-100/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-saffron-500 text-cream-50 rounded-tr-none'
                      : 'bg-cream-200/50 text-temple-900 dark:bg-coffee-900 dark:text-cream-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Suggested Dishes if any */}
                {msg.suggestedItems && msg.suggestedItems.length > 0 && (
                  <div className="mt-2 w-full max-w-[85%] space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-temple-900/50 dark:text-cream-300/50 font-bold">Suggested Items:</p>
                    {msg.suggestedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-cream-200 bg-cream-50 p-2 shadow-sm dark:border-coffee-800 dark:bg-coffee-900"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <div className="overflow-hidden">
                            <h5 className="truncate text-xs font-semibold text-temple-900 dark:text-cream-100">{item.name}</h5>
                            <span className="text-[10px] text-saffron-500 font-semibold">₹{item.price}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddSuggested(item)}
                          className={`rounded-lg p-1.5 transition-colors ${
                            addedItemMap[item.id]
                              ? 'bg-green-600 text-cream-50'
                              : 'bg-saffron-500 text-cream-50 hover:bg-saffron-600'
                          }`}
                        >
                          {addedItemMap[item.id] ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <span className="mt-1 text-[9px] text-temple-900/30 dark:text-cream-300/30">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-1.5 text-temple-900/40 dark:text-cream-300/40 text-xs">
                <RefreshCw className="h-3 w-3 animate-spin" />
                DosaBot is searching the kitchen...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={handleSendMessage} className="border-t border-cream-200 bg-cream-100 p-2.5 dark:border-coffee-900 dark:bg-coffee-900 flex gap-2">
            <input
              type="text"
              placeholder="Ask anything..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 rounded-full bg-cream-50 px-3.5 py-1.5 text-xs text-temple-950 focus:outline-none border border-cream-200 focus:border-saffron-500 dark:bg-coffee-950 dark:border-coffee-800 dark:text-cream-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-saffron-500 text-cream-50 hover:bg-saffron-600 disabled:opacity-50 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
