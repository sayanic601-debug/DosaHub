'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Coffee, Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-temple-900 text-cream-100 dark:bg-coffee-950 dark:text-cream-200/90 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          
          {/* Logo & Slogan */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron-500 text-cream-50">
                <svg viewBox="0 0 100 100" className="h-6 w-6 fill-none stroke-current" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="50" cy="50" r="40" strokeWidth="4" className="opacity-30" />
                  <circle cx="36" cy="36" r="8" fill="currentColor" className="opacity-60" />
                  <circle cx="64" cy="36" r="6" fill="currentColor" className="opacity-60" />
                  <path d="M18 78 L82 26" stroke="currentColor" strokeWidth="11" />
                  <path d="M22 81 L78 29" stroke="#FAF8F5" strokeWidth="2.5" className="opacity-80" />
                </svg>
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-cream-50">
                Dosa<span className="text-saffron-400">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-cream-200/70">
              Serving crispy, golden, ghee-roasted authentic South Indian delicacies since 2012. Freshly prepared, quickly delivered.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-saffron-400">Explore</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/menu" className="hover:text-saffron-400 transition-colors">Our Menu</Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-saffron-400 transition-colors">Today's Offers</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-saffron-400 transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-saffron-400 transition-colors">Contact Support</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-saffron-400">Contact Us</h3>
            <ul className="mt-4 space-y-3.5 text-sm text-cream-200/80">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 shrink-0 text-saffron-400" />
                <span>12 Park Street, Kolkata, West Bengal 700016</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-saffron-400" />
                <span>+91 79801 90215</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-saffron-400" />
                <span>support@dosahub.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-saffron-400">Newsletter</h3>
            <p className="text-xs text-cream-200/70">
              Subscribe to get updates on new dishes, festive specials, and exclusive discounts.
            </p>
            <form onSubmit={handleSubscribe} className="relative mt-2 flex items-center">
              <input
                type="email"
                placeholder="Your email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full bg-temple-800 py-2.5 pl-4 pr-12 text-sm text-cream-100 placeholder-cream-300/40 border border-temple-700 focus:border-saffron-500 focus:outline-none dark:bg-coffee-900 dark:border-coffee-800"
              />
              <button
                type="submit"
                className="absolute right-1 rounded-full bg-saffron-500 p-2 hover:bg-saffron-600 transition-colors"
                aria-label="Subscribe"
              >
                <Send className="h-4 w-4 text-cream-100" />
              </button>
            </form>
            {subscribed && (
              <span className="text-xs text-green-400 animate-fade-in font-medium">
                Thank you! You're subscribed successfully.
              </span>
            )}
          </div>

        </div>

        <div className="mt-12 border-t border-temple-800 pt-8 text-center text-xs text-cream-200/50 dark:border-coffee-900">
          <p>© {new Date().getFullYear()} DosaHub Food Delivery Services. Made with ♥ in Bengaluru.</p>
        </div>
      </div>
    </footer>
  );
}
