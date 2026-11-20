import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugify } from '@/lib/utils';

export interface ImportReport {
  totalFound: number;
  successfullyImported: number;
  duplicatesSkipped: number;
  missingImages: number;
  missingPrices: number;
  manualReviewRequired: number;
  errors: string[];
  importedProducts: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, categories: importCategories } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided for importation' }, { status: 400 });
    }

    const existingProductsResult = await db.getProducts({ limit: 500 });
    const existingProducts = existingProductsResult.products;
    const existingCategories = await db.getCategories(true);

    const report: ImportReport = {
      totalFound: items.length,
      successfullyImported: 0,
      duplicatesSkipped: 0,
      missingImages: 0,
      missingPrices: 0,
      manualReviewRequired: 0,
      errors: [],
      importedProducts: []
    };

    // Category mapping cache
    const categoryMap = new Map<string, string>();
    existingCategories.forEach(c => {
      categoryMap.set(c.slug, c.id);
      categoryMap.set(c.name.toLowerCase(), c.id);
    });

    // 1. Process imported categories if provided
    if (Array.isArray(importCategories)) {
      for (const cat of importCategories) {
        if (!cat.name) continue;
        const slug = cat.slug || slugify(cat.name);
        if (!categoryMap.has(slug)) {
          const created = await db.createCategory({
            name: cat.name,
            slug,
            description: cat.description || '',
            image_url: cat.image_url || null,
            is_active: true
          });
          categoryMap.set(slug, created.id);
          categoryMap.set(cat.name.toLowerCase(), created.id);
        }
      }
    }

    // 2. Process imported products
    for (const item of items) {
      try {
        const rawName = (item.name || item.title || '').trim();
        if (!rawName) {
          report.errors.push('Skipped item with missing name');
          report.manualReviewRequired++;
          continue;
        }

        const slug = slugify(item.slug || rawName);

        // Deduplication check
        const isDuplicate = existingProducts.some(
          p => p.slug === slug || (item.sku && p.sku === item.sku) || p.name.toLowerCase() === rawName.toLowerCase()
        );
        if (isDuplicate) {
          report.duplicatesSkipped++;
          continue;
        }

        const price = Number(item.price || item.selling_price || 0);
        if (!price || price <= 0) {
          report.missingPrices++;
          report.manualReviewRequired++;
          report.errors.push(`Product "${rawName}" has invalid or missing price`);
          continue;
        }

        const imageUrl = item.image_url || item.image || (Array.isArray(item.images) && item.images[0]) || '';
        if (!imageUrl) {
          report.missingImages++;
        }

        // Match category
        let categoryId: string | null = null;
        const catKey = (item.category || item.category_name || item.category_slug || '').toString().toLowerCase();
        if (catKey && categoryMap.has(catKey)) {
          categoryId = categoryMap.get(catKey)!;
        } else if (catKey) {
          // Create category automatically if not found
          const created = await db.createCategory({
            name: item.category || item.category_name,
            slug: slugify(catKey),
            is_active: true
          });
          categoryId = created.id;
          categoryMap.set(catKey, created.id);
        }

        const originalPrice = item.original_price || item.compare_at_price ? Number(item.original_price || item.compare_at_price) : null;

        await db.createProduct({
          name: rawName,
          slug,
          sku: item.sku || `DRG-${Date.now().toString().slice(-6)}`,
          price,
          original_price: originalPrice,
          description: item.description || '',
          short_description: item.short_description || '',
          category_id: categoryId,
          image_url: imageUrl || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
          stock_quantity: item.stock_quantity ? Number(item.stock_quantity) : 15,
          specifications: typeof item.specifications === 'object' ? item.specifications : {},
          is_active: true,
          is_featured: Boolean(item.is_featured)
        });

        report.successfullyImported++;
        report.importedProducts.push(rawName);
      } catch (err: any) {
        report.errors.push(`Error importing ${item.name || 'item'}: ${err.message}`);
        report.manualReviewRequired++;
      }
    }

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Importation failed' }, { status: 500 });
  }
}
