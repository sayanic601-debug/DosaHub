'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { MapPin, Clock, Phone, MessageCircle, Navigation, Check, Bike, Coffee, AlertTriangle } from 'lucide-react';
import KolamBackground from '@/components/KolamBackground';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const { token } = useApp();

  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverChatOpen, setDriverChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: 'driver', text: "Vanakkam! I've loaded your food in the thermal heat bag. Heading out soon." }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Fetch and poll order details
  useEffect(() => {
    async function fetchOrder() {
      if (!token) return;
      try {
        const res = await fetch(`/api/orders?id=${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to load tracking details');
        } else {
          setOrder(data.order);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();

    // Poll every 3 seconds to simulate movement
    const interval = setInterval(fetchOrder, 3000);
    return () => clearInterval(interval);
  }, [id, token]);

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages(prev => [
      ...prev,
      { sender: 'user', text: chatInput }
    ]);
    setChatInput('');

    // Trigger mock automated reply from driver after 1.5s
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { sender: 'driver', text: "Roger that! Sambar is packed extra tight so it doesn't spill. See you shortly." }
      ]);
    }, 1500);
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
        <h2 className="font-serif text-xl font-bold">Tracking details unavailable</h2>
        <p className="text-xs text-temple-900/60 dark:text-cream-300/60">We could not retrieve tracking data for Order #{id}.</p>
        <Link href="/" className="mt-4 rounded-full bg-saffron-500 px-6 py-2.5 text-xs font-bold text-cream-50">
          Go Home
        </Link>
      </div>
    );
  }

  // Calculate percentages for UI trackers
  const statusSteps = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'];
  const currentStepIndex = statusSteps.indexOf(order.status);

  // Driver details coordinates for drawing
  const driverLoc = order.driverLocation || { lat: 12.9716, lng: 77.6412, statusText: 'Restaurant accepts order' };
  
  // Custom styled local vector map drawing coordinates:
  // Kitchen (Indiranagar): x=100, y=100
  // User (Koramangala/Postcode): x=300, y=300
  // We compute driver visual SVG position by interpolating from 100 to 300
  let riderX = 100;
  let riderY = 100;

  if (order.status === 'Preparing') {
    riderX = 100; riderY = 100;
  } else if (order.status === 'Out for Delivery') {
    const elapsedMs = Date.now() - new Date(order.createdAt).getTime();
    const elapsedSec = elapsedMs / 1000;
    const deliveryElapsed = elapsedSec - 50;
    const ratio = Math.min(deliveryElapsed / 60, 1);
    
    // Smooth diagonal interpolation
    riderX = 100 + (300 - 100) * ratio;
    riderY = 100 + (300 - 100) * ratio;
  } else if (order.status === 'Delivered') {
    riderX = 300; riderY = 300;
  }

  return (
    <div className="relative min-h-screen bg-cream-50 pb-20 dark:bg-coffee-950 transition-colors duration-300">
      
      <KolamBackground className="opacity-[0.02] dark:opacity-[0.01]" />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">Track Order #{order.id}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tracking Stats and Map */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Map visualizer container */}
            <div className="relative h-96 w-full rounded-2xl border border-cream-200 bg-cream-100 overflow-hidden shadow-sm dark:border-coffee-800 dark:bg-coffee-900 flex flex-col justify-between">
              
              {/* Overlay location stats */}
              <div className="absolute top-4 left-4 z-10 rounded-xl bg-cream-50/90 p-4 border border-cream-200/50 backdrop-blur-md max-w-sm text-left shadow-sm dark:bg-coffee-950/90 dark:border-coffee-850">
                <span className="text-[9px] uppercase font-bold text-saffron-500">Live Status</span>
                <p className="font-serif text-sm font-extrabold mt-0.5">{driverLoc.statusText}</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-temple-900/60 dark:text-cream-300/60 font-semibold">
                  <Navigation className="h-3 w-3 text-temple-500 fill-temple-500 animate-pulse shrink-0" />
                  Rider lat: {driverLoc.lat.toFixed(5)}, lng: {driverLoc.lng.toFixed(5)}
                </div>
              </div>

              {/* Styled Mock Vector Map SVG */}
              <svg className="h-full w-full" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Gridlines */}
                <path d="M 0,100 L 400,100 M 0,200 L 400,200 M 0,300 L 400,300 M 100,0 L 100,400 M 200,0 L 200,400 M 300,0 L 300,400" stroke="currentColor" className="opacity-5" strokeWidth="1" />
                
                {/* Curved Road Highway */}
                <path d="M 100,100 Q 150,220 200,200 T 300,300" stroke="#E0A96D" strokeWidth="8" strokeLinecap="round" className="opacity-30 dark:opacity-20" />
                
                {/* Saffron dotted active progress road */}
                <path d="M 100,100 Q 150,220 200,200 T 300,300" stroke="#D95D39" strokeWidth="4" strokeLinecap="round" strokeDasharray="6" className="opacity-80" />

                {/* Indiranagar Kitchen pin (Start) */}
                <circle cx="100" cy="100" r="14" fill="#1B4332" className="animate-pulse" />
                <circle cx="100" cy="100" r="6" fill="#FAF8F5" />
                <text x="80" y="80" fill="currentColor" className="text-[10px] font-bold opacity-60">DosaHub Kitchen</text>

                {/* User Delivery Location Pin (End) */}
                <circle cx="300" cy="300" r="14" fill="#D95D39" className="animate-pulse" />
                <path d="M 300,300 L 300,290" stroke="#FAF8F5" strokeWidth="2" />
                <circle cx="300" cy="300" r="4" fill="#FAF8F5" />
                <text x="270" y="325" fill="currentColor" className="text-[10px] font-bold opacity-60">Home 📍</text>

                {/* Active Rider Scooter Icon (Dynamic coordinates) */}
                {order.status !== 'Delivered' && (
                  <g transform={`translate(${riderX - 12}, ${riderY - 12})`}>
                    <circle cx="12" cy="12" r="12" fill="#D95D39" className="shadow" />
                    <Bike className="h-4 w-4 text-cream-50 absolute m-1.5" />
                  </g>
                )}
              </svg>

              {/* Bottom bar inside map */}
              <div className="bg-cream-50 p-4 border-t border-cream-200 dark:bg-coffee-950 dark:border-coffee-800 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-saffron-100 flex items-center justify-center font-bold text-saffron-700">R</div>
                  <div className="text-left">
                    <span className="text-[10px] text-temple-900/40 dark:text-cream-300/40 block leading-none">Your Rider</span>
                    <span className="text-xs font-bold">Ramesh Kumar</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href="tel:+91987654321"
                    className="rounded-full border border-cream-300 p-2 hover:bg-cream-200 dark:border-coffee-750 dark:hover:bg-coffee-900"
                    aria-label="Call driver"
                  >
                    <Phone className="h-4.5 w-4.5 text-saffron-500" />
                  </a>
                  <button
                    onClick={() => setDriverChatOpen(!driverChatOpen)}
                    className="rounded-full border border-cream-300 p-2 hover:bg-cream-200 dark:border-coffee-750 dark:hover:bg-coffee-900"
                    aria-label="Message driver"
                  >
                    <MessageCircle className="h-4.5 w-4.5 text-saffron-500" />
                  </button>
                </div>
              </div>

            </div>

            {/* Chat drawer overlays inside container if clicked */}
            {driverChatOpen && (
              <div className="rounded-2xl border border-cream-200 p-5 bg-cream-50 dark:border-coffee-800 dark:bg-coffee-900 flex flex-col h-72 text-left animate-fade-in">
                <div className="flex items-center justify-between border-b border-cream-200 pb-3 dark:border-coffee-800">
                  <h4 className="font-serif text-sm font-bold">Chat with Ramesh (Rider)</h4>
                  <button onClick={() => setDriverChatOpen(false)} className="text-xs font-bold text-temple-900/50 hover:text-red-500">Close</button>
                </div>
                <div className="flex-1 overflow-y-auto py-3 space-y-2">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <span className={`rounded-xl px-3 py-1.5 text-xs max-w-[80%] ${
                        msg.sender === 'user' ? 'bg-saffron-500 text-cream-50' : 'bg-cream-200 dark:bg-coffee-850 text-temple-950 dark:text-cream-100'
                      }`}>
                        {msg.text}
                      </span>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendChatMessage} className="flex gap-2 border-t border-cream-200 pt-2.5 dark:border-coffee-850">
                  <input
                    type="text"
                    placeholder="Type message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 rounded-full border border-cream-200 bg-cream-100 px-3.5 py-1.5 text-xs focus:outline-none focus:border-saffron-500 dark:bg-coffee-950 dark:border-coffee-850"
                  />
                  <button type="submit" className="rounded-full bg-saffron-500 text-cream-50 px-4 py-1.5 text-xs font-bold">Send</button>
                </form>
              </div>
            )}

          </div>

          {/* Right Column: Tracking Progress steps checklist */}
          <div className="space-y-6 text-left">
            
            {/* Steps card */}
            <div className="rounded-2xl border border-cream-200 p-6 bg-cream-50 dark:border-coffee-800 dark:bg-coffee-900">
              <h3 className="font-serif text-base font-bold mb-6 border-b border-cream-200 pb-2 dark:border-coffee-800">Order Progress</h3>
              
              <div className="relative pl-6 space-y-8">
                {/* Continuous progress line down steps */}
                <div className="absolute left-2.5 top-2 w-0.5 h-[80%] bg-cream-300 dark:bg-coffee-850" />
                <div
                  className="absolute left-2.5 top-2 w-0.5 bg-saffron-500 transition-all duration-500"
                  style={{ height: `${(currentStepIndex / 3) * 80}%` }}
                />

                {statusSteps.map((stepName, index) => {
                  const isDone = currentStepIndex >= index;
                  const isCurrent = currentStepIndex === index;
                  
                  return (
                    <div key={stepName} className="relative flex items-start gap-4">
                      {/* Step Indicator Dot */}
                      <div className={`absolute -left-6 z-10 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold transition-colors ${
                        isDone
                          ? 'border-saffron-500 bg-saffron-500 text-cream-50 shadow-sm'
                          : 'border-cream-300 bg-cream-50 text-temple-900/30 dark:border-coffee-800 dark:bg-coffee-900'
                      }`}>
                        {isDone ? <Check className="h-3.5 w-3.5" /> : index + 1}
                      </div>

                      <div>
                        <h4 className={`text-sm font-bold ${
                          isCurrent ? 'text-saffron-500' : isDone ? 'text-temple-900 dark:text-cream-100' : 'text-temple-900/40 dark:text-cream-300/40'
                        }`}>
                          {stepName}
                        </h4>
                        <p className="text-[10px] text-temple-900/50 dark:text-cream-300/50 leading-tight">
                          {stepName === 'Placed' && 'Order received and confirmed'}
                          {stepName === 'Preparing' && 'Chef is baking ghee roasts'}
                          {stepName === 'Out for Delivery' && 'Rider left kitchen in insulated carrier'}
                          {stepName === 'Delivered' && 'Order reached your door. Enjoy the hot saapaadu!'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Support helpline card */}
            <div className="rounded-2xl border border-cream-200 p-6 bg-cream-50 dark:border-coffee-800 dark:bg-coffee-900 space-y-4">
              <h4 className="font-serif text-sm font-bold flex items-center gap-1.5"><Coffee className="h-4.5 w-4.5 text-saffron-500 animate-spin" style={{ animationDuration: '6s' }} /> Need Assistance?</h4>
              <p className="text-xs text-temple-900/60 dark:text-cream-300/60">
                If your order is delayed or if you have packaging issues, call our kitchen hotline instantly.
              </p>
              <div className="flex flex-col gap-2.5">
                <a
                  href="tel:+91987654321"
                  className="w-full flex items-center justify-center gap-1.5 rounded-full border border-cream-300 bg-cream-100 py-2 text-xs font-semibold hover:bg-cream-200 dark:bg-coffee-850 dark:border-coffee-750 dark:hover:bg-coffee-800"
                >
                  <Phone className="h-3.5 w-3.5 text-saffron-500" /> +91 98765 43210
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
