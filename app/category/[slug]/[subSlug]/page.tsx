import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { db } from '@/lib/db';
import ProductCard from '@/components/ProductCard';

interface Props {
  params: Promise<{ slug: string; subSlug: string }>;
}

export const revalidate = 60;

export default async function SubcategoryPage({ params }: Props) {
  const { slug, subSlug } = await params;
  const [parentCat, subCat] = await Promise.all([
    db.getCategoryBySlug(slug),
    db.getCategoryBySlug(subSlug)
  ]);

  if (!parentCat || !subCat) {
    notFound();
  }

  const productsResult = await db.getProducts({ categorySlug: subSlug, limit: 30 });
  const products = productsResult.products;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Breadcrumb */}
      <nav className="text-xs text-neutral-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/category/${parentCat.slug}`} className="hover:text-black">{parentCat.name}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-black font-semibold">{subCat.name}</span>
      </nav>

      {/* Header */}
      <div className="border-b border-neutral-200 pb-6 mb-8">
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-neutral-900 uppercase mb-2">
          {subCat.name}
        </h1>
        {subCat.description && (
          <p className="text-xs sm:text-sm text-neutral-500 max-w-xl">{subCat.description}</p>
        )}
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-200 rounded-xl">
          <p className="text-sm font-bold text-neutral-800 mb-1">No products in this subcategory yet</p>
          <Link href={`/category/${parentCat.slug}`} className="text-xs font-semibold text-black underline">
            View all {parentCat.name}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
