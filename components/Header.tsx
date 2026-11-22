'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/lib/CartContext';

export default function Header() {
  const router = useRouter();
  const { cartCount, setIsCartOpen } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasCustomLogo, setHasCustomLogo] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [navCategories, setNavCategories] = useState<Array<{ name: string; href: string }>>([
    { name: 'Tech', href: '/category/tech' },
    { name: 'Food', href: '/category/food' },
    { name: 'Clothing', href: '/category/clothing' },
    { name: 'Kids', href: '/category/kids' },
    { name: 'Home', href: '/category/home' },
    { name: 'Other', href: '/category/other' },
  ]);

  useEffect(() => {
    // Check if custom logo exists in /public/logo/logo.png
    fetch('/api/logo', { method: 'HEAD', cache: 'no-store' })
      .then(res => {
        if (res.ok) {
          setHasCustomLogo(true);
        }
      })
      .catch(() => {
        setHasCustomLogo(false);
      });

    // Dynamically load configured featured categories for the header navigation bar
    fetch('/api/header-categories')
      .then(r => r.json())
      .then(data => {
        if (data && Array.isArray(data.header_categories) && data.header_categories.length > 0) {
          setNavCategories(data.header_categories.map((c: any) => ({ name: c.name, href: `/category/${c.slug}` })));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="w-full bg-white sticky top-0 z-40">
      {/* 1. Header Area: White background, Large Centered Logo, Right Icons */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
        
        {/* Left balance spacer */}
        <div className="w-20 sm:w-28 flex items-center justify-start" />

        {/* Centered Large Logo (Displays logo.png if present, otherwise fallback text "DREGITAL") */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center flex items-center justify-center">
          <Link href="/" className="inline-flex items-center justify-center">
            {hasCustomLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/api/logo"
                alt="Store Logo"
                className="h-8 sm:h-12 md:h-14 w-auto max-w-[180px] sm:max-w-[260px] md:max-w-[320px] object-contain select-none"
                onError={() => setHasCustomLogo(false)}
              />
            ) : (
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-black uppercase select-none">
                DREGITAL
              </h1>
            )}
          </Link>
        </div>

        {/* Right side: Shopping Bag and Search icons */}
        <div className="w-20 sm:w-28 flex items-center justify-end gap-3 sm:gap-4">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-1.5 text-black hover:opacity-70 transition-opacity focus:outline-hidden"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.6]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-1.5 text-black hover:opacity-70 transition-opacity focus:outline-hidden"
            aria-label="Search"
          >
            <Search className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.6]" />
          </button>
        </div>
      </div>

      {/* Expandable Search Overlay if active */}
      {isSearchOpen && (
        <div className="w-full bg-neutral-100 border-t border-b border-neutral-200 py-3 px-4">
          <div className="max-w-xl mx-auto flex items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white px-4 py-2 border border-neutral-300 rounded text-sm text-black placeholder:text-neutral-400 focus:outline-hidden focus:border-black"
              />
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 text-xs font-bold uppercase rounded hover:bg-neutral-800"
              >
                Search
              </button>
            </form>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-1 text-neutral-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Navigation Bar: Full-width black horizontal bar directly below the header */}
      <nav className="w-full bg-black text-white py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-center overflow-x-auto no-scrollbar whitespace-nowrap text-xs sm:text-sm font-normal tracking-wide">
          {navCategories.map((cat, index) => (
            <React.Fragment key={cat.name}>
              <Link
                href={cat.href}
                className="px-2.5 sm:px-4 py-0.5 hover:text-neutral-300 transition-colors"
              >
                {cat.name}
              </Link>
              {index < navCategories.length - 1 && (
                <span className="text-white/70 select-none">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </nav>
    </header>
  );
}
