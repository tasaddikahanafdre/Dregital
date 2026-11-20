'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/lib/WishlistContext';
import { useCart } from '@/lib/CartContext';
import { formatPrice } from '@/lib/utils';

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400 mb-4">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-black uppercase tracking-tight mb-2">
          Your Wishlist is Empty
        </h1>
        <p className="text-xs text-neutral-500 mb-6">
          Save items you love by tapping the heart icon on any product.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="pb-6 border-b border-neutral-200 mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight">
          My Saved Wishlist ({wishlist.length})
        </h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {wishlist.map((product) => (
          <div key={product.id} className="bg-white border border-neutral-200 rounded-lg overflow-hidden flex flex-col justify-between">
            <div className="relative aspect-square bg-neutral-100">
              <Link href={`/product/${product.slug}`}>
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </Link>
              <button
                onClick={() => toggleWishlist(product)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-sm text-red-600 hover:bg-neutral-50"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <Link
                  href={`/product/${product.slug}`}
                  className="text-xs sm:text-sm font-semibold text-neutral-900 hover:text-black line-clamp-2 mb-2"
                >
                  {product.name}
                </Link>
                <p className="text-xs sm:text-sm font-bold text-black mb-3">
                  {formatPrice(product.price)}
                </p>
              </div>

              <button
                onClick={() => addToCart(product, 1)}
                className="w-full py-2 bg-black text-white rounded text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Bag</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
