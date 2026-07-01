

const BASE_URL = import.meta.env.VITE_API_URL || 'https://ecom.api.anhchuno.id.vn/api'

async function request(method, path, body = null) {
  const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId')
  const userRole = sessionStorage.getItem('userRole') || localStorage.getItem('userRole')

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(userId ? { 'X-User-Id': userId } : {}),
      ...(userRole ? { 'X-User-Role': userRole } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`)
  }

  return data
}

async function requestMultipart(method, path, formData) {
  const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId')
  const userRole = sessionStorage.getItem('userRole') || localStorage.getItem('userRole')

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(userId ? { 'X-User-Id': userId } : {}),
      ...(userRole ? { 'X-User-Role': userRole } : {}),
    },
    body: formData,
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`)
  }

  return data
}

export const authApi = {
  login: (username, password) =>
    request('POST', '/auth/login', { username, password }),

  register: (payload) =>
    request('POST', '/auth/register', payload),

  forgotPassword: (email) =>
    request('POST', '/auth/forgot-password', { email }),

  verifyOtp: (payload) =>
    request('POST', '/auth/verify-otp', payload),

  resetPassword: (payload) =>
    request('POST', '/auth/reset-password', payload),
}

export const userApi = {
  getAll: (page = 1, limit = 10) =>
    request('GET', `/user/getAllUser?page=${page}&limit=${limit}`),

  getByUsername: (username) =>
    request('GET', `/user/getUserByUsername?username=${username}`),

  update: (payload) =>
    request('PUT', '/user', payload),

  deleteByUsername: (username) =>
    request('DELETE', `/user/delete?username=${username}`),

  updateStatus: (username, status) =>
    request('PATCH', '/user/status', { username, status }),

  updateRole: (username, role) =>
    request('PATCH', '/user/role', { username, role }),
}

export const shopApi = {
  getAll: (page = 1, limit = 10) => request('GET', `/shop?page=${page}&limit=${limit}`),
  create: (payload) => request('POST', '/shop', payload),
  update: (payload) => request('PUT', '/shop', payload),
  getByUserId: (userId) => request('GET', `/shop/user?userId=${userId}`),
  getById: (id) => request('GET', `/shop/detail?id=${id}`),
  delete: (id) => request('DELETE', `/shop?id=${id}`),
  updateStatus: (id, status) => request('PATCH', '/shop/status', { id, status }),
  updateRating: (id, ratingAverage) => request('PATCH', '/shop/rating', { id, ratingAverage }),
}

export const addressApi = {
  create: (payload) => request('POST', '/address', payload),
  update: (payload) => request('PUT', '/address', payload),
  getByUserId: (userId) => request('GET', `/address/user?userId=${userId}`),
  getById: (id) => request('GET', `/address/detail?id=${id}`),
  delete: (id) => request('DELETE', `/address?id=${id}`),
}

export const productApi = {
  getAll: () => request('GET', '/products'),
  getById: (id) => request('GET', `/product/${id}`),
  getByShopId: (shopId) => request('GET', `/shopProduct/${shopId}`),
  getByCategoryId: (categoryId) => request('GET', `/categoryProduct/${categoryId}`),
  create: (payload) => request('POST', '/product', payload),
  update: (id, payload) => request('PUT', `/product/${id}`, payload),
  delete: (id) => request('DELETE', `/product/${id}`),
}

export const cartApi = {

  getCart() {
    return request('GET', '/cart');
  },

  addItem(productVariantId, quantity) {
    return request('POST', '/cart/items', { productVariantId, quantity });
  },

  updateItem(cartItemId, quantity) {
    return request('PUT', `/cart/items/${cartItemId}`, { quantity });
  },

  removeItem(cartItemId) {
    return request('DELETE', `/cart/items/${cartItemId}`);
  },

  clearCart() {
    return request('DELETE', '/cart');
  },
};

export const orderApi = {
  placeOrder(payload) {
    return request('POST', '/orders', payload);
  },

  getMyOrders() {
    return request('GET', '/orders');
  },

  getOrderById(orderId) {
    return request('GET', `/orders/${orderId}`);
  },

  updateStatus(orderId, status) {
    return request('PUT', `/orders/${orderId}/status`, { status });
  },

  updateItemStatus(id, status) {
    return request('PUT', `/order-item/${id}/status`, { status });
  },
};

export const reviewApi = {
  createReview: (payload) =>
    request('POST', '/reviews', payload),

  getByProduct: (productId) =>
    request('GET', `/products/${productId}/reviews`),

  uploadImages: (reviewId, payload) =>
    request('POST', `/reviews/${reviewId}/images`, payload),

  deleteImage: (imageId) =>
    request('DELETE', `/review-images/${imageId}`),

  replyReview: (id, reply) =>
    request('PUT', `/reviews/${id}/reply`, { reply })
}

export const categoryApi = {
  getAll: () => request('GET', '/categories'),
  create: (payload) => request('POST', '/categories', payload),
  update: (id, payload) => request('PUT', `/categories/${id}`, payload),
  delete: (id) => request('DELETE', `/categories/${id}`),
}

export const productTypeApi = {
  getAll: () => request('GET', '/product-types'),
  create: (payload) => request('POST', '/product-types', payload),
  update: (id, payload) => request('PUT', `/product-types/${id}`, payload),
  delete: (id) => request('DELETE', `/product-types/${id}`),
}

export const variantApi = {
  getByProductId: (productId) =>
    request('GET', `/products/${productId}/variants`),
  create: (productId, payload) =>
    request('POST', `/products/${productId}/variants`, payload),
  update: (id, payload) => request('PUT', `/variants/${id}`, payload),
  delete: (id) => request('DELETE', `/variants/${id}`),
}

export const productImageApi = {
  addToVariant: (variantId, payload) =>
    payload instanceof FormData
      ? requestMultipart('POST', `/variants/${variantId}/images`, payload)
      : request('POST', `/variants/${variantId}/images`, payload),
  delete: (id) =>
    request('DELETE', `/product-images/${id}`),
}

export const formatVariantOptions = (options) => {
  if (!options) return '';

  if (Array.isArray(options)) {
    return options.join(' - ');
  }

  return String(options);
};

export const mapOrderStatus = (status) => {
  if (!status) return 'Không xác định';

  const statusMap = {
    'PENDING': 'Chờ xác nhận',
    'CONFIRMED': 'Đã xác nhận',
    'SHIPPING': 'Đang giao hàng',
    'COMPLETED': 'Đã giao thành công',
    'CANCELED': 'Đã hủy',
  };

  return statusMap[status] || status;
};
