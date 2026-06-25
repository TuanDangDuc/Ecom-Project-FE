// ============================================================
//  src/api/index.js
//  Tất cả API call của Job 1 (Cart | Order | Review)
//  Thay BASE_URL bằng địa chỉ backend thật khi có
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'


// Sửa lại hết apiAuth, user, shop, address 
async function request(method, path, body = null) {
  const userId = localStorage.getItem('userId')
  const userRole = localStorage.getItem('userRole')

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
  create: (payload) => request('POST', '/product', payload),
  update: (id, payload) => request('PUT', `/product/${id}`, payload),
  delete: (id) => request('DELETE', `/product/${id}`),
}
// ────────────────────────────────────────────────────────────
//  CART API  (bảng: carts, cartItem)
// ────────────────────────────────────────────────────────────

export const cartApi = {
  // Lấy giỏ hàng của user hiện tại
  // GET /cart  →  { id, userId, items: [...] }
  getCart() {
    return request('GET', '/cart');
  },

  // Thêm sản phẩm vào giỏ
  // POST /cart/items  body: { productVariantId, quantity }
  addItem(productVariantId, quantity) {
    return request('POST', '/cart/items', { productVariantId, quantity });
  },

  // Cập nhật số lượng một item
  // PUT /cart/items/:cartItemId  body: { quantity }
  updateItem(cartItemId, quantity) {
    return request('PUT', `/cart/items/${cartItemId}`, { quantity });
  },

  // Xoá một item khỏi giỏ
  // DELETE /cart/items/:cartItemId
  removeItem(cartItemId) {
    return request('DELETE', `/cart/items/${cartItemId}`);
  },

  // Xoá toàn bộ giỏ (dùng sau khi đặt hàng)
  // DELETE /cart
  clearCart() {
    return request('DELETE', '/cart');
  },
};

// ────────────────────────────────────────────────────────────
//  ORDER API  (bảng: orders, orderItem)
// ────────────────────────────────────────────────────────────

export const orderApi = {
  placeOrder(payload) {
    return request('POST', '/orders', payload);
  },

  // Lấy danh sách đơn hàng của user (buyer)
  // GET /orders  →  [{ id, orderCode, status, totalAmount, createdAt, items: [...] }]
  getMyOrders() {
    return request('GET', '/orders');
  },

  // Lấy chi tiết một đơn hàng
  // GET /orders/:orderId
  getOrderById(orderId) {
    return request('GET', `/orders/${orderId}`);
  },

  // Cập nhật trạng thái đơn hàng (ví dụ: Huỷ đơn)
  // PUT /orders/:orderId/status
  updateStatus(orderId, status) {
    return request('PUT', `/orders/${orderId}/status`, { status });
  },
};

// ────────────────────────────────────────────────────────────
//  REVIEW API  (bảng: reviews, reviewImages)
// ────────────────────────────────────────────────────────────

//Sửa lại toàn bộ reviewApi
export const reviewApi = {
  createReview: (payload) =>
    request('POST', '/reviews', payload),

  getByProduct: (productId) =>
    request('GET', `/products/${productId}/reviews`),

  uploadImages: (reviewId, payload) =>
    request('POST', `/reviews/${reviewId}/images`, payload),

  deleteImage: (imageId) =>
    request('DELETE', `/review-images/${imageId}`)
}

export const variantApi = {
  getByProductId: (productId) =>
    request('GET', `/products/${productId}/variants`),

  create: (productId, payload) =>
    request('POST', `/products/${productId}/variants`, payload),

  update: (id, payload) =>
    request('PUT', `/variants/${id}`, payload),

  delete: (id) =>
    request('DELETE', `/variants/${id}`)
}

export const categoryApi = {
  getAll: () => request('GET', '/categories'),
  create: (payload) =>
  request('POST', '/categories', payload),
  
}

export const productTypeApi = {
    getAll: () => request('GET', '/product-types'),
    create: (payload) =>
    request('POST', '/product-types', payload),
}

export const productImageApi = {
  addToVariant: (variantId, payload) =>
  request('POST', `/variants/${variantId}/images`, payload),
  delete: (id) =>
  request('DELETE', `/product-images/${id}`),
  
}

// ────────────────────────────────────────────────────────────
//  HELPER FUNCTIONS (CÁCH 1)
// ────────────────────────────────────────────────────────────

// Hàm format hiển thị các option của sản phẩm (ví dụ: Đỏ - Size L)
export const formatVariantOptions = (options) => {
  if (!options) return '';
  // Nếu BE trả về mảng, nối chúng lại bằng dấu '-'
  if (Array.isArray(options)) {
    return options.join(' - ');
  }
  // Nếu BE trả về chuỗi hoặc kiểu khác
  return String(options);
};

// Hàm dịch trạng thái đơn hàng sang tiếng Việt cho Orders.vue
export const mapOrderStatus = (status) => {
  if (!status) return 'Không xác định';
  
  const statusMap = {
    'PENDING': 'Chờ xác nhận',
    'CONFIRMED': 'Đã xác nhận',
    'SHIPPING': 'Đang giao hàng',
    'COMPLETED': 'Đã giao thành công',
    'CANCELED': 'Đã hủy', //bỏ 1 chữ l cho khớp be nha
  };

  return statusMap[status] || status;
};
