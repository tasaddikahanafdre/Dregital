import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import CategorySlider from '@/components/CategorySlider';
import HeroSlider from '@/components/HeroSlider';

export const metadata: Metadata = {
  title: 'Dregital',
};

export const revalidate = 0; // Dynamic data for instant admin updates

export default async function HomePage() {
  const [categories, productsResult, banners] = await Promise.all([
    db.getCategories(false),
    db.getProducts({ limit: 9 }),
    db.getBanners(false)
  ]);

  const products = productsResult.products;

  return (
    <div className="w-full bg-white text-black min-h-screen flex flex-col justify-between overflow-x-hidden">
      <div className="w-full max-w-5xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-8 sm:space-y-16">
        
        {/* 3. HERO BANNER SLIDER: 16:9 landscape aspect ratio (like a standard YouTube video).
            Pure original banner images only. Slides and changes seamlessly if multiple banners exist. */}
        <section className="w-full">
          <HeroSlider banners={banners} />
        </section>

        {/* 4. CATEGORY SECTION: Centered heading "CATEGORY", followed by smooth continuous horizontal category carousel */}
        <section className="w-full">
          <Link href="/category" className="block text-center hover:opacity-75 transition-opacity">
            <h2 className="text-xl sm:text-2xl font-black tracking-widest text-center text-black uppercase mb-6 sm:mb-12">
              CATEGORY
            </h2>
          </Link>

          <CategorySlider categories={categories} />
        </section>

        {/* 5. PRODUCT GRID: 3x3 Grid (3 columns × 3 rows = 9 products). */}
        <section className="w-full">
          {products.length === 0 ? (
            <div className="w-full border border-black rounded-xl p-8 sm:p-20 text-center bg-white shadow-xs">
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black text-white rounded-full mx-auto flex items-center justify-center mb-3 sm:mb-4">
                  <span className="text-base sm:text-lg font-black">*</span>
                </div>
                <h3 className="text-base sm:text-2xl font-bold tracking-tight text-black">
                  Something exciting is coming. Check back soon.
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 font-light leading-relaxed">
                  Our collections are currently being prepared. Once new products are published, they will appear here.
                </p>
                <div className="pt-3 sm:pt-4">
                  <Link
                    href="/shop"
                    className="inline-block bg-black text-white text-xs font-bold uppercase tracking-widest px-5 sm:px-6 py-2 sm:py-2.5 rounded hover:bg-neutral-800 transition-colors"
                  >
                    View Categories
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:gap-6 lg:gap-8">
              {products.slice(0, 9).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* 6. MORE BUTTON: Centered black rounded rectangular button with white "MORE" text underneath the product grid */}
        <section className="w-full flex justify-center pt-2 pb-6">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-widest px-12 sm:px-16 py-3.5 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs"
          >
            MORE
          </Link>
        </section>

      </div>
    </div>
  );
}
