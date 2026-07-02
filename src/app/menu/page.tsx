'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Search, Heart, Star, Clock, AlertTriangle, Sparkles, Flame, Check, Plus, Minus, X, Coffee, Utensils, Layers, ChefHat, Cookie, Circle } from 'lucide-react';

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'All': return <Utensils className="h-3.5 w-3.5" />;
    case 'Favorites': return <Heart className="h-3.5 w-3.5" />;
    case 'Dosa': return <Flame className="h-3.5 w-3.5" />;
    case 'Idli': return <Sparkles className="h-3.5 w-3.5" />;
    case 'Vada': return <Circle className="h-3.5 w-3.5" strokeWidth={3} />;
    case 'Uttapam': return <Layers className="h-3.5 w-3.5" />;
    case 'Meals': return <ChefHat className="h-3.5 w-3.5" />;
    case 'Biryani': return <Sparkles className="h-3.5 w-3.5" />;
    case 'Desserts': return <Cookie className="h-3.5 w-3.5" />;
    case 'Beverages': return <Coffee className="h-3.5 w-3.5" />;
    default: return <Utensils className="h-3.5 w-3.5" />;
  }
};
import KolamBackground from '@/components/KolamBackground';

function MenuContent() {
  const { user, token, cart, addToCart, toggleWishlist } = useApp();
  const searchParams = useSearchParams();

  // Search/Filters states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const [selectedSpiceLevel, setSelectedSpiceLevel] = useState<number | null>(null);

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Customization modal states
  const [customizingItem, setCustomizingItem] = useState<any | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [selectedCombo, setSelectedCombo] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  // Category tags
  const CATEGORIES = ['All', 'Favorites', 'Dosa', 'Idli', 'Vada', 'Uttapam', 'Meals', 'Biryani', 'Desserts', 'Beverages'];

  // Fetch menu items from API
  useEffect(() => {
    async function fetchMenu() {
      setIsLoading(true);
      try {
        let url = `/api/menu?category=${selectedCategory === 'Favorites' ? 'All' : selectedCategory}`;
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data.items) {
          setMenuItems(data.items);
        }
      } catch (err) {
        console.error('Error fetching menu items:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMenu();
  }, [selectedCategory, searchQuery]);

  // Apply filters on client side (Veg, Spice level)
  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory === 'Favorites') {
      return isWishlisted(item.id);
    }
    if (filterVegOnly && !item.isVeg) return false;
    if (selectedSpiceLevel !== null && item.spiceLevel !== selectedSpiceLevel) return false;
    return true;
  });

  const handleOpenCustomizer = (item: any) => {
    setCustomizingItem(item);
    setSelectedExtras([]);
    setSelectedToppings([]);
    setSelectedCombo(undefined);
    setQuantity(1);
  };

  const handleAddExtra = (name: string) => {
    setSelectedExtras(prev =>
      prev.includes(name) ? prev.filter(e => e !== name) : [...prev, name]
    );
  };

  const handleAddTopping = (name: string) => {
    setSelectedToppings(prev =>
      prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]
    );
  };

  const handleAddCombo = (name: string) => {
    setSelectedCombo(prev => prev === name ? undefined : name);
  };

  const handleConfirmAddToCart = () => {
    if (!customizingItem) return;
    addToCart(customizingItem, quantity, selectedExtras, selectedToppings, selectedCombo);
    setCustomizingItem(null);
  };

  // Check if item is in wishlist
  const isWishlisted = (itemId: string) => {
    return user && user.wishlist ? user.wishlist.includes(itemId) : false;
  };

  // Calculate customized total price in modal
  const calculateModalTotal = () => {
    if (!customizingItem) return 0;
    let base = customizingItem.price;
    selectedExtras.forEach(extraName => {
      const opt = customizingItem.customizations.extras.find((e: any) => e.name === extraName);
      if (opt) base += opt.price;
    });
    selectedToppings.forEach(topName => {
      const opt = customizingItem.customizations.toppings.find((t: any) => t.name === topName);
      if (opt) base += opt.price;
    });
    if (selectedCombo) {
      const opt = customizingItem.customizations.combos.find((c: any) => c.name === selectedCombo);
      if (opt) base += opt.price;
    }
    return base * quantity;
  };

  return (
    <div className="relative min-h-screen bg-cream-50 pb-20 dark:bg-coffee-950 transition-colors duration-300">
      
      {/* Kolam Decorative Watermark */}
      <KolamBackground className="opacity-[0.03] dark:opacity-[0.02]" />

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-br from-temple-900 to-saffron-900 py-12 text-center text-cream-50 dark:from-coffee-950 dark:to-saffron-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">DosaHub Main Kitchen</h1>
          <p className="mt-2 text-sm sm:text-base text-cream-200/80">Choose from our hot, fresh South Indian recipes, made to order.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        
        {/* Search, Filter Category tabs, and dietary toggles */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-cream-200 pb-6 dark:border-coffee-900">
          
          {/* Category Tabs */}
          <div className="flex gap-3.5 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  if (cat === 'Favorites' && !user) {
                    alert('Please login to view your favorite items!');
                    window.location.href = `/login?redirect=/menu`;
                  } else {
                    setSelectedCategory(cat);
                  }
                }}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold whitespace-nowrap transition-all border hover:scale-102 active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-saffron-500 text-cream-50 border-saffron-500 shadow-premium'
                    : 'bg-cream-100 text-temple-900 border-cream-200 hover:bg-cream-200/50 dark:bg-coffee-900 dark:border-coffee-800 dark:text-cream-200 dark:hover:bg-coffee-800'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
              </button>
            ))}
          </div>

          {/* Search bar inside page */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-temple-900/40 dark:text-cream-300/40" />
            <input
              type="text"
              placeholder="Search in menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-cream-200 bg-cream-50 py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-saffron-500 dark:bg-coffee-900 dark:border-coffee-800 dark:text-cream-50"
            />
          </div>

        </div>

        {/* Detailed Filters (Veg only, Spice scale) */}
        <div className="flex flex-wrap items-center gap-6 mt-4.5 text-xs">
          
          {/* Veg Only Slider Switch */}
          <button
            onClick={() => setFilterVegOnly(!filterVegOnly)}
            className={`flex items-center gap-2 rounded-full py-1.5 px-3.5 font-bold transition-all border ${
              filterVegOnly
                ? 'bg-green-600 text-cream-50 border-green-600'
                : 'bg-cream-50 text-temple-900/70 border-cream-200 dark:bg-coffee-900 dark:border-coffee-800 dark:text-cream-200'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${filterVegOnly ? 'bg-cream-50' : 'bg-green-600'}`} />
            VEG ONLY
          </button>

          {/* Spice Level Selectors */}
          <div className="flex items-center gap-2 text-temple-900/60 dark:text-cream-300/60">
            <span className="font-semibold">Spice Level:</span>
            {[1, 2, 3].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedSpiceLevel(selectedSpiceLevel === lvl ? null : lvl)}
                className={`flex items-center gap-0.5 rounded-full py-1.5 px-3 font-bold border transition-colors ${
                  selectedSpiceLevel === lvl
                    ? 'bg-red-600 text-cream-50 border-red-600'
                    : 'bg-cream-50 text-temple-900/70 border-cream-200 dark:bg-coffee-900 dark:border-coffee-800 dark:text-cream-200'
                }`}
              >
                <Flame className={`h-3 w-3 ${selectedSpiceLevel === lvl ? 'text-cream-50' : 'text-red-500'}`} />
                {lvl === 1 ? 'Mild' : lvl === 2 ? 'Medium' : 'Hot'}
              </button>
            ))}
          </div>

        </div>

        {/* Menu Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="h-80 rounded-2xl skeleton" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <AlertTriangle className="h-12 w-12 text-brass-500" />
            <h3 className="font-serif text-xl font-bold">No Dishes Found</h3>
            <p className="text-sm text-temple-900/60 dark:text-cream-300/60">Try adjustments to your search query or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-cream-200 bg-cream-50 shadow-sm hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300 dark:border-coffee-800 dark:bg-coffee-900"
              >
                {/* Visual Area */}
                <div className="relative h-48 w-full overflow-hidden bg-cream-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleWishlist(item.id)}
                    className="absolute right-3 top-3 rounded-full bg-cream-50/90 p-2 text-temple-900 hover:text-red-500 hover:scale-110 shadow-sm dark:bg-coffee-950 dark:text-cream-100 transition-all duration-300"
                    aria-label="Add to favorites"
                  >
                    <Heart className={`h-4 w-4 ${isWishlisted(item.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                  {/* Veg Tag */}
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-[9px] font-bold text-green-700 dark:bg-green-950 dark:text-green-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                    VEG
                  </span>
                </div>

                {/* Info Content */}
                <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate font-serif text-lg font-bold text-temple-900 dark:text-cream-100 group-hover:text-saffron-500 transition-colors">
                        {item.name}
                      </h3>
                      <span className="text-base font-extrabold text-saffron-500 shrink-0">₹{item.price}</span>
                    </div>
                    <p className="text-xs text-temple-900/60 dark:text-cream-300/60 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Attributes and Add CTA */}
                  <div className="border-t border-cream-200/50 pt-3 flex items-center justify-between dark:border-coffee-800/50">
                    <div className="flex items-center gap-3 text-[10px] text-temple-950/45 dark:text-cream-300/40">
                      <span className="flex items-center gap-0.5"><Clock className="h-3.5 w-3.5 text-saffron-400" /> {item.prepTime}m</span>
                      <span className="flex items-center gap-0.5"><Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" /> {item.rating}</span>
                      {item.spiceLevel > 1 && (
                        <span className="flex items-center text-red-500 font-bold">
                          <Flame className="h-3 w-3 shrink-0" />
                          {item.spiceLevel === 3 ? 'HOT' : 'MED'}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenCustomizer(item)}
                      className="rounded-full bg-saffron-500 py-1.5 px-4.5 text-xs font-bold text-cream-50 hover:bg-saffron-600 hover:shadow-premium transition-all"
                    >
                      Add +
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Food Customization Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-coffee-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-cream-50 dark:bg-coffee-950 border border-cream-200 dark:border-coffee-900 shadow-premium-lg flex flex-col overflow-hidden max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-cream-200 px-6 py-4.5 dark:border-coffee-900 bg-cream-100 dark:bg-coffee-900">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-saffron-500" />
                <h3 className="font-serif text-lg font-bold text-temple-950 dark:text-cream-100">Customize Dish</h3>
              </div>
              <button
                onClick={() => setCustomizingItem(null)}
                className="rounded-full p-1.5 text-temple-900/50 hover:bg-cream-200 dark:text-cream-300/50 dark:hover:bg-coffee-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex gap-4">
                <img
                  src={customizingItem.image}
                  alt={customizingItem.name}
                  className="h-20 w-20 rounded-xl object-cover shrink-0"
                />
                <div>
                  <h4 className="font-serif text-base font-bold">{customizingItem.name}</h4>
                  <p className="text-xs text-temple-900/60 dark:text-cream-300/60 mt-0.5 leading-snug">{customizingItem.description}</p>
                  <span className="text-sm font-extrabold text-saffron-500 block mt-1.5">₹{customizingItem.price}</span>
                </div>
              </div>

              {/* Extras Selector */}
              {customizingItem.customizations.extras.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-temple-900/50 dark:text-cream-300/50 border-b border-cream-200 pb-1.5 dark:border-coffee-900">Select Extras</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {customizingItem.customizations.extras.map((extra: any) => {
                      const isSelected = selectedExtras.includes(extra.name);
                      return (
                        <button
                          key={extra.name}
                          onClick={() => handleAddExtra(extra.name)}
                          className={`flex items-center justify-between rounded-xl border p-3.5 text-xs font-semibold text-left transition-colors ${
                            isSelected
                              ? 'border-saffron-500 bg-saffron-50/40 text-saffron-700 dark:text-saffron-400 dark:bg-saffron-950/20'
                              : 'border-cream-200 bg-cream-50 hover:bg-cream-100 dark:border-coffee-900 dark:bg-coffee-900'
                          }`}
                        >
                          <span>{extra.name}</span>
                          <span className="flex items-center gap-1.5 font-bold text-saffron-500">
                            +₹{extra.price}
                            {isSelected && <Check className="h-3.5 w-3.5 text-saffron-600 dark:text-saffron-400 shrink-0" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Toppings Selector */}
              {customizingItem.customizations.toppings.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-temple-900/50 dark:text-cream-300/50 border-b border-cream-200 pb-1.5 dark:border-coffee-900">Choose Toppings</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {customizingItem.customizations.toppings.map((top: any) => {
                      const isSelected = selectedToppings.includes(top.name);
                      return (
                        <button
                          key={top.name}
                          onClick={() => handleAddTopping(top.name)}
                          className={`flex items-center justify-between rounded-xl border p-3.5 text-xs font-semibold text-left transition-colors ${
                            isSelected
                              ? 'border-saffron-500 bg-saffron-50/40 text-saffron-700 dark:text-saffron-400 dark:bg-saffron-950/20'
                              : 'border-cream-200 bg-cream-50 hover:bg-cream-100 dark:border-coffee-900 dark:bg-coffee-900'
                          }`}
                        >
                          <span>{top.name}</span>
                          <span className="flex items-center gap-1.5 font-bold text-saffron-500">
                            +₹{top.price}
                            {isSelected && <Check className="h-3.5 w-3.5 text-saffron-600 dark:text-saffron-400 shrink-0" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Combo deal Selector */}
              {customizingItem.customizations.combos.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-temple-900/50 dark:text-cream-300/50 border-b border-cream-200 pb-1.5 dark:border-coffee-900">Make it a Smart Combo (AI Recommended)</h5>
                  <div className="space-y-2 mt-3">
                    {customizingItem.customizations.combos.map((combo: any) => {
                      const isSelected = selectedCombo === combo.name;
                      return (
                        <button
                          key={combo.name}
                          onClick={() => handleAddCombo(combo.name)}
                          className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-xs font-semibold text-left transition-colors ${
                            isSelected
                              ? 'border-saffron-500 bg-saffron-50/40 text-saffron-700 dark:text-saffron-400 dark:bg-saffron-950/20'
                              : 'border-cream-200 bg-cream-50 hover:bg-cream-100 dark:border-coffee-900 dark:bg-coffee-900'
                          }`}
                        >
                          <div>
                            <span className="font-bold flex items-center gap-1"><Coffee className="h-3.5 w-3.5 text-saffron-500 shrink-0" /> {combo.name}</span>
                            <span className="text-[10px] text-temple-900/50 dark:text-cream-300/50 font-normal leading-none mt-0.5 block">{combo.description}</span>
                          </div>
                          <span className="flex items-center gap-1.5 font-bold text-saffron-500">
                            +₹{combo.price}
                            {isSelected && <Check className="h-3.5 w-3.5 text-saffron-600 shrink-0" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Action Footer */}
            <div className="border-t border-cream-200 bg-cream-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 dark:border-coffee-900 dark:bg-coffee-900">
              
              {/* Quantity Selectors */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-temple-900/60 dark:text-cream-300/60">Quantity:</span>
                <div className="flex items-center gap-1.5 rounded-full border border-cream-300 bg-cream-50 p-1 dark:border-coffee-800 dark:bg-coffee-950">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="rounded-full p-1 text-temple-900 hover:bg-cream-200 dark:text-cream-100 dark:hover:bg-coffee-850"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="rounded-full p-1 text-temple-900 hover:bg-cream-200 dark:text-cream-100 dark:hover:bg-coffee-850"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Add Cart CTA with total price calculated dynamically */}
              <button
                onClick={handleConfirmAddToCart}
                className="w-full sm:w-auto rounded-full bg-saffron-500 py-3.5 px-8 text-xs font-bold text-cream-50 hover:bg-saffron-600 hover:shadow-premium shadow-sm transition-all"
              >
                Add to Cart • ₹{calculateModalTotal()}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-50 flex items-center justify-center dark:bg-coffee-950"><div className="h-20 w-20 rounded-full skeleton animate-pulse" /></div>}>
      <MenuContent />
    </Suspense>
  );
}
