'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Trash2, Plus, Minus, Tag, Coffee, Ticket, ChevronRight, ShoppingCart, ShoppingBag, ArrowRight } from 'lucide-react';
import KolamBackground from '@/components/KolamBackground';

export default function CartPage() {
  const {
    user,
    cart,
    updateCartQuantity,
    removeFromCart,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    cartTotals
  } = useApp();
  const router = useRouter();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [recommendedItems, setRecommendedItems] = useState<any[]>([]);

  // Calculate cart counts
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Fetch menu to fetch add-on recommendations
  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const res = await fetch('/api/menu');
        const data = await res.json();
        if (data.items) {
          // Suggest desserts/beverages that are NOT currently in the cart
          const cartItemIds = cart.map(c => c.menuItemId);
          const filterAddons = data.items.filter((item: any) =>
            (item.category === 'Beverages' || item.category === 'Desserts') &&
            !cartItemIds.includes(item.id)
          );
          setRecommendedItems(filterAddons.slice(0, 2));
        }
      } catch (err) {
        console.error('Error loading recommendations:', err);
      }
    }
    fetchRecommendations();
  }, [cart]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponError(null);
    setCouponSuccess(null);
    const err = await applyCouponCode(couponInput);
    
    if (err) {
      setCouponError(err);
    } else {
      setCouponSuccess('Coupon applied successfully!');
      setCouponInput('');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      // Redirect to login first, then proceed to checkout
      router.push('/login?redirect=checkout');
    } else {
      router.push('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="relative min-h-[60vh] bg-cream-50 flex flex-col items-center justify-center py-20 px-4 text-center dark:bg-coffee-950 transition-colors duration-300">
        <KolamBackground className="opacity-[0.03] dark:opacity-[0.02]" />
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-saffron-100 text-saffron-500 mb-6 dark:bg-saffron-950/30">
          <ShoppingBag className="h-10 w-10 animate-bounce" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-temple-900 dark:text-cream-100">Your Cart is Empty</h1>
        <p className="text-sm text-temple-900/60 dark:text-cream-300/60 mt-2 max-w-sm">Looks like you haven't added any delicious South Indian meals to your cart yet.</p>
        <Link
          href="/menu"
          className="mt-6 rounded-full bg-saffron-500 py-3.5 px-8 font-bold text-cream-50 hover:bg-saffron-600 hover:shadow-premium transition-all"
        >
          Explore Full Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-cream-50 pb-20 dark:bg-coffee-950 transition-colors duration-300">
      
      {/* Kolam Decorative Watermark */}
      <KolamBackground className="opacity-[0.02] dark:opacity-[0.01]" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.uniqueId}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-cream-200 bg-cream-50 shadow-sm dark:border-coffee-800 dark:bg-coffee-900 transition-colors"
              >
                {/* Details */}
                <div className="flex-1 text-left">
                  <h3 className="font-serif text-base font-bold text-temple-900 dark:text-cream-100">{item.name}</h3>
                  {/* Customizations listing */}
                  {(item.selectedExtras.length > 0 || item.selectedToppings.length > 0 || item.selectedCombo) && (
                    <div className="flex flex-wrap gap-1.5 mt-1 text-[10px] text-temple-900/60 dark:text-cream-300/60">
                      {item.selectedExtras.map(e => <span key={e} className="rounded bg-cream-200/50 px-1.5 py-0.5 dark:bg-coffee-850">+{e}</span>)}
                      {item.selectedToppings.map(t => <span key={t} className="rounded bg-cream-200/50 px-1.5 py-0.5 dark:bg-coffee-850">+{t}</span>)}
                      {item.selectedCombo && <span className="rounded bg-saffron-100 text-saffron-700 px-1.5 py-0.5 dark:bg-saffron-950/20 dark:text-saffron-400">Combo: {item.selectedCombo}</span>}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-saffron-500 block mt-1.5">
                    ₹{item.price + item.customizationPrice} each
                  </span>
                </div>

                {/* Adjustments and action */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Quantity adjustment */}
                  <div className="flex items-center gap-1.5 rounded-full border border-cream-300 bg-cream-100 p-1 dark:border-coffee-800 dark:bg-coffee-850">
                    <button
                      onClick={() => updateCartQuantity(item.uniqueId, item.quantity - 1)}
                      className="rounded-full p-1 text-temple-900 hover:bg-cream-200 dark:text-cream-100 dark:hover:bg-coffee-750"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.uniqueId, item.quantity + 1)}
                      className="rounded-full p-1 text-temple-900 hover:bg-cream-200 dark:text-cream-100 dark:hover:bg-coffee-750"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Item Total Price */}
                  <span className="text-sm font-bold text-temple-900 dark:text-cream-100 w-16 text-right">
                    ₹{(item.price + item.customizationPrice) * item.quantity}
                  </span>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.uniqueId)}
                    className="rounded-full p-1.5 text-temple-900/40 hover:text-red-500 hover:bg-red-50 dark:text-cream-300/40 dark:hover:bg-red-950/20"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Upsell/Recommendations Area */}
            {recommendedItems.length > 0 && (
              <div className="rounded-2xl border border-cream-200 p-5 bg-cream-50/50 dark:border-coffee-800 dark:bg-coffee-900/50 mt-6">
                <h4 className="font-serif text-sm font-bold flex items-center gap-1.5"><Coffee className="h-4.5 w-4.5 text-saffron-500" /> Complete your Saapaadu (Recommended Add-ons)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  {recommendedItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3 bg-cream-50 rounded-xl border border-cream-200 dark:bg-coffee-900 dark:border-coffee-800"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-10 w-10 rounded-lg object-cover shrink-0"
                        />
                        <div className="overflow-hidden">
                          <h5 className="truncate text-xs font-bold text-temple-900 dark:text-cream-100 leading-snug">{item.name}</h5>
                          <span className="text-[10px] text-saffron-500 font-bold">₹{item.price}</span>
                        </div>
                      </div>
                      <Link
                        href="/menu"
                        className="rounded-full border border-saffron-500/30 px-3 py-1 text-[10px] font-bold text-saffron-500 hover:bg-saffron-500 hover:text-cream-50 transition-colors"
                      >
                        Add
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Checkout Order Summary Column */}
          <div className="space-y-6">
            
            {/* Coupon Code Input */}
            <div className="rounded-2xl border border-cream-200 p-5 bg-cream-50 dark:border-coffee-800 dark:bg-coffee-900">
              <h4 className="font-serif text-sm font-bold flex items-center gap-1.5"><Ticket className="h-4.5 w-4.5 text-saffron-500" /> Apply Coupon</h4>
              
              {appliedCoupon ? (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-green-50/50 p-3 border border-green-200 dark:bg-green-950/20 dark:border-green-900">
                  <div>
                    <span className="font-mono text-xs font-bold text-green-700 dark:text-green-400">{appliedCoupon.code}</span>
                    <p className="text-[10px] text-green-600 dark:text-green-500 leading-none mt-0.5">Applied! Saved ₹{cartTotals.discount}</p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-bold text-red-600 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. DOSAHUB50)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 rounded-xl border border-cream-200 bg-cream-100 px-3.5 py-2 text-xs focus:outline-none focus:border-saffron-500 dark:bg-coffee-950 dark:border-coffee-800 dark:text-cream-50"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-temple-900 py-2 px-4.5 text-xs font-bold text-cream-50 hover:bg-temple-950 dark:bg-coffee-800 dark:hover:bg-coffee-750"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponError && <p className="mt-2 text-[10px] text-red-600 font-medium">{couponError}</p>}
              {couponSuccess && <p className="mt-2 text-[10px] text-green-600 font-medium">{couponSuccess}</p>}
              
              <Link href="/offers" className="mt-3 flex items-center gap-1 text-[10px] font-bold text-saffron-500 hover:underline">
                View Available Offers <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Calculations Bill Details Card */}
            <div className="rounded-2xl border border-cream-200 p-6 bg-cream-50 dark:border-coffee-800 dark:bg-coffee-900 space-y-4">
              <h4 className="font-serif text-base font-bold pb-2 border-b border-cream-200 dark:border-coffee-800">Bill Details</h4>
              
              <div className="space-y-2.5 text-xs text-temple-900/70 dark:text-cream-200/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-temple-900 dark:text-cream-50">₹{cartTotals.subtotal}</span>
                </div>
                
                {cartTotals.discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Coupon Discount</span>
                    <span>-₹{cartTotals.discount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Taxes (5% GST)</span>
                  <span className="font-semibold text-temple-900 dark:text-cream-50">₹{cartTotals.tax}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  {cartTotals.deliveryCharge === 0 ? (
                    <span className="text-green-600 font-semibold dark:text-green-400">FREE</span>
                  ) : (
                    <span className="font-semibold text-temple-900 dark:text-cream-50">₹{cartTotals.deliveryCharge}</span>
                  )}
                </div>

                {cartTotals.deliveryCharge > 0 && (
                  <p className="text-[10px] text-temple-900/40 dark:text-cream-300/40 italic leading-none pt-1">
                    Add ₹{400 - cartTotals.subtotal} more to unlock FREE delivery!
                  </p>
                )}
              </div>

              <div className="border-t border-cream-200 pt-4 flex justify-between font-serif text-base font-extrabold dark:border-coffee-850">
                <span>To Pay</span>
                <span className="text-saffron-500">₹{cartTotals.total}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-saffron-500 py-3.5 px-6 font-bold text-cream-50 hover:bg-saffron-600 hover:shadow-premium shadow-sm transition-all"
              >
                Proceed to Checkout <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
