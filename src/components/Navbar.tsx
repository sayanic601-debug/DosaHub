'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ShoppingCart, Sun, Moon, User as UserIcon, LogOut, Shield, Menu, X, Coffee } from 'lucide-react';

export default function Navbar() {
  const { user, logout, cart, darkMode, setDarkMode } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    router.push('/');
  };

  const navLinks = [
    { label: 'Menu', path: '/menu' },
    { label: 'Offers', path: '/offers' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cream-200/50 bg-cream-50/80 backdrop-blur-md dark:border-coffee-800/50 dark:bg-coffee-900/80 transition-colors duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-saffron-500 to-brass-500 text-cream-50 shadow-premium transition-transform duration-300 group-hover:scale-105">
            <svg viewBox="0 0 100 100" className="h-6 w-6 fill-none stroke-current" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="50" cy="50" r="40" strokeWidth="4" className="opacity-30" />
              <circle cx="36" cy="36" r="8" fill="currentColor" className="opacity-60" />
              <circle cx="64" cy="36" r="6" fill="currentColor" className="opacity-60" />
              <path d="M18 78 L82 26" stroke="currentColor" strokeWidth="11" />
              <path d="M22 81 L78 29" stroke="#FAF8F5" strokeWidth="2.5" className="opacity-80" />
            </svg>
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-temple-500 dark:text-cream-100">
            Dosa<span className="text-saffron-500">Hub</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`relative py-2 text-sm font-medium transition-colors duration-300 hover:text-saffron-500 ${
                  isActive 
                    ? 'text-saffron-500 font-semibold' 
                    : 'text-temple-900/70 dark:text-cream-300/70'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-saffron-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons (Cart, DarkMode, Profile) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full p-2 text-temple-900/70 hover:bg-cream-200/40 dark:text-cream-300/70 dark:hover:bg-coffee-800/40 transition-colors duration-300"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="h-5 w-5 text-brass-400" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative rounded-full p-2 text-temple-900/70 hover:bg-cream-200/40 dark:text-cream-300/70 dark:hover:bg-coffee-800/40 transition-colors duration-300"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-saffron-500 text-[10px] font-bold text-cream-50 animate-pulse">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* User Profile */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-cream-300 bg-cream-100 py-1.5 px-3 hover:bg-cream-200 dark:border-coffee-700 dark:bg-coffee-800 dark:hover:bg-coffee-700 transition-colors duration-300"
              >
                <UserIcon className="h-4 w-4 text-saffron-500" />
                <span className="text-sm font-medium text-temple-900 dark:text-cream-100">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-cream-200 bg-cream-50 p-2 shadow-premium dark:border-coffee-800 dark:bg-coffee-950">
                  <div className="border-b border-cream-100 px-4 py-2.5 dark:border-coffee-900">
                    <p className="text-xs text-temple-900/50 dark:text-cream-300/50">Vanakkam!</p>
                    <p className="truncate text-sm font-semibold text-temple-900 dark:text-cream-100">{user.name}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-temple-900/80 hover:bg-cream-100 dark:text-cream-200/80 dark:hover:bg-coffee-900"
                    >
                      <UserIcon className="h-4 w-4 text-saffron-500" />
                      My Profile
                    </Link>
                    
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-temple-900/80 hover:bg-cream-100 dark:text-cream-200/80 dark:hover:bg-coffee-900"
                      >
                        <Shield className="h-4 w-4 text-temple-500" />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-saffron-500 px-5 py-2 text-sm font-semibold text-cream-50 shadow-premium transition-all duration-300 hover:bg-saffron-600 hover:shadow-premium-lg"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile menu and search actions */}
        <div className="flex md:hidden items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full p-2 text-temple-900/70 dark:text-cream-300/70"
          >
            {darkMode ? <Sun className="h-5 w-5 text-brass-400" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Cart Icon */}
          <Link href="/cart" className="relative rounded-full p-2 text-temple-900/70 dark:text-cream-300/70">
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-saffron-500 text-[10px] font-bold text-cream-50">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-temple-900 dark:text-cream-100"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-cream-200/50 bg-cream-50 px-4 py-4 dark:border-coffee-800/50 dark:bg-coffee-950 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium ${
                  pathname === link.path ? 'text-saffron-500' : 'text-temple-900/80 dark:text-cream-200/80'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user && user.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-base font-medium text-temple-900/80 dark:text-cream-200/80"
              >
                <Shield className="h-5 w-5 text-temple-500" />
                Admin Dashboard
              </Link>
            )}

            {user ? (
              <div className="border-t border-cream-200 pt-4 dark:border-coffee-900">
                <div className="mb-4 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-saffron-500" />
                  <div>
                    <p className="text-xs text-temple-900/50 dark:text-cream-300/50">Vanakkam,</p>
                    <p className="text-sm font-semibold text-temple-900 dark:text-cream-100">{user.name}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-temple-900/80 dark:text-cream-200/80"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-left text-sm font-semibold text-red-600 dark:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 block w-full rounded-full bg-saffron-500 py-2.5 text-center font-semibold text-cream-50"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
