import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { db } from '@/lib/db';
import ProductCard from '@/components/ProductCard';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 0;

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await db.getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // Get products in this category
  const [productsResult, allCategories] = await Promise.all([
    db.getProducts({ categorySlug: slug, limit: 30 }),
    db.getCategories(true)
  ]);

  const products = productsResult.products;
  const subcategories = allCategories.filter(c => c.parent_id === category.id);

  return (
    <div className="w-full bg-white text-black min-h-screen py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb */}
        <nav className="text-xs text-neutral-400 flex items-center gap-2">
          <Link href="/" className="hover:text-black uppercase tracking-wider">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/shop" className="hover:text-black uppercase tracking-wider">Category</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-black font-semibold uppercase tracking-wider">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="border-b border-black pb-8">
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black mb-3">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xs sm:text-sm text-neutral-500 font-light max-w-xl">
              {category.description}
            </p>
          )}
        </div>

        {/* Subcategories (if any) */}
        {subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {subcategories.map(sub => (
              <Link
                key={sub.id}
                href={`/category/${category.slug}/${sub.slug}`}
                className="bg-neutral-100 hover:bg-black hover:text-white px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}

        {/* Product Listings Grid */}
        <div>
          {products.length === 0 ? (
            <div className="text-center py-16 sm:py-24 border border-black rounded-xl p-8 bg-white">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-black mb-2">
                No products in {category.name} yet.
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 font-light mb-6">
                Something exciting is coming. Check back soon as our catalog is updated.
              </p>
              <Link
                href="/"
                className="inline-block bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded hover:bg-neutral-800 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
