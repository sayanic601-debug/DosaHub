'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { User as UserIcon, Mail, MapPin, Trash2, Calendar, ShoppingBag, Clock, Navigation, RefreshCcw, AlertTriangle } from 'lucide-react';
import KolamBackground from '@/components/KolamBackground';

export default function ProfilePage() {
  const { user, token, logout, updateUser, addToCart } = useApp();
  const router = useRouter();

  // Personal Info Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Addresses & Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    setName(user.name);
    setEmail(user.email);
  }, [user]);

  // Fetch past orders
  useEffect(() => {
    async function fetchOrders() {
      if (!token) return;
      try {
        const res = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Error loading order history:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    }
    fetchOrders();
  }, [token]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSavingProfile(true);
    setProfileMsg(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'updateProfile', name, email })
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileMsg({ type: 'error', text: data.error || 'Failed to update profile' });
        setIsSavingProfile(false);
        return;
      }

      updateUser(data.user);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Connection error. Could not save profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'deleteAddress', addressId })
      });
      const data = await res.json();
      if (res.ok && user) {
        updateUser({ ...user, addresses: data.addresses });
      }
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  const handleReorder = (orderItems: any[]) => {
    // Loop through order items and add to cart
    orderItems.forEach(item => {
      // Mock menu item format to support addToCart logic
      const menuItemMock = {
        id: item.menuItemId,
        name: item.name,
        price: item.price,
        customizations: {
          // Fallback options to prevent modal crashes since they are already customized
          extras: item.selectedExtras.map((e: string) => ({ name: e, price: 0 })),
          toppings: item.selectedToppings.map((t: string) => ({ name: t, price: 0 })),
          combos: item.selectedCombo ? [{ name: item.selectedCombo, price: 0 }] : []
        }
      };
      addToCart(menuItemMock, item.quantity, item.selectedExtras, item.selectedToppings, item.selectedCombo);
    });

    router.push('/cart');
  };

  if (!user) return null;

  return (
    <div className="relative min-h-screen bg-cream-50 pb-20 dark:bg-coffee-950 transition-colors duration-300">
      
      <KolamBackground className="opacity-[0.02] dark:opacity-[0.01]" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Personal info & addresses */}
          <div className="space-y-6">
            
            {/* User details card */}
            <div className="rounded-2xl border border-cream-200 p-6 bg-cream-50 dark:border-coffee-800 dark:bg-coffee-900 text-left">
              <h2 className="font-serif text-base font-bold text-temple-900 dark:text-cream-100 flex items-center gap-1.5 mb-4 border-b border-cream-200 pb-2 dark:border-coffee-850">
                <UserIcon className="h-4.5 w-4.5 text-saffron-500" /> Personal Details
              </h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-cream-200 bg-cream-100 px-3.5 py-2.5 text-xs focus:outline-none dark:bg-coffee-950 dark:border-coffee-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-cream-200 bg-cream-100 px-3.5 py-2.5 text-xs focus:outline-none dark:bg-coffee-950 dark:border-coffee-800"
                  />
                </div>

                {profileMsg && (
                  <p className={`text-[10px] font-bold ${profileMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {profileMsg.text}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="rounded-full bg-saffron-500 py-2.5 px-6 text-xs font-bold text-cream-50 hover:bg-saffron-600 shadow-sm disabled:opacity-50"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Saved addresses card */}
            <div className="rounded-2xl border border-cream-200 p-6 bg-cream-50 dark:border-coffee-800 dark:bg-coffee-900 text-left">
              <h2 className="font-serif text-base font-bold text-temple-900 dark:text-cream-100 flex items-center gap-1.5 mb-4 border-b border-cream-200 pb-2 dark:border-coffee-850">
                <MapPin className="h-4.5 w-4.5 text-saffron-500" /> Saved Addresses
              </h2>

              {user.addresses && user.addresses.length > 0 ? (
                <div className="space-y-3">
                  {user.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-cream-200 bg-cream-100 p-3 text-xs dark:bg-coffee-950 dark:border-coffee-850"
                    >
                      <div className="overflow-hidden">
                        <span className="font-bold text-temple-900 dark:text-cream-100">{addr.label}</span>
                        <p className="truncate text-temple-900/60 dark:text-cream-300/60 mt-0.5">{addr.addressLine}</p>
                        <p className="text-[10px] text-temple-950/40 dark:text-cream-300/40 mt-0.5">{addr.city} - {addr.postalCode}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="rounded-full p-1 text-temple-900/40 hover:text-red-500 hover:bg-red-50 dark:text-cream-300/40"
                        aria-label="Delete address"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-temple-900/40 dark:text-cream-300/40 italic">No saved addresses yet.</p>
              )}
            </div>

          </div>

          {/* Right Column: Order History list */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="rounded-2xl border border-cream-200 p-6 bg-cream-50 dark:border-coffee-800 dark:bg-coffee-900 text-left">
              <h2 className="font-serif text-base font-bold text-temple-900 dark:text-cream-100 flex items-center gap-1.5 mb-6 border-b border-cream-200 pb-2 dark:border-coffee-850">
                <ShoppingBag className="h-4.5 w-4.5 text-saffron-500" /> Order History
              </h2>

              {isLoadingOrders ? (
                <div className="space-y-4">
                  {[1, 2].map(idx => (
                    <div key={idx} className="h-40 skeleton rounded-xl" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <ShoppingBag className="h-10 w-10 text-temple-900/20 mx-auto dark:text-cream-300/20" />
                  <p className="text-xs text-temple-900/50 dark:text-cream-300/50 font-bold">No orders found.</p>
                  <Link href="/menu" className="inline-block rounded-full bg-saffron-500 py-2 px-5 text-xs font-bold text-cream-50">
                    Order Delicious Dosa
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="rounded-xl border border-cream-200 p-5 bg-cream-100/50 dark:border-coffee-800 dark:bg-coffee-950 flex flex-col gap-4 text-xs"
                    >
                      {/* Header details */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-cream-200 pb-3 dark:border-coffee-900">
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-temple-900/40 dark:text-cream-300/40">Order ID</span>
                            <h4 className="font-mono text-sm font-bold mt-0.5">#{ord.id}</h4>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-temple-900/40 dark:text-cream-300/40">Placed On</span>
                            <div className="flex items-center gap-1 mt-0.5 font-semibold text-temple-900/80 dark:text-cream-200/80">
                              <Calendar className="h-3.5 w-3.5 text-saffron-500" /> {new Date(ord.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Status tag */}
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            ord.status === 'Delivered'
                              ? 'bg-green-150 text-green-700 dark:bg-green-950/35 dark:text-green-300'
                              : ord.status === 'Cancelled'
                              ? 'bg-red-50 text-red-600 dark:bg-red-950/20'
                              : 'bg-saffron-100 text-saffron-700 dark:bg-saffron-950/20 dark:text-saffron-400'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                      </div>

                      {/* Items ordered details */}
                      <div className="space-y-1.5">
                        {ord.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-temple-950/80 dark:text-cream-200/80">
                            <span>{item.name} <span className="text-saffron-500">x{item.quantity}</span></span>
                            <span>₹{(item.price + item.customizationPrice) * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Total and reorder/tracking CTA buttons */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-cream-200 pt-3.5 dark:border-coffee-900">
                        <div className="font-bold text-sm text-temple-900 dark:text-cream-100">
                          Total Paid: <span className="text-saffron-500">₹{ord.total}</span>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          {ord.status !== 'Delivered' && ord.status !== 'Cancelled' && (
                            <Link
                              href={`/track/${ord.id}`}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-full bg-saffron-500 py-1.5 px-4 font-bold text-cream-50 hover:bg-saffron-600 text-center"
                            >
                              <Navigation className="h-3 w-3 shrink-0 animate-pulse" /> Track Live
                            </Link>
                          )}
                          <button
                            onClick={() => handleReorder(ord.items)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-full border border-cream-300 bg-cream-50 py-1.5 px-4 font-bold hover:bg-cream-150 dark:bg-coffee-900 dark:border-coffee-750"
                          >
                            <RefreshCcw className="h-3.5 w-3.5 text-saffron-500 shrink-0" /> Reorder
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
