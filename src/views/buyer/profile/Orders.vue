<template>
  <div class="orders-view">
    <div class="header-section">
      <h2 class="title">Đơn Hàng Của Tôi</h2>
      <div class="status-tabs">
        <button
          v-for="tab in statusTabs" :key="tab.value"
          class="tab-btn" :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span class="tab-badge" v-if="countByStatus(tab.value) > 0">{{ countByStatus(tab.value) }}</span>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loadingOrders" class="empty-state">
      <div class="empty-icon">⏳</div>
      <p class="empty-text">Đang tải đơn hàng...</p>
    </div>

    <div class="orders-list" v-else-if="displayedOrders.length > 0">
      <div class="order-card" v-for="order in displayedOrders" :key="order.id">
        <div class="order-header">
          <div class="header-left">
            <span class="order-code">{{ order.orderCode }}</span>
          </div>
          <!-- Status từ BE là tiếng Anh (PENDING, COMPLETED...) → map sang tiếng Việt -->
          <div class="header-right">
            <span class="order-status" :class="statusClass(firstItemStatus(order))">
              {{ mapOrderStatus(firstItemStatus(order)) }}
            </span>
            <!-- Buyer chỉ được huỷ khi PENDING -->
            <button
              v-if="firstItemStatus(order) === 'PENDING'"
              class="btn-cancel"
              @click="cancelOrder(order)"
            >
              Huỷ đơn
            </button>
          </div>
        </div>

        <div class="order-items">
          <div class="item-row" v-for="item in order.items" :key="item.id">
            <img :src="item.productThumbnail" :alt="item.productName">
            <div class="item-details">
              <div class="name">{{ item.productName }}</div>
              <div class="meta">
                Phân loại: {{ formatVariantOptions(item.variantOptions) }} · x{{ item.quantity }}
              </div>
            </div>
            <div class="item-price-action">
              <div class="item-price">₫{{ formatPrice(item.priceAtPurchase) }}</div>

              <!-- Chỉ hiện nút review khi item đã COMPLETED -->
              <template v-if="item.orderStatus === 'COMPLETED'">
                <button
                  v-if="!getReview(item.id)"
                  class="btn-review"
                  @click="openReviewModal(item, false)"
                >
                  Viết đánh giá
                </button>
                <div v-else class="review-summary">
                  <div class="review-stars">
                    <span v-for="s in 5" :key="s" :class="s <= getReview(item.id).rating ? 'star-on' : 'star-off'">&#9733;</span>
                  </div>
                  <p class="review-comment-preview">{{ getReview(item.id).comment }}</p>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="order-footer">
          <div class="date">
            {{ new Date(order.createdAt).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' }) }}
          </div>
          <div class="total-area">
            <span class="total-label">Thành tiền:</span>
            <span class="total-amount">₫{{ formatPrice(order.totalAmount) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <div class="empty-icon">📦</div>
      <p class="empty-text">Không có đơn hàng nào</p>
    </div>

    <!-- Review Modal -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="showReviewModal" @click.self="showReviewModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Đánh Giá Sản Phẩm</h3>
            <button class="modal-close" @click="showReviewModal = false">✕</button>
          </div>

          <div class="review-product-info" v-if="selectedItem">
            <img :src="selectedItem.productThumbnail" :alt="selectedItem.productName">
            <div>
              <div class="review-product-name">{{ selectedItem.productName }}</div>
              <div class="review-variant">{{ formatVariantOptions(selectedItem.variantOptions) }}</div>
            </div>
          </div>

          <div class="form-group">
            <label>Chất lượng sản phẩm</label>
            <div class="star-rating">
              <span
                v-for="star in 5" :key="star" class="star"
                :class="{ active: star <= reviewForm.rating, hover: star <= hoverRating }"
                @mouseenter="hoverRating = star"
                @mouseleave="hoverRating = 0"
                @click="reviewForm.rating = star"
              >★</span>
              <span class="rating-text">{{ ratingLabels[reviewForm.rating - 1] }}</span>
            </div>
          </div>

          <div class="form-group">
            <label>Nhận xét của bạn</label>
            <textarea
              v-model="reviewForm.comment"
              rows="4" class="form-control"
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            ></textarea>
          </div>

          <div class="modal-actions">
            <button class="btn btn-outline" @click="showReviewModal = false">Hủy</button>
            <button
              class="btn btn-primary"
              @click="submitReview"
              :disabled="!reviewForm.comment.trim() || isSubmitting"
            >
              {{ isSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useUserStore } from '../../../stores/user';
import { orderApi, reviewApi, mapOrderStatus, formatVariantOptions } from '../../../api/index.js';

const userStore = useUserStore();

// ── Tabs — dùng status BE (tiếng Anh) để filter ─────────────
const statusTabs = [
  { label: 'Tất Cả',        value: 'all' },
  { label: 'Chờ Xác Nhận',  value: 'PENDING' },
  { label: 'Đã Xác Nhận',   value: 'CONFIRMED' },
  { label: 'Đang Giao',     value: 'SHIPPING' },
  { label: 'Đã Giao',       value: 'COMPLETED' },
  { label: 'Đã Hủy',        value: 'CANCELED' },
];
const activeTab = ref('all');
const orders = ref([]);
const loadingOrders = ref(false);

// Mỗi order có items[], mỗi item có orderStatus (BE English)
// Lấy status của item đầu tiên để đại diện cho đơn hàng
const firstItemStatus = (order) => order.items?.[0]?.orderStatus ?? '';

onMounted(async () => {
  loadingOrders.value = true;
  try {
    const res = await orderApi.getMyOrders();
    if (res.success) orders.value = res.orders ?? [];
  } catch (e) {
    console.error('[Orders] getMyOrders:', e);
  } finally {
    loadingOrders.value = false;
  }
});

const displayedOrders = computed(() => {
  if (activeTab.value === 'all') return orders.value;
  return orders.value.filter(o => firstItemStatus(o) === activeTab.value);
});

const countByStatus = (status) => {
  if (status === 'all') return 0;
  return orders.value.filter(o => firstItemStatus(o) === status).length;
};

const statusClass = (beStatus) => ({
  'status-pending':  beStatus === 'PENDING',
  'status-confirmed': beStatus === 'CONFIRMED',
  'status-shipping': beStatus === 'SHIPPING',
  'status-done':     beStatus === 'COMPLETED',
  'status-cancel':   beStatus === 'CANCELED',
});

// ── Huỷ đơn ─────────────────────────────────────────────────
const cancelOrder = async (order) => {
  if (!confirm('Bạn có chắc muốn huỷ đơn hàng này?')) return;
  try {
    const res = await orderApi.updateStatus(
      order.id,
      'CANCELED'
    );
    if (res.success) {
      // Cập nhật status local
      order.items.forEach(i => { i.orderStatus = 'CANCELED'; });
    } else {
      alert(res.message);
    }
  } catch (e) {
    alert('Huỷ đơn thất bại: ' + e.message);
  }
};

// ── Review ───────────────────────────────────────────────────
// localReviews: Map orderItemId → review object (sau khi submit)
const localReviews = reactive({});

const getReview = (orderItemId) => localReviews[orderItemId] ?? null;

const showReviewModal = ref(false);
const selectedItem = ref(null);
const hoverRating = ref(0);
const reviewForm = ref({ rating: 5, comment: '' });
const isSubmitting = ref(false);
const ratingLabels = ['Tệ', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Xuất sắc'];

const openReviewModal = (item) => {
  selectedItem.value = item;
  hoverRating.value = 0;
  reviewForm.value = { rating: 5, comment: '' };
  showReviewModal.value = true;
};

const submitReview = async () => {
  if (!reviewForm.value.comment.trim() || !selectedItem.value) return;
  isSubmitting.value = true;
  try {
    // BE cần: orderItemId, rating (1-5), comment
    const res = await reviewApi.createReview({
      orderItemId: selectedItem.value.id,    // id của OrderItem
      rating: reviewForm.value.rating,        // BE dùng 'rating' không phải 'ratingValue'
      comment: reviewForm.value.comment,
    });

    if (res.success) {
      // Lưu local để hiển thị ngay không cần refetch
      localReviews[selectedItem.value.id] = {
        id: res.reviewId,
        rating: reviewForm.value.rating,
        comment: reviewForm.value.comment,
      };
      showReviewModal.value = false;
    } else {
      alert(res.message);
    }
  } catch (e) {
    alert('Gửi đánh giá thất bại: ' + e.message);
  } finally {
    isSubmitting.value = false;
  }
};

const formatPrice = (price) => {
  if (!price && price !== 0) return '0';
  return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
</script>

<style scoped>
.orders-view { }
.header-section { margin-bottom: 24px; }
.title { font-size: 22px; font-family: 'Outfit', sans-serif; color: var(--text-dark); margin-bottom: 20px; }
.status-tabs { display: flex; gap: 4px; border-bottom: 2px solid var(--border-color); flex-wrap: wrap; }
.tab-btn {
  padding: 10px 18px; background: none; border: none; cursor: pointer;
  font-size: 14px; font-weight: 500; color: var(--text-light);
  transition: var(--transition-fast); position: relative; bottom: -2px;
  border-bottom: 2px solid transparent; display: flex; align-items: center; gap: 6px; font-family: inherit;
}
.tab-btn:hover { color: var(--primary-color); }
.tab-btn.active { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; }
.tab-badge {
  background: var(--primary-color); color: white; font-size: 11px; font-weight: 700;
  min-width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center;
  justify-content: center; padding: 0 4px;
}
.orders-list { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
.order-card { border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; }
.order-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 20px; background: var(--bg-color); border-bottom: 1px solid var(--border-color);
}
.header-left, .header-right { display: flex; align-items: center; gap: 12px; }
.order-code { font-weight: 600; color: var(--text-dark); font-size: 14px; }
.order-status { font-weight: 600; font-size: 13px; padding: 4px 12px; border-radius: var(--radius-full); }
.status-pending   { background: rgba(245,158,11,0.1); color: #B45309; }
.status-confirmed { background: rgba(99,102,241,0.1); color: #4F46E5; }
.status-shipping  { background: rgba(14,165,233,0.1); color: #0284C7; }
.status-done      { background: rgba(16,185,129,0.1); color: #059669; }
.status-cancel    { background: rgba(239,68,68,0.1);  color: #DC2626; }
.btn-cancel {
  padding: 5px 12px; border: 1px solid #EF4444; background: transparent;
  color: #EF4444; border-radius: 99px; font-size: 13px; cursor: pointer;
  transition: var(--transition-fast);
}
.btn-cancel:hover { background: #FEF2F2; }
.order-items { padding: 0 20px; }
.item-row {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 0; border-bottom: 1px solid var(--border-color);
}
.item-row:last-child { border-bottom: none; }
.item-row img { width: 72px; height: 72px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color); flex-shrink: 0; }
.item-details { flex: 1; }
.item-details .name { font-size: 15px; font-weight: 500; color: var(--text-dark); margin-bottom: 6px; }
.item-details .meta { font-size: 13px; color: var(--text-light); }
.item-price-action { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.item-price { font-weight: 600; color: var(--primary-color); font-size: 16px; }
.btn-review {
  padding: 7px 14px; border: 1.5px solid var(--primary-color);
  background: transparent; color: var(--primary-color); border-radius: var(--radius-full);
  font-size: 13px; font-weight: 500; cursor: pointer; transition: var(--transition-fast); white-space: nowrap;
}
.btn-review:hover { background: var(--primary-color); color: white; }
.review-summary { text-align: right; }
.review-stars { color: #FBBF24; font-size: 16px; }
.star-on { color: #FBBF24; }
.star-off { color: #D1D5DB; }
.review-comment-preview { font-size: 12px; color: var(--text-light); margin: 4px 0 0; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.order-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 20px; background: var(--bg-color); border-top: 1px solid var(--border-color);
}
.date { font-size: 13px; color: var(--text-light); }
.total-area { display: flex; align-items: center; gap: 12px; }
.total-label { font-size: 14px; color: var(--text-color); }
.total-amount { font-size: 20px; font-weight: 700; color: var(--primary-color); }
.empty-state { text-align: center; padding: 60px 0; color: var(--text-light); margin-top: 20px; }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-text { font-size: 15px; }
/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 20px; backdrop-filter: blur(4px);
}
.modal-content {
  background: var(--white); padding: 32px; border-radius: var(--radius-lg);
  width: 100%; max-width: 500px; box-shadow: 0 25px 50px rgba(0,0,0,0.2);
  animation: slideUp 0.25s ease;
}
@keyframes slideUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h3 { font-size: 18px; color: var(--text-dark); }
.modal-close { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-light); }
.modal-close:hover { color: var(--text-dark); }
.review-product-info {
  display: flex; align-items: center; gap: 14px;
  background: var(--bg-color); padding: 14px; border-radius: var(--radius-md); margin-bottom: 24px;
}
.review-product-info img { width: 56px; height: 56px; object-fit: cover; border-radius: var(--radius-sm); flex-shrink: 0; }
.review-product-name { font-weight: 600; font-size: 14px; color: var(--text-dark); margin-bottom: 4px; }
.review-variant { font-size: 13px; color: var(--text-light); }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 10px; font-weight: 500; color: var(--text-dark); font-size: 14px; }
.star-rating { display: flex; align-items: center; gap: 6px; }
.star { font-size: 36px; color: #D1D5DB; cursor: pointer; transition: color 0.15s, transform 0.15s; line-height: 1; }
.star:hover, .star.hover { transform: scale(1.15); }
.star.active { color: #FBBF24; }
.star.hover { color: #FCD34D; }
.rating-text { font-size: 13px; color: var(--text-light); margin-left: 8px; font-style: italic; }
.form-control {
  width: 100%; padding: 12px 14px; border: 1.5px solid var(--border-color);
  border-radius: var(--radius-md); font-family: inherit; font-size: 14px;
  outline: none; resize: vertical; transition: var(--transition-fast); box-sizing: border-box; line-height: 1.6;
}
.form-control:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(14,165,233,0.12); }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.modal-actions .btn { min-width: 110px; }
</style>