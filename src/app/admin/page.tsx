'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Shield, Sparkles, TrendingUp, ShoppingBag, Users, DollarSign, Edit, Trash2, Plus, Check, CheckCircle2, ChevronRight, X, AlertTriangle } from 'lucide-react';
import KolamBackground from '@/components/KolamBackground';

// Local Mock Analytics Data
const REVENUE_BY_DAY = [
  { day: 'Mon', sales: 4500 },
  { day: 'Tue', sales: 5200 },
  { day: 'Wed', sales: 4900 },
  { day: 'Thu', sales: 6100 },
  { day: 'Fri', sales: 7500 },
  { day: 'Sat', sales: 9800 },
  { day: 'Sun', sales: 11200 },
];

export default function AdminDashboard() {
  const { user, token } = useApp();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [menu, setMenu] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit/Add Menu Item modal form state
  const [showItemForm, setShowItemForm] = useState(false);
  const [formItemId, setFormItemId] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState('Dosa');
  const [itemDescription, setItemDescription] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [itemIsVeg, setItemIsVeg] = useState(true);
  const [itemSpice, setItemSpice] = useState(2);
  const [formError, setFormError] = useState<string | null>(null);

  // Security guard
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/');
    }
  }, [user]);

  // Load orders and menu data
  useEffect(() => {
    async function loadData() {
      if (!token) return;
      try {
        const [ordersRes, menuRes] = await Promise.all([
          fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/menu')
        ]);
        
        const ordersData = await ordersRes.json();
        const menuData = await menuRes.json();
        
        if (ordersData.orders) setOrders(ordersData.orders);
        if (menuData.items) setMenu(menuData.items);
      } catch (err) {
        console.error('Error loading admin panel data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [token]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        triggerToast('Order status updated successfully!');
      }
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemPrice || !itemDescription || !itemImage) {
      setFormError('Please fill out all food fields.');
      return;
    }

    setFormError(null);
    const body = {
      id: formItemId || undefined,
      name: itemName,
      price: Number(itemPrice),
      category: itemCategory,
      description: itemDescription,
      image: itemImage,
      isVeg: itemIsVeg,
      spiceLevel: Number(itemSpice),
      prepTime: 12
    };

    try {
      const method = formItemId ? 'PUT' : 'POST';
      const res = await fetch('/api/menu', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setFormError(data.error || 'Failed to save menu item');
        return;
      }

      // Sync menu list
      if (formItemId) {
        setMenu(prev => prev.map(m => m.id === formItemId ? data.item : m));
      } else {
        setMenu(prev => [...prev, data.item]);
      }

      triggerToast('Menu item saved successfully!');
      setShowItemForm(false);
      resetForm();
    } catch (err) {
      setFormError('Connection error. Could not write to database.');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await fetch(`/api/menu?id=${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMenu(prev => prev.filter(m => m.id !== itemId));
        triggerToast('Menu item deleted.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const resetForm = () => {
    setFormItemId(null);
    setItemName('');
    setItemPrice('');
    setItemCategory('Dosa');
    setItemDescription('');
    setItemImage('');
    setItemIsVeg(true);
    setItemSpice(2);
  };

  const handleOpenEdit = (item: any) => {
    setFormItemId(item.id);
    setItemName(item.name);
    setItemPrice(item.price.toString());
    setItemCategory(item.category);
    setItemDescription(item.description);
    setItemImage(item.image);
    setItemIsVeg(item.isVeg);
    setItemSpice(item.spiceLevel);
    setShowItemForm(true);
  };

  // Calculates total revenue from orders placed
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="relative min-h-screen bg-cream-50 pb-20 dark:bg-coffee-950 transition-colors duration-300">
      
      <KolamBackground className="opacity-[0.02] dark:opacity-[0.01]" />

      {/* Title */}
      <div className="bg-gradient-to-br from-temple-900 to-saffron-900 py-12 text-center text-cream-50 dark:from-coffee-950 dark:to-saffron-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-left">
            <h1 className="font-serif text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-7 w-7 text-saffron-400" /> Admin Dashboard
            </h1>
            <p className="mt-1 text-xs text-cream-200/80">Manage products, orders, coupons, and review kitchen statistics.</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowItemForm(true); }}
            className="flex items-center justify-center gap-1.5 rounded-full bg-saffron-500 py-2.5 px-6 text-xs font-bold text-cream-50 hover:bg-saffron-600 shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" /> Add Food Item
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 space-y-10">
        
        {/* Toast success notify */}
        {successMsg && (
          <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 text-xs font-bold text-cream-50 shadow-premium animate-fade-in">
            <CheckCircle2 className="h-4.5 w-4.5 text-cream-50" /> {successMsg}
          </div>
        )}

        {/* 1. Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1 */}
          <div className="rounded-2xl border border-cream-200 p-6 bg-cream-50 dark:border-coffee-800 dark:bg-coffee-900 flex justify-between items-center text-left">
            <div>
              <span className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50">Total Revenue</span>
              <h3 className="font-serif text-2xl font-extrabold text-temple-900 dark:text-cream-100 mt-1">₹{totalRevenue}</h3>
              <span className="text-[9px] text-green-600 dark:text-green-500 font-semibold mt-0.5 block">↑ 12.3% this week</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-saffron-500/10 flex items-center justify-center text-saffron-500">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-cream-200 p-6 bg-cream-50 dark:border-coffee-800 dark:bg-coffee-900 flex justify-between items-center text-left">
            <div>
              <span className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50">Active Orders</span>
              <h3 className="font-serif text-2xl font-extrabold text-temple-900 dark:text-cream-100 mt-1">{activeOrdersCount}</h3>
              <span className="text-[9px] text-saffron-500 font-semibold mt-0.5 block">Cooking in kitchen</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-saffron-500/10 flex items-center justify-center text-saffron-500">
              <ShoppingBag className="h-6 w-6 animate-pulse" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-cream-200 p-6 bg-cream-50 dark:border-coffee-800 dark:bg-coffee-900 flex justify-between items-center text-left">
            <div>
              <span className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50">Total Orders</span>
              <h3 className="font-serif text-2xl font-extrabold text-temple-900 dark:text-cream-100 mt-1">{orders.length}</h3>
              <span className="text-[9px] text-green-600 dark:text-green-500 font-semibold mt-0.5 block">Completed & pending</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-saffron-500/10 flex items-center justify-center text-saffron-500">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl border border-cream-200 p-6 bg-cream-50 dark:border-coffee-800 dark:bg-coffee-900 flex justify-between items-center text-left">
            <div>
              <span className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50">Registered Foodies</span>
              <h3 className="font-serif text-2xl font-extrabold text-temple-900 dark:text-cream-100 mt-1">2</h3>
              <span className="text-[9px] text-temple-900/40 dark:text-cream-300/40 block mt-0.5">Active accounts</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-saffron-500/10 flex items-center justify-center text-saffron-500">
              <Users className="h-6 w-6" />
            </div>
          </div>

        </div>

        {/* 2. Visual Sales Chart Area */}
        <div className="rounded-2xl border border-cream-200 p-6 bg-cream-50 dark:border-coffee-800 dark:bg-coffee-900 text-left">
          <h3 className="font-serif text-base font-bold mb-4 flex items-center gap-1.5"><TrendingUp className="h-5 w-5 text-saffron-500" /> Weekly Sales Chart</h3>
          {/* Custom SVG Bar Chart */}
          <div className="h-56 w-full flex items-end justify-between pt-6 border-b border-cream-200 dark:border-coffee-800 pb-2">
            {REVENUE_BY_DAY.map((dayData) => {
              // Calculate height percentage (max is Mon-Sun, Sun is 11200 max)
              const heightPct = (dayData.sales / 12000) * 100;
              return (
                <div key={dayData.day} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-[9px] font-bold text-saffron-500">₹{dayData.sales}</span>
                  <div
                    className="w-8 sm:w-12 bg-gradient-to-t from-temple-500 to-saffron-500 rounded-t-lg shadow-sm hover:opacity-90 transition-all duration-500"
                    style={{ height: `${Math.max(10, heightPct * 1.5)}px` }}
                  />
                  <span className="text-[10px] font-semibold text-temple-900/60 dark:text-cream-300/60">{dayData.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 3. Order Management Checklist (Lists orders, status actions) */}
          <div className="lg:col-span-2 rounded-2xl border border-cream-200 p-6 bg-cream-50 dark:border-coffee-800 dark:bg-coffee-900 text-left space-y-4">
            <h3 className="font-serif text-base font-bold border-b border-cream-200 pb-2 dark:border-coffee-800">Order Management</h3>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-32 skeleton rounded-xl" />)}
              </div>
            ) : orders.length === 0 ? (
              <p className="text-xs text-temple-900/40 dark:text-cream-300/40 italic py-6">No orders registered yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl border border-cream-200 bg-cream-100/50 dark:border-coffee-850 dark:bg-coffee-950 space-y-3.5 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <span className="font-mono font-bold text-temple-900 dark:text-cream-100">#{ord.id}</span>
                        <p className="text-[10px] text-temple-900/50 dark:text-cream-300/50">By: {ord.userName} ({ord.userEmail})</p>
                      </div>
                      
                      {/* Status select dropdown */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-temple-900/50 dark:text-cream-300/50">Status:</span>
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          className="rounded-lg border border-cream-200 bg-cream-50 py-1.5 px-2.5 text-[10px] font-bold focus:outline-none dark:bg-coffee-900 dark:border-coffee-800"
                        >
                          <option value="Placed">Placed</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* itemized */}
                    <div className="text-[11px] text-temple-900/80 dark:text-cream-200/80 leading-snug">
                      {ord.items.map((it: any, idx: number) => (
                        <div key={idx}>
                          • {it.name} x{it.quantity} <span className="text-saffron-500 font-semibold">(₹{(it.price + it.customizationPrice) * it.quantity})</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-[10px] border-t border-cream-200 pt-2.5 dark:border-coffee-900">
                      <span>Address: {ord.deliveryAddress.addressLine}, {ord.deliveryAddress.city}</span>
                      <span className="font-bold text-saffron-500">Paid: ₹{ord.total}</span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Menu Management (Menu item CRUD list) */}
          <div className="rounded-2xl border border-cream-200 p-6 bg-cream-50 dark:border-coffee-800 dark:bg-coffee-900 text-left space-y-4">
            <h3 className="font-serif text-base font-bold border-b border-cream-200 pb-2 dark:border-coffee-800">Menu Catalog</h3>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-16 skeleton rounded-xl" />)}
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {menu.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-3 bg-cream-100/50 rounded-xl border border-cream-200 dark:bg-coffee-950 dark:border-coffee-850"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                      <div className="overflow-hidden">
                        <h4 className="truncate text-xs font-bold text-temple-900 dark:text-cream-100 leading-snug">{item.name}</h4>
                        <span className="text-[10px] text-saffron-500 font-bold block">₹{item.price} • {item.category}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="rounded-full p-1.5 text-temple-900/40 hover:text-saffron-500 hover:bg-cream-200 dark:text-cream-300/40"
                        aria-label="Edit dish"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="rounded-full p-1.5 text-temple-900/40 hover:text-red-500 hover:bg-red-50 dark:text-cream-300/40"
                        aria-label="Delete dish"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Add / Edit Menu Item Dialog Form */}
      {showItemForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-coffee-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-cream-50 dark:bg-coffee-950 border border-cream-200 dark:border-coffee-900 shadow-premium-lg flex flex-col overflow-hidden max-h-[95vh] text-left">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cream-200 px-6 py-4.5 dark:border-coffee-900 bg-cream-100 dark:bg-coffee-900">
              <h3 className="font-serif text-lg font-bold text-temple-950 dark:text-cream-100 flex items-center gap-1.5">
                <Sparkles className="h-5 w-5 text-saffron-500" />
                {formItemId ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                onClick={() => setShowItemForm(false)}
                className="rounded-full p-1.5 text-temple-900/50 hover:bg-cream-200 dark:text-cream-300/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveMenuItem} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50 block mb-1">Dish Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Ghee Roast Masala Dosa"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full rounded-xl border border-cream-200 bg-cream-100 px-3.5 py-2.5 text-xs focus:outline-none dark:bg-coffee-950 dark:border-coffee-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50 block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="140"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full rounded-xl border border-cream-200 bg-cream-100 px-3.5 py-2.5 text-xs focus:outline-none dark:bg-coffee-950 dark:border-coffee-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50 block mb-1">Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full rounded-xl border border-cream-200 bg-cream-50 px-3.5 py-2.5 text-xs focus:outline-none dark:bg-coffee-950 dark:border-coffee-800"
                  >
                    <option>Dosa</option>
                    <option>Idli</option>
                    <option>Vada</option>
                    <option>Uttapam</option>
                    <option>Meals</option>
                    <option>Biryani</option>
                    <option>Desserts</option>
                    <option>Beverages</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50 block mb-1">Spice Level (1-3)</label>
                  <select
                    value={itemSpice}
                    onChange={(e) => setItemSpice(Number(e.target.value))}
                    className="w-full rounded-xl border border-cream-200 bg-cream-50 px-3.5 py-2.5 text-xs focus:outline-none dark:bg-coffee-950 dark:border-coffee-800"
                  >
                    <option value={1}>1 - Mild</option>
                    <option value={2}>2 - Medium</option>
                    <option value={3}>3 - Hot</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50 block mb-1">Food Image URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={itemImage}
                  onChange={(e) => setItemImage(e.target.value)}
                  className="w-full rounded-xl border border-cream-200 bg-cream-100 px-3.5 py-2.5 text-xs focus:outline-none dark:bg-coffee-950 dark:border-coffee-800"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50 block mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Crispy crepe smeared inside with ghee..."
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="w-full rounded-xl border border-cream-200 bg-cream-100 px-3.5 py-2.5 text-xs focus:outline-none dark:bg-coffee-950 dark:border-coffee-800 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVeg"
                  checked={itemIsVeg}
                  onChange={(e) => setItemIsVeg(e.target.checked)}
                  className="rounded border-cream-200 focus:ring-saffron-500"
                />
                <label htmlFor="isVeg" className="text-xs font-bold text-temple-900/70 dark:text-cream-200/80">100% Pure Vegetarian Dish</label>
              </div>

              {formError && (
                <div className="flex items-center gap-1.5 rounded-lg bg-red-50 p-3 text-[10px] font-semibold text-red-600 dark:bg-red-950/25 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4 border-t border-cream-200 dark:border-coffee-900">
                <button
                  type="button"
                  onClick={() => setShowItemForm(false)}
                  className="rounded-xl border border-cream-300 px-4 py-2.5 text-xs font-semibold text-temple-900 dark:border-coffee-750 dark:text-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-saffron-500 py-2.5 px-6 text-xs font-bold text-cream-50 hover:bg-saffron-600 shadow-sm"
                >
                  Save Item
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
