'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { MapPin, Plus, CreditCard, Landmark, Wallet, Check, AlertTriangle, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import KolamBackground from '@/components/KolamBackground';

export default function CheckoutPage() {
  const {
    user,
    token,
    cart,
    clearCart,
    cartTotals,
    appliedCoupon,
    updateUser
  } = useApp();
  const router = useRouter();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking' | 'Wallet' | 'CoD'>('Card');
  
  // New address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [addressLine, setAddressLine] = useState('');
  const [addressCity, setAddressCity] = useState('Kolkata');
  const [addressPostal, setAddressPostal] = useState('');
  const [addressError, setAddressError] = useState<string | null>(null);
  
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Set default selected address on load
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=checkout');
      return;
    }
    if (user.addresses && user.addresses.length > 0) {
      setSelectedAddressId(user.addresses[0].id);
    }
  }, [user]);

  // If cart is empty, send back
  useEffect(() => {
    if (cart.length === 0 && !isPlacingOrder) {
      router.push('/cart');
    }
  }, [cart]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine.trim() || !addressPostal.trim()) {
      setAddressError('Please fill out all address fields.');
      return;
    }

    setAddressError(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'saveAddress',
          label: addressLabel,
          addressLine,
          city: addressCity,
          postalCode: addressPostal
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setAddressError(data.error || 'Failed to save address');
        return;
      }
      
      // Update local context user addresses
      if (user) {
        const updatedUser = { ...user, addresses: data.addresses };
        updateUser(updatedUser);
        
        // Select newly added address
        const newAddr = data.addresses[data.addresses.length - 1];
        if (newAddr) setSelectedAddressId(newAddr.id);
      }
      
      // Reset form
      setAddressLine('');
      setAddressPostal('');
      setShowAddressForm(false);
    } catch (err) {
      setAddressError('Connection error. Could not save address.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setErrorMessage('Please select or add a delivery address.');
      return;
    }

    const deliveryAddress = user?.addresses.find(a => a.id === selectedAddressId);
    if (!deliveryAddress) {
      setErrorMessage('Selected address not found.');
      return;
    }

    setErrorMessage(null);
    setIsPlacingOrder(true);

    // Prepare order details
    const orderItems = cart.map(item => ({
      menuItemId: item.menuItemId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      selectedExtras: item.selectedExtras,
      selectedToppings: item.selectedToppings,
      selectedCombo: item.selectedCombo,
      customizationPrice: item.customizationPrice
    }));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderItems,
          subtotal: cartTotals.subtotal,
          tax: cartTotals.tax,
          deliveryCharge: cartTotals.deliveryCharge,
          discount: cartTotals.discount,
          total: cartTotals.total,
          couponCode: appliedCoupon?.code,
          deliveryAddress,
          paymentMethod
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to place order.');
        setIsPlacingOrder(false);
        return;
      }

      // Success
      clearCart();
      router.push(`/order-confirmation/${data.order.id}`);
    } catch (err) {
      setErrorMessage('Connection error. Failed to send order request.');
      setIsPlacingOrder(false);
    }
  };

  if (!user || cart.length === 0) return null;

  return (
    <div className="relative min-h-screen bg-cream-50 pb-20 dark:bg-coffee-950 transition-colors duration-300">
      
      <KolamBackground className="opacity-[0.02] dark:opacity-[0.01]" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">Checkout details</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form details section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Address Selection */}
            <div className="rounded-2xl border border-cream-200 p-6 bg-cream-50 dark:border-coffee-800 dark:bg-coffee-900 text-left">
              <h2 className="font-serif text-lg font-bold flex items-center gap-2 text-temple-900 dark:text-cream-100 mb-4">
                <MapPin className="h-5 w-5 text-saffron-500" />
                1. Delivery Address
              </h2>

              {/* Address List */}
              {user.addresses && user.addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <button
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`flex items-start gap-3 rounded-xl border p-4 text-xs text-left transition-all ${
                          isSelected
                            ? 'border-saffron-500 bg-saffron-50/40 text-saffron-700 dark:text-saffron-400 dark:bg-saffron-950/20'
                            : 'border-cream-200 bg-cream-50 hover:bg-cream-100 dark:border-coffee-900 dark:bg-coffee-900'
                        }`}
                      >
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cream-300 bg-cream-50 text-[10px] font-bold text-saffron-500">
                          {isSelected ? <Check className="h-3 w-3" /> : addr.label[0]}
                        </div>
                        <div className="overflow-hidden">
                          <span className="font-bold text-temple-900 dark:text-cream-100">{addr.label}</span>
                          <p className="truncate text-temple-900/60 dark:text-cream-300/60 mt-0.5">{addr.addressLine}</p>
                          <p className="text-[10px] text-temple-950/40 dark:text-cream-300/40 mt-0.5">{addr.city} - {addr.postalCode}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-cream-300 p-6 text-center text-xs text-temple-900/50 dark:border-coffee-800 dark:text-cream-300/50">
                  No saved addresses found. Please add a new address to place your order.
                </div>
              )}

              {/* Toggle new address button */}
              {!showAddressForm ? (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="mt-4 flex items-center gap-1.5 text-xs font-bold text-saffron-500 hover:text-saffron-600 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add New Address
                </button>
              ) : (
                <form onSubmit={handleAddAddress} className="mt-6 border-t border-cream-200 pt-5 space-y-4 dark:border-coffee-800 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50 block mb-1">Address Label</label>
                      <select
                        value={addressLabel}
                        onChange={(e) => setAddressLabel(e.target.value)}
                        className="w-full rounded-xl border border-cream-200 bg-cream-50 px-3.5 py-2.5 text-xs focus:outline-none dark:bg-coffee-950 dark:border-coffee-800"
                      >
                        <option>Home</option>
                        <option>Office</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50 block mb-1">Postal Code (e.g. 560034)</label>
                      <input
                        type="text"
                        placeholder="560034"
                        required
                        value={addressPostal}
                        onChange={(e) => setAddressPostal(e.target.value)}
                        className="w-full rounded-xl border border-cream-200 bg-cream-50 px-3.5 py-2.5 text-xs focus:outline-none dark:bg-coffee-950 dark:border-coffee-800"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50 block mb-1">Street Address</label>
                    <input
                      type="text"
                      placeholder="Flat No, Block/Building name, street details"
                      required
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      className="w-full rounded-xl border border-cream-200 bg-cream-50 px-3.5 py-2.5 text-xs focus:outline-none dark:bg-coffee-950 dark:border-coffee-800"
                    />
                  </div>

                  {addressError && <p className="text-[10px] text-red-600 font-semibold">{addressError}</p>}
                  
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="rounded-xl border border-cream-300 px-4 py-2 text-xs font-semibold text-temple-900 dark:border-coffee-750 dark:text-cream-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-temple-900 py-2 px-5 text-xs font-bold text-cream-50 hover:bg-temple-950 dark:bg-coffee-800 dark:hover:bg-coffee-750"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

            </div>

            {/* 2. Payment Method Selector */}
            <div className="rounded-2xl border border-cream-200 p-6 bg-cream-50 dark:border-coffee-800 dark:bg-coffee-900 text-left">
              <h2 className="font-serif text-lg font-bold flex items-center gap-2 text-temple-900 dark:text-cream-100 mb-4">
                <CreditCard className="h-5 w-5 text-saffron-500" />
                2. Select Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Credit/Debit Cards */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`flex items-center gap-3.5 rounded-xl border p-4 text-xs text-left transition-all ${
                    paymentMethod === 'Card'
                      ? 'border-saffron-500 bg-saffron-50/40 text-saffron-700 dark:text-saffron-400 dark:bg-saffron-950/20'
                      : 'border-cream-200 bg-cream-50 hover:bg-cream-100 dark:border-coffee-900 dark:bg-coffee-900'
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-saffron-500 shrink-0" />
                  <div>
                    <span className="font-bold text-temple-900 dark:text-cream-100">Credit or Debit Card</span>
                    <p className="text-[10px] text-temple-900/50 dark:text-cream-300/50 mt-0.5">Pay securely via Stripe gateway</p>
                  </div>
                </button>

                {/* UPI options */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`flex items-center gap-3.5 rounded-xl border p-4 text-xs text-left transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-saffron-500 bg-saffron-50/40 text-saffron-700 dark:text-saffron-400 dark:bg-saffron-950/20'
                      : 'border-cream-200 bg-cream-50 hover:bg-cream-100 dark:border-coffee-900 dark:bg-coffee-900'
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-saffron-500 shrink-0" />
                  <div>
                    <span className="font-bold text-temple-900 dark:text-cream-100">UPI (Google Pay / PhonePe)</span>
                    <p className="text-[10px] text-temple-900/50 dark:text-cream-300/50 mt-0.5">Pay via Razorpay instant UPI link</p>
                  </div>
                </button>

                {/* NetBanking */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('NetBanking')}
                  className={`flex items-center gap-3.5 rounded-xl border p-4 text-xs text-left transition-all ${
                    paymentMethod === 'NetBanking'
                      ? 'border-saffron-500 bg-saffron-50/40 text-saffron-700 dark:text-saffron-400 dark:bg-saffron-950/20'
                      : 'border-cream-200 bg-cream-50 hover:bg-cream-100 dark:border-coffee-900 dark:bg-coffee-900'
                  }`}
                >
                  <Landmark className="h-5 w-5 text-saffron-500 shrink-0" />
                  <div>
                    <span className="font-bold text-temple-900 dark:text-cream-100">Net Banking</span>
                    <p className="text-[10px] text-temple-900/50 dark:text-cream-300/50 mt-0.5">Direct bank transfer login</p>
                  </div>
                </button>

                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CoD')}
                  className={`flex items-center gap-3.5 rounded-xl border p-4 text-xs text-left transition-all ${
                    paymentMethod === 'CoD'
                      ? 'border-saffron-500 bg-saffron-50/40 text-saffron-700 dark:text-saffron-400 dark:bg-saffron-950/20'
                      : 'border-cream-200 bg-cream-50 hover:bg-cream-100 dark:border-coffee-900 dark:bg-coffee-900'
                  }`}
                >
                  <Wallet className="h-5 w-5 text-saffron-500 shrink-0" />
                  <div>
                    <span className="font-bold text-temple-900 dark:text-cream-100">Cash on Delivery</span>
                    <p className="text-[10px] text-temple-900/50 dark:text-cream-300/50 mt-0.5">Pay with cash or UPI at delivery time</p>
                  </div>
                </button>
              </div>

            </div>

          </div>

          {/* Right Column: Checkout Summary info */}
          <div className="space-y-6">
            
            {/* Delivery time card */}
            <div className="rounded-2xl border border-cream-200 p-5 bg-cream-50 dark:border-coffee-800 dark:bg-coffee-900 flex items-center gap-3">
              <Clock className="h-10 w-10 text-saffron-500 shrink-0 animate-pulse" />
              <div>
                <h4 className="font-bold text-xs uppercase text-temple-900/50 dark:text-cream-300/50 leading-none">Estimated Delivery</h4>
                <p className="text-sm font-extrabold mt-1">20 - 30 Minutes</p>
                <span className="text-[10px] text-green-600 dark:text-green-500 font-semibold leading-none">Fresh & hot from Indiranagar Kitchen</span>
              </div>
            </div>

            {/* Price Details */}
            <div className="rounded-2xl border border-cream-200 p-6 bg-cream-50 dark:border-coffee-800 dark:bg-coffee-900 space-y-4">
              <h4 className="font-serif text-base font-bold pb-2 border-b border-cream-200 dark:border-coffee-800">Order Summary</h4>
              
              <div className="space-y-2 text-xs text-temple-900/70 dark:text-cream-200/80">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span>₹{cartTotals.subtotal}</span>
                </div>
                
                {cartTotals.discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Coupon Savings</span>
                    <span>-₹{cartTotals.discount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Taxes (GST 5%)</span>
                  <span>₹{cartTotals.tax}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  {cartTotals.deliveryCharge === 0 ? (
                    <span className="text-green-600 font-semibold dark:text-green-400">FREE</span>
                  ) : (
                    <span>₹{cartTotals.deliveryCharge}</span>
                  )}
                </div>
              </div>

              <div className="border-t border-cream-200 pt-4 flex justify-between font-serif text-base font-extrabold dark:border-coffee-850">
                <span>Grand Total</span>
                <span className="text-saffron-500">₹{cartTotals.total}</span>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-1.5 rounded-lg bg-red-50 p-3 text-[10px] font-semibold text-red-600 dark:bg-red-950/20 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {errorMessage}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-saffron-500 py-3.5 px-6 font-bold text-cream-50 hover:bg-saffron-600 disabled:opacity-50 transition-all shadow-premium"
              >
                {isPlacingOrder ? 'Processing Order...' : 'Pay & Place Order'} <ArrowRight className="h-4.5 w-4.5" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-temple-900/40 dark:text-cream-300/40 leading-none border-t border-cream-200/50 pt-4">
                <ShieldCheck className="h-4 w-4 text-green-600" /> Secure SSL 256-bit Encrypted Transaction
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
