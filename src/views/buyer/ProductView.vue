<template>
  <div class="product-view container mt-4" v-if="product">
    <div class="product-main">
      <!-- Image Gallery -->
      <div class="product-gallery">
        <div class="main-image">
          <img :src="selectedImage || product.thumbnailUrl" :alt="product.name">
        </div>
        <div class="thumbnails">
          <img v-for="(img, idx) in product.imagesUrl" :key="idx" :src="img" @click="selectedImage = img" :class="{active: selectedImage === img}">
        </div>
      </div>

      <!-- Info -->
      <div class="product-details">
        <h1 class="product-title">{{ product.name }}</h1>
        <div class="product-meta">
          <div class="rating">
            <span class="stars">★★★★★</span>
            <span class="rating-num">{{ product.ratingAverage }}</span>
          </div>
          <span class="divider"></span>
          <span class="sold">1k+ Đã bán</span>
        </div>
        <div class="product-price-box">
          <div class="price">₫{{ formatPrice(selectedVariant ? selectedVariant.price : product.basePrice) }}</div>
        </div>

        <div class="product-options">
          <div class="option-row">
            <span class="label">Phân loại</span>
            <div class="variants">
              <button 
                v-for="variant in variants" 
                :key="variant.id"
                class="variant-btn"
                :class="{ active: selectedVariant && selectedVariant.id === variant.id }"
                @click="selectedVariant = variant"
              >
                {{ variant.options }}
              </button>
            </div>
          </div>
          <div class="option-row">
            <span class="label">Số lượng</span>
            <div class="quantity-wrapper">
              <div class="quantity-selector">
                <button @click="quantity > 1 ? quantity-- : null">-</button>
                <input type="number" v-model.number="quantity" min="1" :max="selectedVariant?.stock || 1" />
                <button @click="quantity < (selectedVariant?.stock || 99) ? quantity++ : null">+</button>
              </div>
              <span class="stock-info" v-if="selectedVariant">{{ selectedVariant.stock }} sản phẩm có sẵn</span>
            </div>
          </div>
        </div>

        <div class="product-actions">
          <button class="btn btn-outline btn-lg" @click="addToCart">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            Thêm Vào Giỏ
          </button>
          <button class="btn btn-primary btn-lg" @click="buyNow">
            Mua Ngay
          </button>
        </div>
      </div>
    </div>

    <!-- Shop Info Full Width -->
    <div class="shop-info-card mt-4" v-if="shop">
      <div class="shop-info-left">
        <img :src="shop.avatarUrl" :alt="shop.name" class="shop-avatar-img">
        <div class="shop-meta">
          <div class="shop-name">{{ shop.name }}</div>
          <div class="shop-status">Online</div>
          <div class="shop-actions">
            <button class="btn btn-outline btn-sm">Chat Ngay</button>
            <router-link :to="`/shop/${shop.id}`" class="btn btn-outline btn-sm">Xem Shop</router-link>
          </div>
        </div>
      </div>
      <div class="shop-info-right">
        <div class="stat-item">
          <span class="stat-label">Đánh giá</span>
          <span class="stat-value">{{ shop.ratingAverage }} / 5.0</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Sản phẩm</span>
          <span class="stat-value">124</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Tỉ lệ phản hồi</span>
          <span class="stat-value">98%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Tham gia</span>
          <span class="stat-value">2 năm trước</span>
        </div>
      </div>
    </div>

    <!-- Description -->
    <div class="product-description mt-4">
      <h3 class="section-title">Chi Tiết Sản Phẩm</h3>
      <div class="desc-content">
        <p>{{ product.description }}</p>
      </div>
    </div>

    <!-- Reviews -->
    <div class="product-reviews mt-4">
      <h3 class="section-title">Đánh Giá Sản Phẩm ({{ productReviews.length }})</h3>
      <div class="reviews-list" v-if="productReviews.length > 0">
        <div class="review-item" v-for="review in productReviews" :key="review.id">
          <div class="review-avatar">
            <img :src="`https://picsum.photos/seed/${review.userId}/50/50`" alt="Avatar">
          </div>
          <div class="review-content">
            <div class="review-header">
              <span class="user-name">Người dùng #{{ review.userId }}</span>
              <span class="review-date">{{ new Date(review.createdAt).toLocaleDateString('vi-VN') }}</span>
            </div>
            <div class="rating">
              <span class="stars">{{ '★'.repeat(review.rating ?? 0) }}{{ '☆'.repeat(5 - (review.rating ?? 0)) }}</span>
            </div>
            <div class="comment">{{ review.comment }}</div>
            <div class="review-images" v-if="review.images && review.images.length > 0">
              <img v-for="(img, i) in review.images" :key="i" :src="img.imageUrl ?? img" alt="Review Image">
            </div>
            <div class="shop-reply" v-if="review.shopReply">
              <div class="reply-title">Phản hồi từ Người Bán</div>
              <div class="reply-content">{{ review.shopReply }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="empty-reviews" v-else>
        Chưa có đánh giá nào cho sản phẩm này.
      </div>
    </div>
  </div>
  <div v-else class="container mt-4">
    <h2>Không tìm thấy sản phẩm</h2>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { products, productVariants, shops } from '../../mock/data';
import { useCartStore } from '../../stores/cart';
import { reviewApi, formatVariantOptions } from '../../api/index.js';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

const productId = parseInt(route.params.id);
const product = computed(() => products.find(p => p.id === productId));
const variants = computed(() => productVariants.filter(v => v.productId === productId));
const productReviews = ref([]);
const shop = computed(() => shops.find(s => s.id === product.value?.shopId));

const selectedImage = ref(null);
const selectedVariant = ref(null);
const quantity = ref(1);

onMounted(async () => {
  if (product.value?.imagesUrl?.length > 0) {
    selectedImage.value = product.value.imagesUrl[0];
  }
  if (variants.value?.length > 0) {
    selectedVariant.value = variants.value[0];
  }
  // Fetch reviews từ BE: GET /api/products/:productId/reviews
  try {
    const res = await reviewApi.getByProduct(productId);
    if (res.success) productReviews.value = res.reviews ?? [];
  } catch (e) {
    console.error('[ProductView] getByProduct:', e);
    productReviews.value = [];
  }
});

const formatPrice = (price) => {
  if (!price) return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const addToCart = async () => {
  if (!selectedVariant.value) {
    alert("Vui lòng chọn phân loại hàng");
    return false;
  }
  const success = await cartStore.addItem(selectedVariant.value, product.value, quantity.value);
  if (success) {
    alert("Đã thêm vào giỏ hàng");
    return true;
  }
  return false;
};

const buyNow = async () => {
  const success = await addToCart();
  if (success) {
    router.push('/cart');
  }
};
</script>

<style scoped>
.mt-4 { margin-top: 2rem; }
.product-main {
  display: flex;
  background: var(--white);
  padding: 30px;
  border-radius: var(--radius-lg);
  gap: 40px;
  box-shadow: var(--shadow-sm);
}
.product-gallery {
  width: 45%;
}
.main-image img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: var(--radius-md);
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
}
.thumbnails {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}
.thumbnails img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  cursor: pointer;
  border-radius: var(--radius-sm);
  border: 2px solid transparent;
  transition: var(--transition);
}
.thumbnails img.active {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}
.product-details {
  flex: 1;
}
.product-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.3;
}
.product-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: var(--text-light);
  margin-bottom: 24px;
}
.rating {
  display: flex;
  align-items: center;
  gap: 6px;
}
.stars { color: #FBBF24; letter-spacing: 2px;}
.rating-num { color: var(--text-dark); font-weight: 600;}
.divider { width: 1px; height: 14px; background: var(--border-color); }
.product-price-box {
  background: rgba(37, 99, 235, 0.05);
  padding: 20px 24px;
  border-radius: var(--radius-md);
  margin-bottom: 30px;
}
.price {
  font-size: 32px;
  color: var(--primary-color);
  font-weight: 700;
}
.option-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
}
.option-row .label {
  width: 110px;
  color: var(--text-light);
  padding-top: 8px;
  font-weight: 500;
}
.variants {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  flex: 1;
}
.variant-btn {
  padding: 10px 20px;
  background: var(--white);
  border: 1px solid var(--border-color);
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 14px;
  transition: var(--transition);
}
.variant-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}
.variant-btn.active {
  color: var(--primary-color);
  border-color: var(--primary-color);
  background: rgba(37, 99, 235, 0.05);
  font-weight: 600;
}
.quantity-wrapper {
  display: flex;
  align-items: center;
  gap: 20px;
}
.quantity-selector {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.quantity-selector button {
  width: 36px;
  height: 36px;
  background: var(--bg-color);
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: var(--text-dark);
  transition: var(--transition);
}
.quantity-selector button:hover {
  background: var(--border-color);
}
.quantity-selector input {
  width: 60px;
  height: 36px;
  text-align: center;
  border: none;
  border-left: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  font-family: inherit;
  font-size: 15px;
  color: var(--text-dark);
  font-weight: 500;
}
.stock-info {
  color: var(--text-light);
  font-size: 14px;
}
.product-actions {
  display: flex;
  gap: 16px;
  margin-top: 40px;
}
.btn-lg {
  padding: 14px 32px;
  font-size: 16px;
}
.product-description {
  background: var(--white);
  padding: 30px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.section-title {
  font-size: 20px;
  margin-bottom: 20px;
  color: var(--text-dark);
}
.desc-content {
  color: var(--text-color);
  line-height: 1.8;
}

/* Reviews */
.product-reviews {
  background: var(--white);
  padding: 30px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: 40px;
}
.reviews-list {
  display: flex;
  flex-direction: column;
}
.review-item {
  display: flex;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-color);
}
.review-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.review-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}
.review-content {
  flex: 1;
}
.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}
.review-header .user-name {
  font-weight: 600;
  color: var(--text-dark);
}
.review-header .review-date {
  font-size: 13px;
  color: var(--text-light);
}
.review-content .rating .stars {
  color: #FBBF24;
  letter-spacing: 1px;
  font-size: 14px;
}
.comment {
  margin: 12px 0;
  color: var(--text-color);
  line-height: 1.6;
}
.review-images {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.review-images img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  cursor: pointer;
}
.shop-reply {
  background: var(--bg-color);
  padding: 16px;
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--primary-color);
  margin-top: 12px;
}
.reply-title {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 14px;
  margin-bottom: 4px;
}
.reply-content {
  color: var(--text-color);
  font-size: 14px;
  line-height: 1.5;
}
.empty-reviews {
  text-align: center;
  padding: 40px 0;
  color: var(--text-light);
}

/* Shop Info Full Card */
.shop-info-card {
  background: var(--white);
  padding: 30px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}
.shop-info-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 0 0 350px; /* Fixed width to prevent squeezing */
  border-right: 1px solid var(--border-color);
  padding-right: 40px;
}
.shop-avatar-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-color);
}
.shop-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.shop-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-dark);
}
.shop-status {
  font-size: 13px;
  color: var(--success);
}
.shop-actions {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}
.shop-actions .btn {
  white-space: nowrap;
  padding: 8px 16px;
}
.shop-info-right {
  display: flex;
  flex: 1;
  justify-content: space-around;
  padding-left: 20px;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.stat-label {
  color: var(--text-light);
  font-size: 14px;
}
.stat-value {
  color: var(--primary-color);
  font-weight: 600;
  font-size: 15px;
}
</style>