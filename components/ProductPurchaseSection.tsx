'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Zap, Heart, Minus, Plus, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { Product, ProductVariant } from '@/lib/types';
import { useCart } from '@/lib/CartContext';
import { useWishlist } from '@/lib/WishlistContext';
import { formatPrice, calculateDiscount } from '@/lib/utils';

export default function ProductPurchaseSection({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    (product.variants && product.variants.length > 0) ? product.variants[0] : null
  );

  const basePrice = product.price;
  const currentPrice = basePrice + (selectedVariant?.price_adjustment || 0);
  const discount = calculateDiscount(currentPrice, product.original_price);
  const inWishlist = isInWishlist(product.id);
  const stockAvailable = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
  const isOutOfStock = stockAvailable <= 0;

  const handleAddToCart = () => {
    addToCart(
      {
        ...product,
        price: currentPrice
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    addToCart(
      {
        ...product,
        price: currentPrice
      },
      quantity
    );
    router.push('/checkout');
  };

  return (
    <div className="space-y-6">
      {/* Price Block */}
      <div className="border-b border-neutral-100 pb-5">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-black text-black">
            {formatPrice(currentPrice)}
          </span>
          {product.original_price && product.original_price > currentPrice && (
            <>
              <span className="text-base text-neutral-400 line-through">
                {formatPrice(product.original_price)}
              </span>
              <span className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded">
                Save {discount}%
              </span>
            </>
          )}
        </div>
        <p className="text-[11px] text-neutral-500 mt-1">Inclusive of all taxes in Bangladesh</p>
      </div>

      {/* Variations Selector (if product has variants) */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-black block">
            Select Variation: {selectedVariant?.variant_name} ({selectedVariant?.variant_value})
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                    isSelected
                      ? 'border-black bg-black text-white'
                      : 'border-neutral-300 text-neutral-800 hover:border-black'
                  }`}
                >
                  <span>{v.variant_value}</span>
                  {v.price_adjustment !== 0 && (
                    <span className="ml-1 opacity-75 text-[10px]">
                      ({v.price_adjustment > 0 ? `+৳${v.price_adjustment}` : `-৳${Math.abs(v.price_adjustment)}`})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock Availability */}
      <div className="flex items-center gap-2 text-xs">
        {isOutOfStock ? (
          <span className="inline-flex items-center gap-1.5 text-red-600 font-bold">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            Currently Out of Stock
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            In Stock ({stockAvailable} units available)
          </span>
        )}
      </div>

      {/* Quantity & Actions */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-neutral-300 rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={isOutOfStock || quantity <= 1}
              className="p-3 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 text-sm font-bold text-neutral-900 min-w-10 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(stockAvailable, quantity + 1))}
              disabled={isOutOfStock || quantity >= stockAvailable}
              className="p-3 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => toggleWishlist(product)}
            className={`p-3 rounded-lg border transition-colors flex items-center justify-center ${
              inWishlist 
                ? 'border-red-200 bg-red-50 text-red-600' 
                : 'border-neutral-300 text-neutral-600 hover:border-black hover:text-black'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full py-3.5 px-4 bg-white border-2 border-black text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Bag</span>
          </button>

          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="w-full py-3.5 px-4 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>Buy Now (Express)</span>
          </button>
        </div>
      </div>

      {/* Bangladesh Delivery & Guarantee Box */}
      <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50 space-y-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Truck className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-neutral-900">Nationwide Bangladesh Delivery</p>
            <p className="text-neutral-500 text-[11px]">Inside Dhaka: ৳70 (24-48h) | Outside Dhaka: ৳130 (2-4 days)</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-neutral-900">Warranty Protection</p>
            <p className="text-neutral-500 text-[11px]">{product.warranty_info || '1 Year Official Warranty'}</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <RefreshCw className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-neutral-900">7-Day Return Policy</p>
            <p className="text-neutral-500 text-[11px]">Replacement guaranteed for unboxed manufacturing defects</p>
          </div>
        </div>
      </div>
    </div>
  );
}
