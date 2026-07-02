'use client';

import React, { useEffect, useState } from 'react';
import { Ticket, Copy, Check, Sparkles, Coffee } from 'lucide-react';
import KolamBackground from '@/components/KolamBackground';

export default function OffersPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCoupons() {
      try {
        const res = await fetch('/api/coupons');
        const data = await res.json();
        if (data.coupons) {
          setCoupons(data.coupons);
        }
      } catch (err) {
        console.error('Error loading coupons:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCoupons();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="relative min-h-[80vh] bg-cream-50 pb-20 dark:bg-coffee-950 transition-colors duration-300">
      
      <KolamBackground className="opacity-[0.03] dark:opacity-[0.02]" />

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-temple-900 to-saffron-900 py-12 text-center text-cream-50 dark:from-coffee-950 dark:to-saffron-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">Deals & Coupons</h1>
          <p className="mt-2 text-sm sm:text-base text-cream-200/80">Apply these promo codes during checkout to unlock discounts on your favorite South Indian feasts.</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 skeleton rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coupons.map((coupon) => (
              <div
                key={coupon.code}
                className="group relative overflow-hidden rounded-2xl border border-cream-200 bg-cream-50 p-6 text-left shadow-sm hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300 dark:border-coffee-800 dark:bg-coffee-900"
              >
                {/* Decorative background light */}
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-saffron-500/5 group-hover:bg-saffron-500/10 blur-xl transition-colors" />

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-saffron-500/10 text-saffron-500">
                    <Ticket className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-mono text-base font-bold text-temple-900 dark:text-cream-100 tracking-wider">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => handleCopy(coupon.code)}
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${
                          copiedCode === coupon.code
                            ? 'bg-green-600 border-green-600 text-cream-50'
                            : 'bg-cream-100 border-cream-200 text-saffron-500 hover:bg-cream-200 dark:bg-coffee-950 dark:border-coffee-850'
                        }`}
                      >
                        {copiedCode === coupon.code ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Copy Code
                          </>
                        )}
                      </button>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-saffron-500 mt-1">
                      {coupon.discountPercent}% Discount
                    </h3>
                    
                    <p className="text-xs text-temple-900/60 dark:text-cream-300/60 leading-relaxed">
                      {coupon.description}
                    </p>

                    <div className="pt-3 border-t border-cream-200/50 mt-4 flex justify-between items-center text-[10px] text-temple-950/45 dark:text-cream-300/40 dark:border-coffee-850">
                      <span>Min Order: ₹{coupon.minOrderAmount}</span>
                      <span>Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                    </div>

                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
