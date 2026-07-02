'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Sparkles, Navigation } from 'lucide-react';
import KolamBackground from '@/components/KolamBackground';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setSent(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSent(false), 4000);
    }
  };

  return (
    <div className="relative min-h-[80vh] bg-cream-50 pb-20 dark:bg-coffee-950 transition-colors duration-300">
      
      <KolamBackground className="opacity-[0.03] dark:opacity-[0.02]" />

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-temple-900 to-saffron-900 py-12 text-center text-cream-50 dark:from-coffee-950 dark:to-saffron-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">Contact Us</h1>
          <p className="mt-2 text-sm sm:text-base text-cream-200/80">Have feedback or special catering inquiries? Reach out to our kitchen.</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Form */}
          <div className="rounded-2xl border border-cream-200 p-6 bg-cream-50 text-left dark:border-coffee-800 dark:bg-coffee-900">
            <h2 className="font-serif text-xl font-bold flex items-center gap-2 mb-6">
              <Mail className="h-5.5 w-5.5 text-saffron-500" /> Send Message
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50 block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Sayani Sen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-cream-200 bg-cream-100 px-3.5 py-2.5 text-xs focus:outline-none dark:bg-coffee-950 dark:border-coffee-800"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="sayani@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-cream-200 bg-cream-100 px-3.5 py-2.5 text-xs focus:outline-none dark:bg-coffee-950 dark:border-coffee-800"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50 block mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Let us know how we can help..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-cream-200 bg-cream-100 px-3.5 py-2.5 text-xs focus:outline-none dark:bg-coffee-950 dark:border-coffee-800 resize-none"
                />
              </div>

              {sent && (
                <div className="flex items-center gap-1.5 rounded-lg bg-green-50 p-3 text-[10px] font-semibold text-green-600 dark:bg-green-950/20 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Your message has been sent successfully! Our chef will review it.
                </div>
              )}

              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-full bg-saffron-500 py-3.5 px-8 font-bold text-cream-50 hover:bg-saffron-600 shadow-sm transition-all"
              >
                Send Message <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Right Column: Branch location details & Map */}
          <div className="space-y-6 text-left">
            
            {/* Contact details */}
            <div className="rounded-2xl border border-cream-200 p-6 bg-cream-50 dark:border-coffee-800 dark:bg-coffee-900 space-y-4">
              <h3 className="font-serif text-lg font-bold text-temple-900 dark:text-cream-100 flex items-center gap-1.5"><Sparkles className="h-5 w-5 text-saffron-500" /> Kitchen Hotline</h3>
              
              <ul className="space-y-4 text-xs text-temple-900/70 dark:text-cream-200/80">
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-5 w-5 text-saffron-500 shrink-0" />
                  <div>
                    <span className="font-bold text-temple-900 dark:text-cream-100">DosaHub HQ Branch</span>
                    <p className="mt-0.5">12 Park Street, Kolkata, West Bengal 700016</p>
                  </div>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4.5 w-4.5 text-saffron-500 shrink-0" />
                  <div>
                    <span className="font-bold text-temple-900 dark:text-cream-100">Phone Support</span>
                    <p className="mt-0.5">+91 79801 90215</p>
                  </div>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4.5 w-4.5 text-saffron-500 shrink-0" />
                  <div>
                    <span className="font-bold text-temple-900 dark:text-cream-100">Email Support</span>
                    <p className="mt-0.5">support@dosahub.com</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Stylized Map Visualizer */}
            <div className="relative h-48 rounded-2xl border border-cream-200 bg-cream-100 overflow-hidden shadow-sm dark:border-coffee-800 dark:bg-coffee-900">
              <svg className="h-full w-full" viewBox="0 0 200 200" fill="none">
                <path d="M 0,50 L 200,50 M 0,100 L 200,100 M 0,150 L 200,150 M 50,0 L 50,200 M 100,0 L 100,200 M 150,0 L 150,200" stroke="currentColor" className="opacity-10" />
                <path d="M 50,100 Q 80,120 120,80 T 150,150" stroke="#E0A96D" strokeWidth="6" strokeLinecap="round" className="opacity-30" />
                <circle cx="120" cy="80" r="10" fill="#D95D39" className="animate-pulse" />
                <circle cx="120" cy="80" r="3" fill="#FAF8F5" />
              </svg>
              <div className="absolute bottom-2.5 left-2.5 rounded-lg bg-cream-50/90 py-1 px-2.5 text-[9px] font-semibold border border-cream-200 backdrop-blur-md flex items-center gap-1 dark:bg-coffee-950/90 dark:border-coffee-850">
                <Navigation className="h-2.5 w-2.5 text-saffron-500 fill-saffron-500" /> Kolkata Central HQ
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
