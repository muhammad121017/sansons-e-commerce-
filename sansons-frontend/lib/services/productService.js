import api from '../api';
import { products as mockProducts } from '../data/products';

// Helper to safely convert Django DB product structure to the storefront representation
function mapProduct(p) {
  if (!p) return null;
  
  // Format image/s
  let imageUrls = [];
  if (Array.isArray(p.images) && p.images.length > 0) {
    imageUrls = p.images.map(img => typeof img === 'string' ? img : (img.original_file || img.thumbnail || ''));
  }
  if (imageUrls.length === 0) {
    imageUrls = ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&q=80']; // Fallback
  }

  // Format reviews
  const formattedReviews = Array.isArray(p.reviews) ? p.reviews.map(r => ({
    id: r.id,
    author: r.purchaser_name || r.purchaser_email || 'Anonymous',
    role: 'Verified Buyer',
    rating: r.rating || 5,
    content: r.comment || '',
    date: r.created_at || new Date().toISOString(),
    verified: true
  })) : [];

  return {
    id: p.id,
    slug: p.slug || `product-${p.id}`,
    name: p.title || p.name || 'Premium Item',
    brand: p.brand || p.attributes?.brand || 'Sansons',
    sku: p.sku || `SKU-${p.id.substring(0, 8).toUpperCase()}`,
    category: p.category?.slug || p.category?.name?.toLowerCase() || 'catalog',
    price: parseFloat(p.price) || 0,
    compareAtPrice: p.compare_at_price ? parseFloat(p.compare_at_price) : null,
    rating: parseFloat(p.rating) || 4.8,
    reviewCount: p.reviews_count || formattedReviews.length || 12,
    stock: p.stock_quantity ?? 10,
    isNew: p.is_new ?? false,
    isBestSeller: p.is_deal_of_the_week ?? false,
    codAvailable: p.cod_available ?? true,
    description: p.description || '',
    specifications: p.attributes || {},
    images: imageUrls,
    reviews: formattedReviews,
    variants: {
      colors: p.attributes?.colors || [],
      sizes: p.attributes?.sizes || []
    },
    deliveryEstimate: '3–5 business days',
    returnPolicy: '30-day free returns'
  };
}

export async function fetchProducts(filters = {}) {
  try {
    const params = {};
    if (filters.category && filters.category !== 'all') {
      params.category__slug = filters.category;
    }
    if (filters.query) {
      params.search = filters.query;
    }
    if (filters.sort) {
      if (filters.sort === 'price-asc') params.ordering = 'price';
      if (filters.sort === 'price-desc') params.ordering = '-price';
      if (filters.sort === 'newest') params.ordering = '-created_at';
    }

    const response = await api.get('products/catalog/', { params });
    const results = response.data.results || response.data;
    if (Array.isArray(results)) {
      let filtered = results.map(mapProduct);
      
      // Perform post-filtering if filters are specified that django doesn't support by default
      if (filters.brand) {
        filtered = filtered.filter(p => p.brand.toLowerCase() === filters.brand.toLowerCase());
      }
      if (filters.minPrice != null) {
        filtered = filtered.filter(p => p.price >= filters.minPrice);
      }
      if (filters.maxPrice != null) {
        filtered = filtered.filter(p => p.price <= filters.maxPrice);
      }
      if (filters.inStockOnly) {
        filtered = filtered.filter(p => p.stock > 0);
      }
      return filtered;
    }
    return [];
  } catch (err) {
    console.warn("Failed to fetch products from backend catalog API. Falling back to mock data.", err);
    let result = [...mockProducts];
    if (filters.category) result = result.filter((p) => p.category === filters.category);
    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    return result;
  }
}

export async function fetchAdminProducts() {
  // NOTE: No mock fallback — admin must always use live DB data.
  // If this throws, the calling page will show an error state.
  const response = await api.get('products/dashboard/products/');
  const results = response.data.results || response.data;
  if (Array.isArray(results)) {
    return results.map(mapProduct);
  }
  return [];
}

export async function createProduct(form) {
  const imagesList = Array.isArray(form.images) && form.images.length > 0
    ? form.images
    : (form.imageUrl ? [form.imageUrl] : []);

  const payload = {
    title: form.name,
    sku: form.sku || `SKU-${Date.now()}`,
    slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    description: form.description,
    price: parseFloat(form.price) || 0,
    compare_at_price: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
    stock_quantity: parseInt(form.stock) || 0,
    category: form.category,
    is_published: true,
    is_deal_of_the_week: form.isBestSeller || false,
    attributes: {
      brand: form.brand || 'Sansons',
      codAvailable: form.codAvailable ?? true
    },
    images: imagesList
  };
  const response = await api.post('products/dashboard/products/', payload);
  return mapProduct(response.data);
}

export async function updateProduct(id, form) {
  const imagesList = Array.isArray(form.images) && form.images.length > 0
    ? form.images
    : (form.imageUrl ? [form.imageUrl] : []);

  const payload = {
    title: form.name,
    sku: form.sku,
    slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    description: form.description,
    price: parseFloat(form.price) || 0,
    compare_at_price: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
    stock_quantity: parseInt(form.stock) || 0,
    category: form.category,
    is_published: true,
    is_deal_of_the_week: form.isBestSeller || false,
    attributes: {
      brand: form.brand || 'Sansons',
      codAvailable: form.codAvailable ?? true
    },
    images: imagesList
  };
  const response = await api.put(`products/dashboard/products/${id}/`, payload);
  return mapProduct(response.data);
}


export async function deleteProduct(id) {
  await api.delete(`products/dashboard/products/${id}/`);
}

export async function fetchProductBySlug(slug) {
  try {
    const response = await api.get(`products/catalog/${slug}/`);
    return mapProduct(response.data);
  } catch (err) {
    console.warn(`Failed to fetch product details for ${slug} from backend. Falling back to mock.`, err);
    return mockProducts.find((p) => p.slug === slug) || null;
  }
}

export async function fetchRelatedProducts(product, limit = 4) {
  try {
    const params = { category__slug: product.category };
    const response = await api.get('products/catalog/', { params });
    const results = response.data.results || response.data;
    if (Array.isArray(results)) {
      return results
        .filter(p => p.slug !== product.slug)
        .slice(0, limit)
        .map(mapProduct);
    }
    return [];
  } catch (err) {
    console.warn("Failed to fetch related products, returning mock.", err);
    return mockProducts.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, limit);
  }
}

export async function fetchBestSellers() {
  try {
    const response = await api.get('products/catalog/', { params: { is_deal_of_the_week: 'true' } });
    const results = response.data.results || response.data;
    if (Array.isArray(results) && results.length > 0) {
      return results.map(mapProduct);
    }
  } catch (err) {
    console.warn("Failed to fetch live best sellers, returning mock.", err);
  }
  return mockProducts.filter((p) => p.isBestSeller);
}

export async function fetchNewArrivals() {
  try {
    const response = await api.get('products/catalog/', { params: { ordering: '-created_at' } });
    const results = response.data.results || response.data;
    if (Array.isArray(results) && results.length > 0) {
      return results.map(mapProduct);
    }
  } catch (err) {
    console.warn("Failed to fetch live new arrivals, returning mock.", err);
  }
  return mockProducts.filter((p) => p.isNew);
}

export async function fetchProductsByCategory(categorySlug) {
  return await fetchProducts({ category: categorySlug });
}

export function getAllBrands() {
  try {
    return Array.from(new Set(mockProducts.map((p) => p.brand)));
  } catch (err) {
    return ['Sansons'];
  }
}

export function getPriceRange() {
  try {
    const prices = mockProducts.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  } catch (err) {
    return { min: 0, max: 2000 };
  }
}

export async function toggleProductPublish(id, is_published) {
  const response = await api.post(`dashboard/admin/products/${id}/toggle-publish/`, { is_published });
  return response.data;
}

