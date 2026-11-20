import fs from 'fs';
import path from 'path';
import { Product, Category, Order, Banner, StoreSetting, PageContent, DeliveryZone, ContactMessage } from './types';

// Local persistence file path
const DATA_FILE = path.join(process.cwd(), 'data', 'store_data.json');

interface InitialData {
  categories: Category[];
  products: Product[];
  banners: Banner[];
  deliveryZones: DeliveryZone[];
  orders: Order[];
  pages: PageContent[];
  settings: Record<string, any>;
  contactMessages: ContactMessage[];
}

const defaultDataset: InitialData = {
  categories: [
    {
      id: 'cat-tech-001',
      parent_id: null,
      name: 'Tech',
      slug: 'tech',
      description: 'Cutting-edge technology, gadgets, computing peripherals and electronics.',
      icon_name: 'Laptop',
      image_url: '/icons/categories/tech.svg',
      display_order: 1,
      is_active: true,
      is_featured: true,
    },
    {
      id: 'cat-food-002',
      parent_id: null,
      name: 'Food',
      slug: 'food',
      description: 'Artisanal provisions, organic pantry essentials, snacks and beverages.',
      icon_name: 'Utensils',
      image_url: '/icons/categories/food.svg',
      display_order: 2,
      is_active: true,
      is_featured: true,
    },
    {
      id: 'cat-clothing-003',
      parent_id: null,
      name: 'Clothing',
      slug: 'clothing',
      description: 'Contemporary apparel, minimalist fashion, and everyday essentials.',
      icon_name: 'Shirt',
      image_url: '/icons/categories/clothing.svg',
      display_order: 3,
      is_active: true,
      is_featured: true,
    },
    {
      id: 'cat-kids-004',
      parent_id: null,
      name: 'Kids',
      slug: 'kids',
      description: 'Creative toys, developmental gear, children apparel and baby products.',
      icon_name: 'Smile',
      image_url: '/icons/categories/kids.svg',
      display_order: 4,
      is_active: true,
      is_featured: true,
    },
    {
      id: 'cat-home-005',
      parent_id: null,
      name: 'Home',
      slug: 'home',
      description: 'Modern home decor, lighting, interior accents and living goods.',
      icon_name: 'Home',
      image_url: '/icons/categories/home.svg',
      display_order: 5,
      is_active: true,
      is_featured: true,
    },
    {
      id: 'cat-other-006',
      parent_id: null,
      name: 'Other',
      slug: 'other',
      description: 'Curated lifestyle accessories, special items, and miscellaneous collections.',
      icon_name: 'Package',
      image_url: '/icons/categories/other.svg',
      display_order: 6,
      is_active: true,
      is_featured: true,
    }
  ],
  products: [],
  banners: [
    {
      id: 'b-hero-01',
      title: 'Welcome to Dregital',
      subtitle: 'Discover curated collections across Tech, Food, Clothing, Kids, Home and more.',
      image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
      target_url: '/shop',
      button_text: 'EXPLORE',
      display_order: 1,
      is_active: true,
    }
  ],
  deliveryZones: [
    {
      id: 'dz-inside-dhaka',
      name: 'Inside Dhaka',
      charge: 70,
      estimated_days: '24-48 Hours',
      is_active: true,
    },
    {
      id: 'dz-outside-dhaka',
      name: 'Outside Dhaka',
      charge: 130,
      estimated_days: '2-4 Days',
      is_active: true,
    }
  ],
  orders: [],
  pages: [
    {
      id: 'page-about',
      title: 'About Dregital',
      slug: 'about-us',
      content: 'Dregital is an independent modern retail and e-commerce platform in Bangladesh offering genuine tech, food, clothing, kids, and home goods with nationwide delivery.'
    },
    {
      id: 'page-terms',
      title: 'Terms & Conditions',
      slug: 'terms-and-conditions',
      content: 'Welcome to Dregital. By using our website and placing orders, you agree to comply with our store terms and purchasing conditions.'
    },
    {
      id: 'page-privacy',
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      content: 'Your privacy is paramount. We safeguard all personal data, shipping details, and transaction information in accordance with international security best practices.'
    },
    {
      id: 'page-shipping',
      title: 'Shipping Policy',
      slug: 'shipping-policy',
      content: 'We deliver nationwide across all 64 districts in Bangladesh with reliable courier partners. Inside Dhaka: 24-48 Hours. Outside Dhaka: 2-4 Days.'
    },
    {
      id: 'page-refund',
      title: 'Refund & Return Policy',
      slug: 'refund-policy',
      content: 'We offer an easy 7-day replacement warranty for verified manufacturing defects. Please contact support with your order number.'
    }
  ],
  settings: {
    store_name: 'Dregital',
    store_tagline: 'Modern Shopping Destination',
    contact_phone: '+880 1711 000000',
    contact_email: 'support@dregital.com',
    free_shipping_threshold: 5000,
    currency_symbol: '৳',
    order_prefix: 'DRG'
  },
  contactMessages: []
};

function loadData(): InitialData {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        categories: Array.isArray(parsed.categories) ? parsed.categories : defaultDataset.categories,
        products: Array.isArray(parsed.products) ? parsed.products : [],
        banners: Array.isArray(parsed.banners) && parsed.banners.length > 0 ? parsed.banners : defaultDataset.banners,
        deliveryZones: Array.isArray(parsed.deliveryZones) ? parsed.deliveryZones : defaultDataset.deliveryZones,
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        pages: Array.isArray(parsed.pages) && parsed.pages.length > 0 ? parsed.pages : defaultDataset.pages,
        settings: { ...defaultDataset.settings, ...(parsed.settings || {}) },
        contactMessages: Array.isArray(parsed.contactMessages) ? parsed.contactMessages : [],
      };
    } catch (e) {
      console.error('Error reading local data file, falling back to clean dataset', e);
    }
  }
  return { ...defaultDataset, products: [] };
}

function saveData(data: InitialData) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save local store data:', e);
  }
}

export const db = {
  // PRODUCTS
  async getProducts(options: {
    categorySlug?: string;
    search?: string;
    featured?: boolean;
    bestseller?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
    limit?: number;
    offset?: number;
    includeInactive?: boolean;
  } = {}): Promise<{ products: Product[]; total: number }> {
    const store = loadData();
    let list = [...store.products];

    // Filter inactive products unless requested (e.g., in admin dashboard)
    if (!options.includeInactive) {
      list = list.filter(p => p.is_active !== false);
    }

    if (options.categorySlug) {
      const cat = store.categories.find(c => c.slug === options.categorySlug || c.id === options.categorySlug);
      if (cat) {
        const childCatIds = store.categories.filter(c => c.parent_id === cat.id).map(c => c.id);
        const matchIds = [cat.id, ...childCatIds];
        list = list.filter(p => matchIds.includes(p.category_id || ''));
      } else {
        list = [];
      }
    }

    if (options.featured) list = list.filter(p => p.is_featured);
    if (options.bestseller) list = list.filter(p => p.is_bestseller);
    if (options.minPrice !== undefined) list = list.filter(p => p.price >= options.minPrice!);
    if (options.maxPrice !== undefined) list = list.filter(p => p.price <= options.maxPrice!);

    if (options.search) {
      const q = options.search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    if (options.sortBy === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (options.sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (options.sortBy === 'popular') list.sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0));
    else list.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());

    // Populate category info
    const enrichedList = list.map(prod => ({
      ...prod,
      category: store.categories.find(c => c.id === prod.category_id) || null
    }));

    const total = enrichedList.length;
    const offset = options.offset || 0;
    const limit = options.limit || enrichedList.length;
    const paginated = enrichedList.slice(offset, offset + limit);

    return { products: paginated, total };
  },

  async getProductBySlug(slugOrId: string): Promise<Product | null> {
    const store = loadData();
    const found = store.products.find(p => p.slug === slugOrId || p.id === slugOrId);
    if (!found) return null;
    const category = store.categories.find(c => c.id === found.category_id) || null;
    return { ...found, category };
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const store = loadData();
    const id = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const baseSlug = (productData.name || 'product')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Check slug collision
    let finalSlug = productData.slug || baseSlug;
    if (store.products.some(p => p.slug === finalSlug)) {
      finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const newProd: Product = {
      id,
      name: productData.name?.trim() || 'Untitled Product',
      slug: finalSlug,
      sku: productData.sku?.trim() || `DRG-${Date.now().toString().slice(-6)}`,
      model_number: productData.model_number?.trim() || '',
      short_description: productData.short_description?.trim() || '',
      description: productData.description?.trim() || '',
      price: Number(productData.price) || 0,
      original_price: productData.original_price ? Number(productData.original_price) : null,
      cost_price: productData.cost_price ? Number(productData.cost_price) : null,
      stock_quantity: Number(productData.stock_quantity) >= 0 ? Number(productData.stock_quantity) : 0,
      low_stock_threshold: Number(productData.low_stock_threshold) || 5,
      category_id: productData.category_id || null,
      image_url: productData.image_url || '',
      images: Array.isArray(productData.images) && productData.images.length > 0 
        ? productData.images 
        : productData.image_url 
          ? [{ id: `img-${Date.now()}`, product_id: id, image_url: productData.image_url, display_order: 1, is_primary: true }]
          : [],
      specifications: productData.specifications || {},
      variants: Array.isArray(productData.variants) ? productData.variants : [],
      is_active: productData.is_active !== undefined ? Boolean(productData.is_active) : true,
      is_featured: Boolean(productData.is_featured),
      is_bestseller: Boolean(productData.is_bestseller),
      warranty_info: productData.warranty_info || '',
      rating_average: 5.0,
      rating_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    store.products.unshift(newProd);
    saveData(store);
    return newProd;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const store = loadData();
    const index = store.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const current = store.products[index];
    const updated: Product = {
      ...current,
      ...updates,
      name: updates.name !== undefined ? updates.name.trim() : current.name,
      price: updates.price !== undefined ? Number(updates.price) : current.price,
      original_price: updates.original_price !== undefined ? (updates.original_price ? Number(updates.original_price) : null) : current.original_price,
      stock_quantity: updates.stock_quantity !== undefined ? Number(updates.stock_quantity) : current.stock_quantity,
      low_stock_threshold: updates.low_stock_threshold !== undefined ? Number(updates.low_stock_threshold) : current.low_stock_threshold,
      is_active: updates.is_active !== undefined ? Boolean(updates.is_active) : current.is_active,
      is_featured: updates.is_featured !== undefined ? Boolean(updates.is_featured) : current.is_featured,
      is_bestseller: updates.is_bestseller !== undefined ? Boolean(updates.is_bestseller) : current.is_bestseller,
      specifications: updates.specifications !== undefined ? updates.specifications : current.specifications,
      variants: updates.variants !== undefined ? updates.variants : current.variants,
      images: updates.images !== undefined ? updates.images : current.images,
      image_url: updates.image_url !== undefined ? updates.image_url : current.image_url,
      updated_at: new Date().toISOString()
    };

    store.products[index] = updated;
    saveData(store);
    return updated;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const store = loadData();
    const initialLen = store.products.length;
    store.products = store.products.filter(p => p.id !== id);
    saveData(store);
    return store.products.length < initialLen;
  },

  // CATEGORIES
  async getCategories(includeInactive = false): Promise<Category[]> {
    const store = loadData();
    let list = [...store.categories];
    if (!includeInactive) {
      list = list.filter(c => c.is_active !== false);
    }
    return list.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  },

  async getCategoryTree(): Promise<Category[]> {
    const all = await this.getCategories(false);
    const topLevel = all.filter(c => !c.parent_id);
    return topLevel.map(parent => ({
      ...parent,
      children: all.filter(c => c.parent_id === parent.id)
    }));
  },

  async getCategoryBySlug(slugOrId: string): Promise<Category | null> {
    const all = await this.getCategories(true);
    return all.find(c => c.slug === slugOrId || c.id === slugOrId) || null;
  },

  async createCategory(cat: Partial<Category>): Promise<Category> {
    const store = loadData();
    const id = `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const baseSlug = (cat.name || 'category')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newCat: Category = {
      id,
      name: cat.name?.trim() || 'New Category',
      slug: cat.slug?.trim() || baseSlug,
      parent_id: cat.parent_id || null,
      description: cat.description?.trim() || '',
      image_url: cat.image_url || null,
      banner_url: cat.banner_url || null,
      icon_name: cat.icon_name || 'Tag',
      display_order: cat.display_order !== undefined ? Number(cat.display_order) : store.categories.length + 1,
      is_active: cat.is_active !== undefined ? Boolean(cat.is_active) : true,
      is_featured: Boolean(cat.is_featured),
      created_at: new Date().toISOString()
    };

    store.categories.push(newCat);
    saveData(store);
    return newCat;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const store = loadData();
    const index = store.categories.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updated: Category = {
      ...store.categories[index],
      ...updates,
      name: updates.name !== undefined ? updates.name.trim() : store.categories[index].name,
      slug: updates.slug !== undefined ? updates.slug.trim() : store.categories[index].slug,
      display_order: updates.display_order !== undefined ? Number(updates.display_order) : store.categories[index].display_order,
      is_active: updates.is_active !== undefined ? Boolean(updates.is_active) : store.categories[index].is_active,
    };

    store.categories[index] = updated;
    saveData(store);
    return updated;
  },

  async deleteCategory(id: string, reassignTo: string | null = null): Promise<boolean> {
    const store = loadData();
    const catToDelete = store.categories.find(c => c.id === id);
    if (!catToDelete) return false;

    // Reassign products if requested or nullify category_id
    store.products = store.products.map(p => {
      if (p.category_id === id) {
        return { ...p, category_id: reassignTo || null };
      }
      return p;
    });

    // Reassign child categories to root or to reassignTo
    store.categories = store.categories.map(c => {
      if (c.parent_id === id) {
        return { ...c, parent_id: reassignTo || null };
      }
      return c;
    });

    store.categories = store.categories.filter(c => c.id !== id);
    saveData(store);
    return true;
  },

  // BANNERS
  async getBanners(includeInactive: boolean = false): Promise<Banner[]> {
    const store = loadData();
    const list = store.banners || defaultDataset.banners;
    return includeInactive ? list : list.filter(b => b.is_active !== false);
  },

  async updateBanners(banners: Banner[]): Promise<Banner[]> {
    const store = loadData();
    store.banners = banners;
    saveData(store);
    return store.banners;
  },

  // DELIVERY ZONES
  async getDeliveryZones(): Promise<DeliveryZone[]> {
    const store = loadData();
    return store.deliveryZones || defaultDataset.deliveryZones;
  },

  // ORDERS
  async getOrders(options: { search?: string; status?: string } = {}): Promise<Order[]> {
    const store = loadData();
    let list = store.orders || [];
    if (options.status) {
      list = list.filter(o => o.order_status.toLowerCase() === options.status?.toLowerCase());
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      list = list.filter(o =>
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q)
      );
    }
    return list;
  },

  async getOrderById(id: string): Promise<Order | null> {
    const store = loadData();
    return store.orders.find(o => o.id === id || o.order_number === id) || null;
  },

  async getOrderByIdOrNumber(idOrNumber: string): Promise<Order | null> {
    const store = loadData();
    return store.orders.find(o => o.id === idOrNumber || o.order_number === idOrNumber) || null;
  },

  async trackOrder(orderNumber: string, phone: string): Promise<Order | null> {
    const store = loadData();
    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
    return store.orders.find(o => 
      o.order_number.toLowerCase() === orderNumber.toLowerCase().trim() &&
      o.customer_phone.replace(/\D/g, '').slice(-10) === cleanPhone
    ) || null;
  },

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const store = loadData();
    const id = `ord-${Date.now()}`;
    const count = store.orders.length + 1001;
    const orderNumber = `DRG-${new Date().getFullYear()}-${count}`;

    const newOrder: Order = {
      id,
      order_number: orderNumber,
      customer_id: orderData.customer_id || null,
      customer_name: orderData.customer_name || 'Guest Customer',
      customer_phone: orderData.customer_phone || '',
      customer_email: orderData.customer_email || null,
      shipping_address: orderData.shipping_address || '',
      shipping_city: orderData.shipping_city || 'Dhaka',
      shipping_district: orderData.shipping_district || 'Dhaka',
      order_status: 'Pending',
      payment_method: orderData.payment_method || 'Cash on Delivery',
      payment_status: 'Pending',
      subtotal: Number(orderData.subtotal) || 0,
      delivery_charge: Number(orderData.delivery_charge) || 0,
      discount_amount: Number(orderData.discount_amount) || 0,
      total_amount: Number(orderData.total_amount) || 0,
      customer_notes: orderData.customer_notes || null,
      admin_notes: null,
      items: orderData.items || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Decrement stock for ordered items
    if (Array.isArray(newOrder.items)) {
      for (const item of newOrder.items) {
        const prodIndex = store.products.findIndex(p => p.id === item.product_id);
        if (prodIndex !== -1) {
          const currentQty = store.products[prodIndex].stock_quantity;
          store.products[prodIndex].stock_quantity = Math.max(0, currentQty - (item.quantity || 1));
        }
      }
    }

    store.orders.unshift(newOrder);
    saveData(store);
    return newOrder;
  },

  async updateOrderStatus(id: string, order_status: any, payment_status_or_tracking?: any): Promise<Order | null> {
    const store = loadData();
    const index = store.orders.findIndex(o => o.id === id || o.order_number === id);
    if (index === -1) return null;

    store.orders[index].order_status = order_status;
    if (payment_status_or_tracking) {
      if (['Pending', 'Paid', 'Failed', 'Refunded'].includes(payment_status_or_tracking)) {
        store.orders[index].payment_status = payment_status_or_tracking;
      } else {
        (store.orders[index] as any).tracking_number = payment_status_or_tracking;
      }
    }
    store.orders[index].updated_at = new Date().toISOString();

    saveData(store);
    return store.orders[index];
  },

  // PAGES
  async getPage(slug: string): Promise<PageContent | null> {
    const store = loadData();
    const found = (store.pages || defaultDataset.pages).find(p => p.slug === slug);
    if (found) return found;
    return defaultDataset.pages.find(p => p.slug === slug) || null;
  },

  // CONTACT MESSAGES
  async getContactMessages(): Promise<ContactMessage[]> {
    const store = loadData();
    return store.contactMessages || [];
  },

  async saveContactMessage(msg: Partial<ContactMessage>): Promise<ContactMessage> {
    const store = loadData();
    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}`,
      name: msg.name || 'Anonymous',
      email: msg.email || '',
      phone: msg.phone || '',
      subject: msg.subject || 'Inquiry',
      message: msg.message || '',
      is_read: false,
      created_at: new Date().toISOString()
    };
    store.contactMessages.unshift(newMsg);
    saveData(store);
    return newMsg;
  },

  // SETTINGS
  async getSettings(): Promise<Record<string, any>> {
    const store = loadData();
    return store.settings || defaultDataset.settings;
  },

  async updateSettings(keyOrObj: any, value?: any): Promise<Record<string, any>> {
    const store = loadData();
    if (typeof keyOrObj === 'string') {
      store.settings[keyOrObj] = value;
    } else if (typeof keyOrObj === 'object') {
      store.settings = { ...store.settings, ...keyOrObj };
    }
    saveData(store);
    return store.settings;
  }
};
