// ============================================================
//  src/api/index.js
//  Tất cả API call của Job 1 (Cart | Order | Review)
//  Thay BASE_URL bằng địa chỉ backend thật khi có
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// ── Helper gọi fetch có tự gắn token ────────────────────────
async function request(method, path, body = null) {
  const token = localStorage.getItem('token'); // hoặc lấy từ store tuỳ backend
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(userId ? { 'X-User-Id': userId } : {}),
      ...(userRole ? { 'X-User-Role': userRole } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, options);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  // 204 No Content → không có body
  if (res.status === 204) return null;
  return res.json();
}
// ────────────────────────────────────────────────────────────
//  AUTH API (Đăng nhập / Đăng ký)
// ────────────────────────────────────────────────────────────
export const authApi = {
  // Gửi username & password lên Backend
  // POST /login (Bạn nhớ sửa đường dẫn '/login' cho đúng với BE PHP của bạn nhé)
  login(username, password) {
    // Không dùng hàm request() ở đây vì lúc này chưa có token
    return fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }).then(r => {
      if (!r.ok) throw new Error('Đăng nhập thất bại');
      return r.json();
    });
  }
};
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

export const reviewApi = {
  // Lấy review của một sản phẩm (hiển thị trong ProductView)
  // GET /reviews?productId=X  →  [{ id, userId, ratingValue, comment, images, shopReply, ... }]
  getByProduct(productId) {
    return request('GET', `/reviews?productId=${productId}`);
  },

  createReview(payload) {
    return request('POST', '/reviews', payload);
  },

  // Cập nhật review đã có
  // PUT /reviews/:reviewId
  // body: { ratingValue, comment }
  updateReview(reviewId, ratingValue, comment) {
    return request('PUT', `/reviews/${reviewId}`, { ratingValue, comment });
  },

  // Upload ảnh review (nếu cần)
  // POST /reviews/:reviewId/images  (multipart/form-data)
  uploadImages(reviewId, files) {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));

    const headers = {};
    if (userId) headers['X-User-Id'] = userId;
    if (userRole) headers['X-User-Role'] = userRole;

    return fetch(`${BASE_URL}/reviews/${reviewId}/images`, {
      method: 'POST',
      headers,
      body: formData,
    }).then(r => r.json());
  } // <-- Đã đóng đúng ngoặc của hàm uploadImages
}; // <-- Đã đóng đúng ngoặc của object reviewApi

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
    'PROCESSING': 'Đang xử lý',
    'SHIPPED': 'Đang giao hàng',
    'DELIVERED': 'Đã giao thành công',
    'CANCELLED': 'Đã hủy',
  };

  return statusMap[status] || status;
};