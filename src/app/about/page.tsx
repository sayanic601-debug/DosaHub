'use client';

import React from 'react';
import { Award, ShieldCheck, Heart, Coffee, Sparkles } from 'lucide-react';
import KolamBackground from '@/components/KolamBackground';

export default function AboutPage() {
  return (
    <div className="relative min-h-[80vh] bg-cream-50 pb-20 dark:bg-coffee-950 transition-colors duration-300">
      
      <KolamBackground className="opacity-[0.03] dark:opacity-[0.02]" />

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-temple-900 to-saffron-900 py-12 text-center text-cream-50 dark:from-coffee-950 dark:to-saffron-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">Our Story</h1>
          <p className="mt-2 text-sm sm:text-base text-cream-200/80">From a humble roadside cart in Kolkata to a modern food tech experience.</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pt-12 sm:px-6 lg:px-8 text-left space-y-12">
        
        {/* Story details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-temple-900 dark:text-cream-100">Preserving the Authentic South Indian Legacy</h2>
            <p className="text-xs text-temple-900/70 dark:text-cream-200/80 leading-relaxed">
              At DosaHub, we believe cooking is an art of patience. Our batters are stone-ground for over 8 hours and fermented naturally in clay pots under controlled temperatures to yield that perfect sour-savory flavor profile.
            </p>
            <p className="text-xs text-temple-900/70 dark:text-cream-200/80 leading-relaxed">
              We roast our dosas exclusively in pure cow ghee and hand-pound our gunpowders (podi) weekly to maintain the crisp and sharp aromatics of South India's temple towns.
            </p>
          </div>
          <div className="h-64 rounded-2xl overflow-hidden shadow-premium border border-cream-200 dark:border-coffee-900">
            <img
              src="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop"
              alt="Artisan cooking crispy golden dosa on large pan"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Pillars of DosaHub */}
        <div className="border-t border-cream-200 pt-10 dark:border-coffee-900">
          <h3 className="font-serif text-xl font-bold text-center mb-8">Our Cooking Standards</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Standard 1 */}
            <div className="rounded-xl border border-cream-200 bg-cream-50 p-5 text-center space-y-3 dark:bg-coffee-900 dark:border-coffee-800">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-saffron-500/10 text-saffron-500">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm">Natural Ingredients</h4>
              <p className="text-[11px] text-temple-900/60 dark:text-cream-300/60 leading-normal">
                Absolutely zero artificial colors, preservatives, or MSG in our sambar, chutneys or starters.
              </p>
            </div>

            {/* Standard 2 */}
            <div className="rounded-xl border border-cream-200 bg-cream-50 p-5 text-center space-y-3 dark:bg-coffee-900 dark:border-coffee-800">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-saffron-500/10 text-saffron-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm">100% Pure Ghee</h4>
              <p className="text-[11px] text-temple-900/60 dark:text-cream-300/60 leading-normal">
                No cheap oil shortcuts. We roast using authentic cow ghee for flavor that melts on the tongue.
              </p>
            </div>

            {/* Standard 3 */}
            <div className="rounded-xl border border-cream-200 bg-cream-50 p-5 text-center space-y-3 dark:bg-coffee-900 dark:border-coffee-800">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-saffron-500/10 text-saffron-500">
                <Heart className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm">Insulated Delivery</h4>
              <p className="text-[11px] text-temple-900/60 dark:text-cream-300/60 leading-normal">
                Delivered in custom cardboard boxes designed to maintain crispness and let steam vent safely.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
