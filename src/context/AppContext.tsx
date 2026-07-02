'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Re-export type definitions
export interface CartItem {
  uniqueId: string; // Composite key: itemId + extras + toppings + combo
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  selectedExtras: string[];
  selectedToppings: string[];
  selectedCombo?: string;
  customizationPrice: number;
}

export interface UserAddress {
  id: string;
  label: string;
  addressLine: string;
  city: string;
  postalCode: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  addresses: UserAddress[];
  wishlist: string[];
}

export interface CouponDetails {
  code: string;
  discountPercent: number;
  discountAmount: number;
  description: string;
}

interface AppContextType {
  // Auth State
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  toggleWishlist: (itemId: string) => Promise<void>;
  
  // Cart State
  cart: CartItem[];
  addToCart: (item: any, quantity: number, extras: string[], toppings: string[], combo?: string) => void;
  removeFromCart: (uniqueId: string) => void;
  updateCartQuantity: (uniqueId: string, qty: number) => void;
  clearCart: () => void;
  appliedCoupon: CouponDetails | null;
  applyCouponCode: (code: string) => Promise<string | null>; // Returns error message or null if success
  removeCoupon: () => void;
  cartTotals: {
    subtotal: number;
    tax: number;
    deliveryCharge: number;
    discount: number;
    total: number;
  };

  // UI / Theme State
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponDetails | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load state on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('dh_token');
    const savedUser = localStorage.getItem('dh_user');
    const savedCart = localStorage.getItem('dh_cart');
    const savedTheme = localStorage.getItem('dh_theme');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    setIsLoaded(true);
  }, []);

  // Sync state changes
  useEffect(() => {
    if (!isLoaded) return;
    if (token) localStorage.setItem('dh_token', token);
    else localStorage.removeItem('dh_token');

    if (user) localStorage.setItem('dh_user', JSON.stringify(user));
    else localStorage.removeItem('dh_user');
  }, [token, user, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('dh_cart', JSON.stringify(cart));
  }, [cart, isLoaded]);

  const login = (token: string, user: User) => {
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCart([]);
    setAppliedCoupon(null);
    localStorage.removeItem('dh_token');
    localStorage.removeItem('dh_user');
    localStorage.removeItem('dh_cart');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const toggleWishlist = async (itemId: string) => {
    if (!user || !token) {
      alert('Please login to save your favorite South Indian dishes!');
      window.location.href = `/login?redirect=/menu`;
      return;
    }
    
    // Optimistic UI update
    const wishlistArray = user.wishlist || [];
    const updatedWishlist = [...wishlistArray];
    const index = updatedWishlist.indexOf(itemId);
    if (index !== -1) {
      updatedWishlist.splice(index, 1);
    } else {
      updatedWishlist.push(itemId);
    }
    setUser({ ...user, wishlist: updatedWishlist });

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'toggleWishlist', itemId })
      });
      const data = await res.json();
      if (data.wishlist) {
        setUser(prev => prev ? { ...prev, wishlist: data.wishlist } : null);
      }
    } catch (error) {
      console.error('Error syncing wishlist with backend:', error);
    }
  };

  // Cart operations
  const addToCart = (
    item: any,
    quantity: number,
    extras: string[],
    toppings: string[],
    combo?: string
  ) => {
    // Calculate customization price
    let customizationPrice = 0;
    
    extras.forEach(extraName => {
      const opt = item.customizations.extras.find((e: any) => e.name === extraName);
      if (opt) customizationPrice += opt.price;
    });

    toppings.forEach(topName => {
      const opt = item.customizations.toppings.find((t: any) => t.name === topName);
      if (opt) customizationPrice += opt.price;
    });

    if (combo) {
      const opt = item.customizations.combos.find((c: any) => c.name === combo);
      if (opt) customizationPrice += opt.price;
    }

    const sortedExtras = [...extras].sort();
    const sortedToppings = [...toppings].sort();
    const uniqueId = `${item.id}-${sortedExtras.join(',')}-${sortedToppings.join(',')}-${combo || ''}`;

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(c => c.uniqueId === uniqueId);
      if (existingIndex !== -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            uniqueId,
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity,
            selectedExtras: sortedExtras,
            selectedToppings: sortedToppings,
            selectedCombo: combo,
            customizationPrice
          }
        ];
      }
    });
  };

  const removeFromCart = (uniqueId: string) => {
    setCart(prev => prev.filter(c => c.uniqueId !== uniqueId));
  };

  const updateCartQuantity = (uniqueId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(uniqueId);
      return;
    }
    setCart(prev =>
      prev.map(c => (c.uniqueId === uniqueId ? { ...c, quantity: qty } : c))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCouponCode = async (code: string): Promise<string | null> => {
    try {
      const subtotal = cart.reduce((acc, item) => acc + (item.price + item.customizationPrice) * item.quantity, 0);
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();
      if (!res.ok) {
        return data.error || 'Failed to apply coupon';
      }
      setAppliedCoupon({
        code: data.code,
        discountPercent: data.discountPercent,
        discountAmount: data.discountAmount,
        description: data.description
      });
      return null;
    } catch (err: any) {
      return err.message || 'An error occurred';
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const setDarkModeToggle = (dark: boolean) => {
    setDarkMode(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dh_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dh_theme', 'light');
    }
  };

  // Recalculate totals whenever cart or coupon updates
  const calculateTotals = () => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price + item.customizationPrice) * item.quantity, 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const deliveryCharge = subtotal > 400 || subtotal === 0 ? 0 : 30; // Free delivery over ₹400
    
    let discount = 0;
    if (appliedCoupon && subtotal >= appliedCoupon.discountAmount) {
      discount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    }

    const total = Math.max(0, subtotal + tax + deliveryCharge - discount);

    return { subtotal, tax, deliveryCharge, discount, total };
  };

  const cartTotals = calculateTotals();

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateUser,
        toggleWishlist,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        cartTotals,
        darkMode,
        setDarkMode: setDarkModeToggle
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
