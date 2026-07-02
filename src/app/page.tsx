'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Sparkles, Clock, CheckCircle, ShieldAlert, Award, Star, ArrowRight, AppWindow } from 'lucide-react';
import KolamBackground from '@/components/KolamBackground';

// Local category list with custom SVGs/Icons/Mock Images
const CATEGORIES = [
  { name: 'Dosa', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=150&auto=format&fit=crop' },
  { name: 'Idli', image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=150&auto=format&fit=crop' },
  { name: 'Vada', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=150&auto=format&fit=crop' },
  { name: 'Uttapam', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=150&auto=format&fit=crop' },
  { name: 'Meals', image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=150&auto=format&fit=crop' },
  { name: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=150&auto=format&fit=crop' },
  { name: 'Desserts', image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=150&auto=format&fit=crop' },
  { name: 'Beverages', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=150&auto=format&fit=crop' },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Detect mock location
  const handleDetectLocation = () => {
    setIsDetecting(true);
    setTimeout(() => {
      setLocation('Park Street, Kolkata');
      setIsDetecting(false);
    }, 1500);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/menu?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/menu');
    }
  };

  // Fetch menu on load for featured dishes
  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch('/api/menu');
        const data = await res.json();
        if (data.items) {
          // Display top 3 highly-rated items
          const sorted = data.items.sort((a: any, b: any) => b.rating - a.rating);
          setFeaturedItems(sorted.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching featured items:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMenu();
  }, []);

  return (
    <div className="relative overflow-hidden font-sans bg-cream-50 dark:bg-coffee-950 transition-colors duration-300">
      
      {/* Kolam Decorative Watermark */}
      <KolamBackground className="opacity-[0.03] dark:opacity-[0.02]" />

      {/* Hero Banner Section */}
      <section className="relative bg-gradient-to-br from-temple-900 via-temple-800 to-saffron-900 text-cream-50 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden dark:from-coffee-950 dark:via-coffee-900 dark:to-saffron-950">
        
        {/* Floating background circular lights */}
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-saffron-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-45 -left-45 h-[500px] w-[500px] rounded-full bg-brass-500/10 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="flex flex-col gap-6 text-left animate-fade-in">
            
            <div className="inline-flex max-w-max items-center gap-1.5 rounded-full bg-saffron-500/20 px-3.5 py-1 text-xs font-semibold tracking-wider uppercase text-saffron-400">
              <Sparkles className="h-3.5 w-3.5" />
              Traditional South Indian Heritage
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl font-extrabold leading-[1.1] tracking-tight">
              Savor the Crisp, <br />
              <span className="text-saffron-400">Taste the Tradition.</span>
            </h1>

            <p className="text-base sm:text-lg text-cream-100/80 max-w-lg leading-relaxed">
              Fresh, piping hot ghee roast dosas, fluffy idlis, and traditional filters coffee brewed in brass. Delivered straight to your doorstep.
            </p>

            {/* Search and Location Form */}
            <form onSubmit={handleSearchSubmit} className="mt-4 flex flex-col sm:flex-row gap-3 rounded-2xl bg-cream-50/10 p-2 backdrop-blur-md border border-cream-100/10 shadow-lg">
              {/* Location Selector */}
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetecting}
                className="flex items-center gap-2 rounded-xl bg-cream-50/10 px-4 py-3 text-xs font-semibold hover:bg-cream-50/20 transition-all shrink-0 text-cream-100"
              >
                <MapPin className="h-4 w-4 text-saffron-400 shrink-0" />
                <span className="truncate max-w-[120px]">
                  {isDetecting ? 'Locating...' : location || 'Detect Location'}
                </span>
              </button>

              {/* Search Field */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-cream-300/60" />
                <input
                  type="text"
                  placeholder="Search Ghee Roast, Filter Coffee, Pongal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-transparent py-3.5 pl-11 pr-4 text-sm text-cream-50 placeholder-cream-300/50 focus:outline-none focus:ring-1 focus:ring-saffron-400"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-saffron-500 py-3 px-6 text-sm font-bold text-cream-50 shadow-premium hover:bg-saffron-600 transition-colors"
              >
                Search
              </button>
            </form>

            {/* Quick stats tags */}
            <div className="flex flex-wrap items-center gap-6 mt-2 text-xs text-cream-200/60">
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-saffron-400" /> Under 25 mins</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-saffron-400" /> 100% Pure Veg options</span>
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-saffron-400" /> 4.8+ Rated App</span>
            </div>

          </div>

          {/* Hero Right Image (Premium circular dish layout) */}
          <div className="relative flex justify-center items-center">
            
            {/* Artistic border rings */}
            <div className="absolute h-[380px] w-[380px] sm:h-[450px] sm:w-[450px] rounded-full border border-cream-100/10 animate-spin" style={{ animationDuration: '40s' }} />
            <div className="absolute h-[340px] w-[340px] sm:h-[400px] sm:w-[400px] rounded-full border border-dashed border-saffron-500/20 animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />

            {/* Glowing spotlight */}
            <div className="absolute h-[250px] w-[250px] rounded-full bg-saffron-500/20 blur-3xl" />

            <div className="relative h-[280px] w-[280px] sm:h-[350px] sm:w-[350px] overflow-hidden rounded-full border-4 border-cream-200/20 shadow-premium-lg">
              <img
                src="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop"
                alt="Delicous South Indian Crispy Dosa platter"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
              />
            </div>
            
            {/* Popout Badge */}
            <div className="absolute bottom-6 right-6 sm:right-12 rounded-2xl bg-cream-50/90 p-3.5 backdrop-blur-md shadow-premium text-temple-900 border border-cream-200 dark:bg-coffee-900 dark:border-coffee-800 dark:text-cream-100 animate-bounce">
              <span className="text-[10px] uppercase tracking-widest text-saffron-500 font-bold">Today's Special</span>
              <p className="font-serif text-sm font-bold">Ghee Podi Dosa</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-semibold text-temple-900 dark:text-cream-100">₹140</span>
                <span className="text-[10px] text-temple-900/50 dark:text-cream-300/50 line-through">₹180</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Food Categories Slider Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        
        <div className="flex flex-col items-center gap-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-500">Craving Selection</span>
          <h2 className="font-serif text-3xl font-extrabold text-temple-900 dark:text-cream-100">Explore Traditional Flavors</h2>
          <div className="h-1 w-12 bg-saffron-500 rounded mt-1" />
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar justify-start sm:justify-center">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/menu?category=${cat.name}`}
              className="flex flex-col items-center gap-2 min-w-[90px] group focus:outline-none"
            >
              <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-cream-300 bg-cream-50 p-0.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-saffron-500 group-focus:border-saffron-500 dark:border-coffee-800 dark:bg-coffee-900">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <span className="text-xs font-semibold text-temple-900/80 group-hover:text-saffron-500 dark:text-cream-200 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

      </section>

      {/* Today's Special Offers & Coupons */}
      <section className="bg-cream-100/50 py-16 dark:bg-coffee-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col items-center gap-2 mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-saffron-500">Delicious Discounts</span>
            <h2 className="font-serif text-3xl font-extrabold text-temple-900 dark:text-cream-100">Offers of the Day</h2>
            <div className="h-1 w-12 bg-saffron-500 rounded mt-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-saffron-500 to-saffron-600 p-6 text-cream-50 shadow-premium hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
                <Sparkles className="h-40 w-40" />
              </div>
              <span className="rounded-full bg-cream-50/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cream-50">Welcome Feast</span>
              <h3 className="font-serif text-2xl font-bold mt-4">50% OFF</h3>
              <p className="text-sm text-cream-50/80 mt-1">Get up to ₹150 off on your very first order.</p>
              <div className="mt-6 flex items-center justify-between border-t border-cream-50/20 pt-4">
                <div>
                  <span className="text-[10px] uppercase text-cream-50/60 block">Use Code</span>
                  <span className="font-mono text-sm font-bold tracking-wider">DOSAHUB50</span>
                </div>
                <Link
                  href="/menu"
                  className="flex items-center gap-1 rounded-lg bg-cream-50 px-3 py-1.5 text-xs font-bold text-saffron-600 hover:bg-cream-100 transition-colors"
                >
                  Order Now <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-temple-800 to-temple-900 p-6 text-cream-50 shadow-premium-green hover:-translate-y-1 transition-transform duration-300 dark:from-coffee-800 dark:to-coffee-950">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
                <Sparkles className="h-40 w-40" />
              </div>
              <span className="rounded-full bg-cream-50/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cream-50">Lunch Special</span>
              <h3 className="font-serif text-2xl font-bold mt-4">20% OFF Meals</h3>
              <p className="text-sm text-cream-50/80 mt-1">Feast on traditional royal meals on banana leaf.</p>
              <div className="mt-6 flex items-center justify-between border-t border-cream-50/20 pt-4">
                <div>
                  <span className="text-[10px] uppercase text-cream-50/60 block">Use Code</span>
                  <span className="font-mono text-sm font-bold tracking-wider">SOUTHFEAST</span>
                </div>
                <Link
                  href="/menu?category=Meals"
                  className="flex items-center gap-1 rounded-lg bg-cream-50 px-3 py-1.5 text-xs font-bold text-temple-800 hover:bg-cream-100 transition-colors dark:text-coffee-800"
                >
                  Order Now <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brass-500 to-brass-600 p-6 text-cream-50 shadow-premium hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
                <Sparkles className="h-40 w-40" />
              </div>
              <span className="rounded-full bg-cream-50/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cream-50">Filter Kappi Love</span>
              <h3 className="font-serif text-2xl font-bold mt-4">Free Coffee Combo</h3>
              <p className="text-sm text-cream-50/80 mt-1">Get free filter coffee on orders above ₹199.</p>
              <div className="mt-6 flex items-center justify-between border-t border-cream-50/20 pt-4">
                <div>
                  <span className="text-[10px] uppercase text-cream-50/60 block">Use Code</span>
                  <span className="font-mono text-sm font-bold tracking-wider">FREEKAPPI</span>
                </div>
                <Link
                  href="/menu"
                  className="flex items-center gap-1 rounded-lg bg-cream-50 px-3 py-1.5 text-xs font-bold text-brass-600 hover:bg-cream-100 transition-colors"
                >
                  Order Now <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Featured Dishes Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        
        <div className="flex items-end justify-between mb-10">
          <div className="flex flex-col items-start gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-saffron-500">Trending Saapaadu</span>
            <h2 className="font-serif text-3xl font-extrabold text-temple-900 dark:text-cream-100">Featured delicacies</h2>
          </div>
          <Link
            href="/menu"
            className="flex items-center gap-1.5 text-sm font-bold text-saffron-500 hover:text-saffron-600 transition-colors"
          >
            See Full Menu <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Dynamic Menu Loader */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="h-80 rounded-2xl skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredItems.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-cream-200 bg-cream-50 shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all duration-300 dark:border-coffee-800 dark:bg-coffee-900"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Veg Tag */}
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-950 dark:text-green-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                    VEG
                  </span>
                  {/* Rating Tag */}
                  <span className="absolute right-3 top-3 inline-flex items-center gap-0.5 rounded bg-cream-50 px-2 py-0.5 text-[10px] font-bold text-temple-900 shadow-sm dark:bg-coffee-950 dark:text-cream-100">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                    {item.rating}
                  </span>
                </div>
                
                {/* Details */}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-serif text-lg font-bold text-temple-900 dark:text-cream-100 group-hover:text-saffron-500 transition-colors">
                      {item.name}
                    </h3>
                    <span className="text-base font-bold text-saffron-500 shrink-0">₹{item.price}</span>
                  </div>
                  <p className="text-xs text-temple-900/60 dark:text-cream-300/60 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  
                  {/* Footer info and button */}
                  <div className="mt-4 flex items-center justify-between border-t border-cream-200/50 pt-3 dark:border-coffee-800/50">
                    <span className="text-[10px] font-medium text-temple-950/40 dark:text-cream-300/40">
                      Prep time: {item.prepTime} mins
                    </span>
                    <Link
                      href={`/menu`}
                      className="rounded-full bg-saffron-500 py-1.5 px-4 text-xs font-bold text-cream-50 hover:bg-saffron-600 transition-colors"
                    >
                      Order Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </section>

      {/* Why Choose Us Section */}
      <section className="bg-cream-200/20 py-16 dark:bg-coffee-900/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col items-center gap-2 mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-saffron-500">Our Pillars</span>
            <h2 className="font-serif text-3xl font-extrabold text-temple-900 dark:text-cream-100">Why Foodies Love DosaHub</h2>
            <div className="h-1 w-12 bg-saffron-500 rounded mt-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Item 1 */}
            <div className="flex flex-col items-center text-center gap-4 bg-cream-50 p-6 rounded-2xl border border-cream-200 dark:bg-coffee-900 dark:border-coffee-800">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-saffron-500/10 text-saffron-500 shadow-sm">
                <Award className="h-7 w-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-temple-900 dark:text-cream-100">Authentic Recipes</h3>
              <p className="text-sm text-temple-900/60 dark:text-cream-300/60 leading-relaxed">
                Recipes handed down over generations, sourced with signature spices from Madras and Salem.
              </p>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col items-center text-center gap-4 bg-cream-50 p-6 rounded-2xl border border-cream-200 dark:bg-coffee-900 dark:border-coffee-800">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-saffron-500/10 text-saffron-500 shadow-sm">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-temple-900 dark:text-cream-100">20-Min Delivery Promise</h3>
              <p className="text-sm text-temple-900/60 dark:text-cream-300/60 leading-relaxed">
                Using insulated bags and routing technology to ensure your dosas remain crispy and hot!
              </p>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col items-center text-center gap-4 bg-cream-50 p-6 rounded-2xl border border-cream-200 dark:bg-coffee-900 dark:border-coffee-800">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-saffron-500/10 text-saffron-500 shadow-sm">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-temple-900 dark:text-cream-100">Hygiene Assured</h3>
              <p className="text-sm text-temple-900/60 dark:text-cream-300/60 leading-relaxed">
                100% pure vegetarian kitchen with triple-sanitization routines and environment friendly boxes.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        
        <div className="flex flex-col items-center gap-2 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-500">Happy Customers</span>
          <h2 className="font-serif text-3xl font-extrabold text-temple-900 dark:text-cream-100">Reviews & Feasts</h2>
          <div className="h-1 w-12 bg-saffron-500 rounded mt-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Testimonial 1 */}
          <div className="flex flex-col justify-between rounded-2xl bg-cream-50 p-6 shadow-sm border border-cream-200 dark:bg-coffee-900 dark:border-coffee-800 text-left">
            <p className="text-sm italic text-temple-900/70 dark:text-cream-200/70 leading-relaxed">
              "The Ghee Roast Dosa from DosaHub is exactly how we make it at home in Tamil Nadu! Crispy, rich in ghee, and the sambar is perfectly tangy. 10/10!"
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-saffron-100 font-bold flex items-center justify-center text-saffron-700">
                K
              </div>
              <div>
                <h4 className="text-sm font-semibold text-temple-900 dark:text-cream-100">Kartik Raman</h4>
                <span className="text-[10px] text-temple-900/40 dark:text-cream-300/40">Verified Gourmet • Indiranagar</span>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="flex flex-col justify-between rounded-2xl bg-cream-50 p-6 shadow-sm border border-cream-200 dark:bg-coffee-900 dark:border-coffee-800 text-left">
            <p className="text-sm italic text-temple-900/70 dark:text-cream-200/70 leading-relaxed">
              "I love their Elaneer Payasam! It is so hard to find authentic tender coconut payasam in the city, but DosaHub nails it every time. Delivery is super fast too."
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-saffron-100 font-bold flex items-center justify-center text-saffron-700">
                P
              </div>
              <div>
                <h4 className="text-sm font-semibold text-temple-900 dark:text-cream-100">Priyanka Rao</h4>
                <span className="text-[10px] text-temple-900/40 dark:text-cream-300/40">Loyal Customer • Koramangala</span>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="flex flex-col justify-between rounded-2xl bg-cream-50 p-6 shadow-sm border border-cream-200 dark:bg-coffee-900 dark:border-coffee-800 text-left">
            <p className="text-sm italic text-temple-900/70 dark:text-cream-200/70 leading-relaxed">
              "We order their Steamed Rava Idlis every single Sunday for breakfast. The food arrives piping hot. The customization feature for extra podi is excellent!"
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-saffron-100 font-bold flex items-center justify-center text-saffron-700">
                M
              </div>
              <div>
                <h4 className="text-sm font-semibold text-temple-900 dark:text-cream-100">Madan Kumar</h4>
                <span className="text-[10px] text-temple-900/40 dark:text-cream-300/40">Food Blogger • Whitefield</span>
              </div>
            </div>
          </div>

        </div>

      </section>



    </div>
  );
}
