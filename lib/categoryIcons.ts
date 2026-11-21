// lib/categoryIcons.ts
import { Category } from './types';

/**
 * Semantic keyword rules to match any category name or slug to a professional category icon
 */
const ICON_RULES: Array<{ keywords: string[]; iconUrl: string; iconName: string }> = [
  // 1. Watches & Timepieces
  {
    keywords: ['watch', 'watches', 'smartwatch', 'timepiece', 'timepieces', 'clock', 'wrist'],
    iconUrl: '/icons/categories/watches.svg',
    iconName: 'Watch'
  },
  // 2. Shirts & Tops
  {
    keywords: ['shirt', 'shirts', 't-shirt', 'tshirt', 't-shirts', 'tshirts', 'polo', 'polos', 'tops', 'button-up'],
    iconUrl: '/icons/categories/shirts.svg',
    iconName: 'Shirt'
  },
  // 3. Men's Fashion & Tailored Apparel
  {
    keywords: ['men\'s fashion', 'mens fashion', 'mens-fashion', 'menswear', 'suit', 'suits', 'blazer', 'tuxedo', 'men fashion'],
    iconUrl: '/icons/categories/mens-fashion.svg',
    iconName: 'Shirt'
  },
  // 4. Accessories
  {
    keywords: ['accessories', 'accessory', 'sunglasses', 'glasses', 'wallet', 'wallets', 'belt', 'belts', 'cufflinks', 'chains', 'bracelet', 'bracelets'],
    iconUrl: '/icons/categories/accessories.svg',
    iconName: 'Glasses'
  },
  // 5. Lifestyle & Modern Living
  {
    keywords: ['lifestyle', 'life style', 'decor', 'lighting', 'lamp', 'interior'],
    iconUrl: '/icons/categories/lifestyle.svg',
    iconName: 'Home'
  },
  // 6. Home & Kitchen
  {
    keywords: ['home', 'kitchen', 'furniture', 'dining', 'bedroom', 'appliance', 'appliances', 'living'],
    iconUrl: '/icons/categories/home.svg',
    iconName: 'Home'
  },
  // 7. Technology, Electronics & Computing
  {
    keywords: ['tech', 'technology', 'electronics', 'gadget', 'gadgets', 'computer', 'laptop', 'pc', 'audio', 'phone', 'mobile', 'charger', 'cables', 'camera', 'hardware'],
    iconUrl: '/icons/categories/tech.svg',
    iconName: 'Laptop'
  },
  // 8. Beauty, Cosmetics & Skincare
  {
    keywords: ['beauty', 'cosmetics', 'cosmetic', 'skincare', 'skin care', 'makeup', 'perfume', 'fragrance', 'personal care', 'haircare'],
    iconUrl: '/icons/categories/beauty.svg',
    iconName: 'Sparkles'
  },
  // 9. Footwear & Shoes
  {
    keywords: ['shoe', 'shoes', 'footwear', 'sneaker', 'sneakers', 'boot', 'boots', 'sandals'],
    iconUrl: '/icons/categories/shoes.svg',
    iconName: 'Footprints'
  },
  // 10. Bags & Luggage
  {
    keywords: ['bag', 'bags', 'backpack', 'backpacks', 'luggage', 'purse', 'handbag', 'briefcase'],
    iconUrl: '/icons/categories/bags.svg',
    iconName: 'ShoppingBag'
  },
  // 11. Sports & Fitness
  {
    keywords: ['sport', 'sports', 'fitness', 'gym', 'workout', 'exercise', 'athletic'],
    iconUrl: '/icons/categories/sports.svg',
    iconName: 'Activity'
  },
  // 12. Gaming
  {
    keywords: ['game', 'gaming', 'console', 'playstation', 'xbox', 'nintendo', 'esports'],
    iconUrl: '/icons/categories/gaming.svg',
    iconName: 'Gamepad2'
  },
  // 13. Fine Jewelry
  {
    keywords: ['jewelry', 'jewellery', 'ring', 'rings', 'diamond', 'gold', 'necklace', 'earrings'],
    iconUrl: '/icons/categories/jewelry.svg',
    iconName: 'Gem'
  },
  // 14. Food & Groceries
  {
    keywords: ['food', 'beverage', 'drinks', 'grocery', 'groceries', 'snacks', 'snack', 'coffee', 'tea', 'sweets'],
    iconUrl: '/icons/categories/food.svg',
    iconName: 'Utensils'
  },
  // 15. Kids & Toys
  {
    keywords: ['kid', 'kids', 'baby', 'toddler', 'children', 'toy', 'toys', 'infant'],
    iconUrl: '/icons/categories/kids.svg',
    iconName: 'Smile'
  },
  // 16. General Clothing & Apparel
  {
    keywords: ['clothing', 'clothes', 'apparel', 'wear', 'dress', 'fashion', 'pants', 'trousers', 'denim', 'jeans'],
    iconUrl: '/icons/categories/clothing.svg',
    iconName: 'Shirt'
  }
];

export const FALLBACK_CATEGORY_ICON = '/icons/categories/other.svg';

/**
 * Matches a category name or slug to its suitable SVG icon
 */
export function matchCategoryIcon(categoryNameOrSlug: string = ''): { iconUrl: string; iconName: string } {
  if (!categoryNameOrSlug || typeof categoryNameOrSlug !== 'string') {
    return { iconUrl: FALLBACK_CATEGORY_ICON, iconName: 'Package' };
  }

  const clean = categoryNameOrSlug.toLowerCase().trim();

  // 1. Check exact or word boundary matches first
  for (const rule of ICON_RULES) {
    for (const kw of rule.keywords) {
      // Direct substring or regex word match
      const regex = new RegExp(`\\b${kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'i');
      if (clean.includes(kw) || regex.test(clean)) {
        return { iconUrl: rule.iconUrl, iconName: rule.iconName };
      }
    }
  }

  return { iconUrl: FALLBACK_CATEGORY_ICON, iconName: 'Package' };
}

/**
 * Returns the final icon URL for a category, preserving explicit custom SVG icons
 * while auto-assigning matching professional SVGs for categories with photos or missing icons.
 */
export function getCategoryIconUrl(category?: Partial<Category> | null): string {
  if (!category) return FALLBACK_CATEGORY_ICON;

  // If already an official SVG icon, preserve it exactly
  if (category.image_url && typeof category.image_url === 'string' && category.image_url.startsWith('/icons/categories/')) {
    return category.image_url;
  }

  // Automatic semantic matching based on category name and slug
  const matched = matchCategoryIcon(`${category.name || ''} ${category.slug || ''}`);
  return matched.iconUrl;
}
