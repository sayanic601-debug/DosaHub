'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { CheckCircle, Clock, MapPin, FileText, ArrowRight, Printer, AlertTriangle, Coffee } from 'lucide-react';
import confetti from 'canvas-confetti';
import KolamBackground from '@/components/KolamBackground';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const { token } = useApp();
  const router = useRouter();

  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fire confetti celebration!
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });

    async function fetchOrder() {
      if (!token) return;
      try {
        const res = await fetch(`/api/orders?id=${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to load order confirmation details');
        } else {
          setOrder(data.order);
        }
      } catch (err) {
        setError('Connection error. Failed to retrieve order details.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();
  }, [id, token]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center dark:bg-coffee-950">
        <div className="h-40 w-40 skeleton rounded-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] bg-cream-50 flex flex-col items-center justify-center gap-3 dark:bg-coffee-950">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h2 className="font-serif text-xl font-bold">Failed to load Order Confirmation</h2>
        <p className="text-xs text-temple-900/60 dark:text-cream-300/60">Please check your internet connection or order ID.</p>
        <Link href="/" className="mt-4 rounded-full bg-saffron-500 px-6 py-2.5 text-xs font-bold text-cream-50">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-cream-50 pb-20 dark:bg-coffee-950 transition-colors duration-300 print:bg-white print:pb-0">
      
      <KolamBackground className="opacity-[0.03] dark:opacity-[0.02] print:hidden" />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 print:py-0 print:px-0">
        
        {/* Confetti Banner */}
        <div className="text-center space-y-3.5 print:hidden">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400">
            <CheckCircle className="h-10 w-10 animate-fade-in" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-saffron-500">Order Successful!</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold">Vanakkam, saapaadu is ready!</h1>
          <p className="text-sm text-temple-900/60 dark:text-cream-300/60 max-w-md mx-auto">
            Your order has been received and sent to the chef. We will deliver it piping hot inside banana-leaf wrapping!
          </p>
        </div>

        {/* Invoice details sheet */}
        <div className="mt-10 rounded-2xl border border-cream-200 bg-cream-50 p-6 sm:p-8 shadow-premium dark:border-coffee-800 dark:bg-coffee-900 print:shadow-none print:border-none">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cream-200 pb-5 dark:border-coffee-800">
            <div>
              <p className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50">Order ID</p>
              <h2 className="font-mono text-base font-extrabold text-temple-900 dark:text-cream-100">#{order.id}</h2>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50">Estimated Delivery</p>
              <div className="flex items-center gap-1 mt-0.5 text-sm font-extrabold">
                <Clock className="h-4 w-4 text-saffron-500" /> 20 - 30 Mins
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="py-6 border-b border-cream-200 dark:border-coffee-800 space-y-4">
            <h3 className="font-serif text-sm font-bold text-temple-900 dark:text-cream-100 flex items-center gap-1.5"><MapPin className="h-4 w-4 text-saffron-500" /> Delivery Address</h3>
            <div className="text-xs text-temple-900/70 dark:text-cream-200/80">
              <span className="font-bold text-temple-900 dark:text-cream-100">{order.deliveryAddress.label}</span>
              <p className="mt-0.5">{order.deliveryAddress.addressLine}</p>
              <p className="mt-0.5">{order.deliveryAddress.city} - {order.deliveryAddress.postalCode}</p>
            </div>
          </div>

          {/* Items Summary Table */}
          <div className="py-6 border-b border-cream-200 dark:border-coffee-800 space-y-4">
            <h3 className="font-serif text-sm font-bold text-temple-900 dark:text-cream-100 flex items-center gap-1.5"><Coffee className="h-4 w-4 text-saffron-500" /> Items Ordered</h3>
            
            <div className="space-y-3">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-start gap-4 text-xs text-temple-900/80 dark:text-cream-200/90">
                  <div className="text-left">
                    <span className="font-semibold text-temple-900 dark:text-cream-100">{item.name} <span className="text-saffron-500">x{item.quantity}</span></span>
                    {/* customizations */}
                    {(item.selectedExtras.length > 0 || item.selectedToppings.length > 0 || item.selectedCombo) && (
                      <p className="text-[10px] text-temple-900/50 dark:text-cream-300/50 mt-0.5">
                        {item.selectedExtras.join(', ')} {item.selectedToppings.join(', ')} {item.selectedCombo ? `(${item.selectedCombo})` : ''}
                      </p>
                    )}
                  </div>
                  <span className="font-bold">₹{(item.price + item.customizationPrice) * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Billing breakdown */}
          <div className="py-6 space-y-3 text-xs text-temple-900/70 dark:text-cream-200/80">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount ({order.couponCode})</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Taxes (5% GST)</span>
              <span>₹{order.tax}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span>
            </div>
            <div className="border-t border-cream-200 pt-4 flex justify-between font-serif text-base font-extrabold text-temple-900 dark:text-cream-100 dark:border-coffee-800">
              <span>Paid via {order.paymentMethod}</span>
              <span className="text-saffron-500">₹{order.total}</span>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center print:hidden">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-full border border-cream-300 bg-cream-50 py-3.5 px-6 font-bold hover:bg-cream-150 dark:border-coffee-750 dark:bg-coffee-900 transition-colors"
          >
            <Printer className="h-4 w-4 text-saffron-500" /> Print Invoice
          </button>
          
          <Link
            href={`/track/${order.id}`}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-full bg-saffron-500 py-3.5 px-8 font-bold text-cream-50 hover:bg-saffron-600 hover:shadow-premium shadow-sm transition-all"
          >
            Track Order Live <ArrowRight className="h-4.5 w-4.5" />
          </Link>
        </div>

      </div>

    </div>
  );
}
