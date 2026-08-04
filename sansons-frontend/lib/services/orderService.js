import api from '../api';
import { customers as mockCustomers, coupons as mockCoupons } from '../data/orders';

const wait = (data) => Promise.resolve(data);

export const getOrders = async () => {
  try {
    const response = await api.get('dashboard/admin/all-orders/');
    const list = Array.isArray(response.data) ? response.data : (response.data?.results || []);
    return list.map((item) => ({
      id: item.id.substring(0, 8).toUpperCase(),
      rawId: item.id,
      customer: item.customer || 'Valued Customer',
      email: item.email || 'customer@sansons.com',
      date: item.date || new Date().toISOString(),
      status: item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1)) : 'Pending',
      total: parseFloat(item.total) || 0,
      paymentMethod: item.paymentMethod || 'Cash on Delivery',
      items: Array.isArray(item.items) ? item.items.map(i => ({
        name: i.name,
        price: parseFloat(i.price) || 0,
        qty: i.qty || 1
      })) : []
    }));
  } catch (err) {
    console.warn("Failed to fetch live orders from backend admin endpoint.", err);
    return [];
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const response = await api.patch(`dashboard/admin/orders/${id}/`, { order_status: status });
    return response.data;
  } catch (err) {
    console.warn(`Failed to update order ${id} status on server.`, err);
    throw err;
  }
};

export const getOrderById = async (id) => {
  const allOrders = await getOrders();
  return allOrders.find((o) => o.id === id || o.rawId === id) || null;
};

export const getOrdersByEmail = async (email) => {
  const allOrders = await getOrders();
  return allOrders.filter((o) => o.email.toLowerCase() === email.toLowerCase());
};

export const getCustomers = async () => {
  try {
    const response = await api.get('dashboard/admin/users/');
    const list = Array.isArray(response.data) ? response.data : (response.data?.results || []);
    if (list.length > 0) {
      return list.map((s) => ({
        id: s.id,
        name: `${s.first_name} ${s.last_name}`.trim() || s.email,
        email: s.email,
        orders: 0,
        spent: 0,
        status: s.status === 'active' ? 'Active' : 'Inactive',
        joinDate: s.created_at,
      }));
    }
  } catch (err) {
    console.warn("Failed to fetch users list.", err);
  }
  return wait(mockCustomers);
};

export const getCoupons = async () => {
  try {
    const response = await api.get('dashboard/coupons/');
    const list = Array.isArray(response.data) ? response.data : (response.data?.results || []);
    if (list.length > 0) {
      return list.map((c) => ({
        id: c.id,
        code: c.code,
        type: "Percentage",
        value: c.discount_percent,
        minSpend: 0,
        usageLimit: 100,
        used: 0,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        active: c.is_active,
      }));
    }
  } catch (err) {
    console.warn("Failed to fetch coupons from backend.", err);
  }
  return wait(mockCoupons.map(c => ({
    ...c,
    type: "Percentage",
    value: parseInt(c.discount) || 20,
    usageLimit: 100,
    expires: c.expiry || new Date().toISOString()
  })));
};

export const createCoupon = async (form) => {
  const payload = {
    code: form.code.toUpperCase(),
    discount_percent: parseInt(form.value) || 10,
    is_active: true
  };
  const response = await api.post('dashboard/coupons/', payload);
  return {
    id: response.data.id,
    code: response.data.code,
    type: "Percentage",
    value: response.data.discount_percent,
    minSpend: 0,
    usageLimit: 100,
    used: 0,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    active: response.data.is_active,
  };
};

export const toggleCouponActive = async (id, currentStatus) => {
  const response = await api.patch(`dashboard/coupons/${id}/`, { is_active: !currentStatus });
  return response.data.is_active;
};

export const deleteCoupon = async (id) => {
  await api.delete(`dashboard/coupons/${id}/`);
};

export const validateCoupon = async (code) => {
  try {
    const response = await api.post('products/coupons/validate/', { code });
    if (response.data?.valid) {
      return {
        valid: true,
        coupon: {
          code: response.data.code,
          discount: `${response.data.discount_percent}% OFF`,
          active: true,
        }
      };
    }
  } catch (err) {
    console.warn("Coupon validation failed on backend.", err);
  }
  
  const found = mockCoupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
  if (!found) return { valid: false, message: "Coupon not found." };
  if (!found.active) return { valid: false, message: "This coupon has expired." };
  return { valid: true, coupon: found };
};

export const orderStats = async () => {
  try {
    const response = await api.get('dashboard/admin/financials/');
    const data = response.data;
    if (data) {
      return {
        totalRevenue: parseFloat(data.total_gmv || data.total_revenue) || 0,
        totalOrders: parseInt(data.total_orders) || 0,
        pending: parseInt(data.pending || data.pending_orders) || 0,
        avgOrderValue: parseFloat(data.avg_order_value || data.net_vendor_payouts) || 0,
      };
    }
  } catch (err) {
    console.warn("Failed to fetch live admin financials.", err);
  }
  return { totalRevenue: 0, totalOrders: 0, pending: 0, avgOrderValue: 0 };
};

export const getAdminUsers = async () => {
  const response = await api.get('dashboard/admin/users/');
  return Array.isArray(response.data) ? response.data : (response.data?.results || []);
};

export const createAdminUser = async (form) => {
  const response = await api.post('dashboard/admin/users/', form);
  return response.data;
};

export const updateAdminUser = async (id, form) => {
  const response = await api.patch(`dashboard/admin/users/${id}/`, form);
  return response.data;
};

export const deleteAdminUser = async (id) => {
  await api.delete(`dashboard/admin/users/${id}/`);
};
