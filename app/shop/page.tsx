'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronRight, X, Search } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Product, Category } from '@/lib/types';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');

  // Load categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
      });
  }, []);

  // Fetch products with filters
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy) params.set('sortBy', sortBy);

    fetch(`/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      })
      .catch(err => console.error('Fetch products error:', err))
      .finally(() => setLoading(false));
  }, [search, selectedCategory, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSortBy('newest');
    router.push('/shop');
  };

  return (
    <div className="w-full bg-white text-black min-h-screen py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb */}
        <nav className="text-xs text-neutral-400 flex items-center gap-2">
          <button onClick={() => router.push('/')} className="hover:text-black uppercase tracking-wider">
            Home
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-black font-semibold uppercase tracking-wider">All Products</span>
          {selectedCategory && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-black font-semibold uppercase tracking-wider">{selectedCategory}</span>
            </>
          )}
        </nav>

        {/* Title */}
        <div className="border-b border-black pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black">
              {selectedCategory ? selectedCategory : 'Catalog'}
            </h1>
            <p className="text-xs text-neutral-500 font-light mt-1">
              Curated essentials with fast nationwide delivery in Bangladesh
            </p>
          </div>

          {/* Quick Categories Bar */}
          <div 
            className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1.5 rounded uppercase tracking-wider font-semibold transition-colors ${
                !selectedCategory ? 'bg-black text-white' : 'bg-neutral-100 text-black hover:bg-neutral-200'
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.slug)}
                className={`px-3 py-1.5 rounded uppercase tracking-wider font-semibold transition-colors whitespace-nowrap ${
                  selectedCategory === c.slug ? 'bg-black text-white' : 'bg-neutral-100 text-black hover:bg-neutral-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid Area */}
        <div>
          {loading ? (
            <div className="py-20 text-center text-xs text-neutral-400">Loading catalog...</div>
          ) : products.length === 0 ? (
            <div className="w-full border border-black rounded-xl p-12 sm:p-20 text-center bg-white shadow-xs">
              <div className="max-w-md mx-auto space-y-3">
                <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-black">
                  Something exciting is coming. Check back soon.
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 font-light leading-relaxed">
                  Our catalog is being prepared. Check back shortly for new product additions.
                </p>
                {(search || selectedCategory) && (
                  <div className="pt-2">
                    <button
                      onClick={handleResetFilters}
                      className="bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded hover:bg-neutral-800 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto px-4 py-20 text-center text-xs">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
