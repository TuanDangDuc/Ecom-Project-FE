<template>
  <div class="product-view container mt-4" v-if="product">
    <div class="product-main">
      <div class="product-gallery">
        <div class="main-image">
          <img :src="selectedImage || product.thumbnailUrl || product.imageUrl" :alt="product.name">
        </div>

        <div class="thumbnails">
          <img
            v-if="product.thumbnailUrl"
            :src="product.thumbnailUrl"
            @click="selectedImage = product.thumbnailUrl"
            :class="{ active: selectedImage === product.thumbnailUrl }"
          >
          <img
            v-if="product.imageUrl"
            :src="product.imageUrl"
            @click="selectedImage = product.imageUrl"
            :class="{ active: selectedImage === product.imageUrl }"
          >
        </div>
      </div>

      <div class="product-details">
        <h1 class="product-title">{{ product.name }}</h1>

        <div class="product-meta">
          <div class="rating">
            <span class="stars">★★★★★</span>
            <span class="rating-num">{{ product.ratingAverage || 0 }}</span>
          </div>
          <span class="divider"></span>
          <span class="sold">Đã bán</span>
        </div>

        <div class="product-price-box">
          <div class="price">
            ₫{{ formatPrice(selectedVariant ? selectedVariant.price : product.basePrice || product.price) }}
          </div>
        </div>

        <div class="product-options" v-if="variants.length > 0">
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
                {{ variant.options || variant.name || `Phân loại #${variant.id}` }}
              </button>
            </div>
          </div>
        </div>

        <div class="option-row">
          <span class="label">Số lượng</span>
          <div class="quantity-wrapper">
            <div class="quantity-selector">
              <button @click="quantity > 1 ? quantity-- : null">-</button>
              <input
                type="number"
                v-model.number="quantity"
                min="1"
                :max="selectedVariant?.stock || 99"
              />
              <button @click="quantity < (selectedVariant?.stock || 99) ? quantity++ : null">+</button>
            </div>
          </div>
        </div>

        <div class="product-actions">
          <button class="btn btn-outline btn-lg" @click="addToCart">
            Thêm Vào Giỏ
          </button>
          <button class="btn btn-primary btn-lg" @click="buyNow">
            Mua Ngay
          </button>
        </div>
      </div>
    </div>

    <div class="shop-info-card mt-4" v-if="shop">
      <div class="shop-info-left">
        <img :src="shop.avatarUrl || 'https://picsum.photos/seed/shop/100/100'" :alt="shop.name" class="shop-avatar-img">
        <div class="shop-meta">
          <div class="shop-name">{{ shop.name }}</div>
          <div class="shop-status">{{ shop.shopStatus || shop.status || 'ACTIVE' }}</div>
          <div class="shop-actions">
            <button class="btn btn-outline btn-sm">Chat Ngay</button>
            <router-link :to="`/shop/${shop.id}`" class="btn btn-outline btn-sm">
              Xem Shop
            </router-link>
          </div>
        </div>
      </div>

      <div class="shop-info-right">
        <div class="stat-item">
          <span class="stat-label">Đánh giá</span>
          <span class="stat-value">{{ shop.ratingAverage || 0 }} / 5.0</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Shop ID</span>
          <span class="stat-value">#{{ shop.id }}</span>
        </div>
      </div>
    </div>

    <div class="product-description mt-4">
      <h3 class="section-title">Chi Tiết Sản Phẩm</h3>
      <div class="desc-content">
        <p>{{ product.description || 'Chưa có mô tả sản phẩm.' }}</p>
      </div>
    </div>

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
              <span class="review-date">
                {{ review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : '' }}
              </span>
            </div>

            <div class="rating">
              <span class="stars">
                {{ '★'.repeat(review.rating ?? 0) }}{{ '☆'.repeat(5 - (review.rating ?? 0)) }}
              </span>
            </div>

            <div class="comment">{{ review.comment }}</div>

            <div class="review-images" v-if="review.images && review.images.length > 0">
              <img
                v-for="(img, i) in review.images"
                :key="i"
                :src="img.imageUrl ?? img"
                alt="Review Image"
              >
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
    <h2>{{ loading ? 'Đang tải sản phẩm...' : 'Không tìm thấy sản phẩm' }}</h2>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productApi, shopApi, reviewApi, variantApi } from '../../api/index.js'
import { useCartStore } from '../../stores/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const productId = Number(route.params.id)

const product = ref(null)
const variants = ref([])
const shop = ref(null)
const productReviews = ref([])
const selectedImage = ref(null)
const selectedVariant = ref(null)
const quantity = ref(1)
const loading = ref(false)

const normalizeProduct = (p) => ({
  id: p.id,
  name: p.name || 'Sản phẩm',
  description: p.description || '',
  price: p.price || 0,
  basePrice: p.basePrice || p.price || 0,
  thumbnailUrl: p.thumbnailUrl || p.imageUrl || 'https://picsum.photos/seed/product/500/500',
  imageUrl: p.imageUrl || '',
  ratingAverage: p.ratingAverage || 0,
  shopId: p.shopId,
  categoryId: p.categoryId,
  productTypeId: p.productTypeId
})

const loadProduct = async () => {
  const res = await productApi.getById(productId)
  const data = res.data || res.product || res

  product.value = normalizeProduct(data)
  selectedImage.value = product.value.thumbnailUrl || product.value.imageUrl

  if (product.value.shopId) {
    await loadShop(product.value.shopId)
  }
}

const loadShop = async (shopId) => {
  try {
    const res = await shopApi.getById(shopId)
    shop.value = res.data || res.shop || res
  } catch (err) {
    console.error('[ProductView] loadShop:', err)
    shop.value = null
  }
}

const loadReviews = async () => {
  try {
    const res = await reviewApi.getByProduct(productId)
    productReviews.value = res.reviews || res.data || []
  } catch (err) {
    console.error('[ProductView] loadReviews:', err)
    productReviews.value = []
  }
}

const loadVariants = async () => {
  try {
    const res = await variantApi.getByProductId(productId)

    const list = res.data || res.variants || []

    variants.value = Array.isArray(list) ? list : []
    selectedVariant.value = variants.value.length > 0 ? variants.value[0] : null
  } catch (err) {
    console.error('[ProductView] loadVariants:', err)
    variants.value = []
    selectedVariant.value = null
  }
}

onMounted(async () => {
  try {
    loading.value = true
    await loadProduct()
    await loadVariants()
    await loadReviews()
  } catch (err) {
    console.error('[ProductView] load:', err)
    product.value = null
  } finally {
    loading.value = false
  }
})

const formatPrice = (price) => {
  return Math.round(Number(price) || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const addToCart = async () => {
  if (!product.value) return false

  try {
    const item = selectedVariant.value || {
      id: product.value.id,
      productId: product.value.id,
      price: product.value.basePrice || product.value.price,
      stock: 99
    }

    const success = await cartStore.addItem(item, product.value, quantity.value)

    if (success) {
      alert('Đã thêm vào giỏ hàng')
      return true
    }

    return false
  } catch (err) {
    alert(err.message || 'Thêm vào giỏ hàng thất bại')
    return false
  }
}

const buyNow = async () => {
  const success = await addToCart()
  if (success) {
    router.push('/cart')
  }
}
</script>

<style scoped>
/* ==========================================================================
   MINIMALIST HIGH-END DESIGN
   A sleek, boutique-style layout that is elegant, bold, and highly creative.
   ========================================================================== */

.product-view {
  padding: 40px 0 80px;
  color: #111827;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #fff;
}

/* Base Utility */
.section-wrapper {
  margin-top: 60px;
}

/* =========================================
   Product Main Section
   ========================================= */
.product-main {
  display: flex;
  flex-direction: column;
  gap: 50px;
}

@media (min-width: 1024px) {
  .product-main {
    flex-direction: row;
    gap: 80px;
    align-items: flex-start;
  }
}

/* Gallery - Clean, borderless focus */
.product-gallery {
  flex: 1;
  max-width: 580px;
  position: sticky;
  top: 40px;
}

.main-image {
  width: 100%;
  aspect-ratio: 1;
  background-color: #f9fafb;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  transition: background-color 0.3s ease;
}

.main-image img {
  width: 90%;
  height: 90%;
  object-fit: contain;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  mix-blend-mode: darken;
}

.main-image:hover img {
  transform: scale(1.05);
}

.thumbnails {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.thumbnails::-webkit-scrollbar {
  display: none;
}

.thumbnails img {
  width: 76px;
  height: 76px;
  object-fit: cover;
  border-radius: 12px;
  cursor: pointer;
  background-color: #f9fafb;
  border: 1.5px solid transparent;
  transition: all 0.2s ease-out;
  opacity: 0.7;
}

.thumbnails img:hover {
  opacity: 1;
}

.thumbnails img.active {
  opacity: 1;
  border-color: #111827;
  transform: translateY(-2px);
}

/* Details - Bold, Magazine-like Typography */
.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-title {
  font-size: 40px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.03em;
  color: #111827;
  margin: 0 0 16px 0;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  margin-bottom: 32px;
  font-weight: 500;
  color: #4b5563;
}

.rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stars {
  color: #111827;
  font-size: 15px;
  letter-spacing: 2px;
}

.rating-num {
  color: #111827;
}

.divider {
  width: 1px;
  height: 14px;
  background: #e5e7eb;
}

.sold {
  color: #6b7280;
}

/* Price - Sleek and Minimal */
.product-price-box {
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 1px solid #f3f4f6;
}

.price {
  font-size: 48px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.04em;
  display: flex;
  align-items: flex-start;
}

.price::before {
  content: 'Giá';
  font-size: 14px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-right: 12px;
  margin-top: 14px;
}

/* Options */
.product-options {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-bottom: 40px;
}

.option-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.label {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.variants {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* Chic Pill Buttons */
.variant-btn {
  padding: 12px 24px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 100px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  transition: all 0.2s ease;
}

.variant-btn:hover {
  border-color: #9ca3af;
}

.variant-btn.active {
  border-color: #111827;
  background: #111827;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* Quantity Selector - Refined */
.quantity-wrapper {
  display: flex;
  align-items: center;
}

.quantity-selector {
  display: inline-flex;
  border: 1px solid #e5e7eb;
  border-radius: 100px;
  padding: 4px;
  background: #fff;
}

.quantity-selector button {
  width: 36px;
  height: 36px;
  background: #f9fafb;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #111827;
  border-radius: 50%;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-selector button:hover {
  background: #e5e7eb;
}

.quantity-selector input {
  width: 48px;
  height: 36px;
  border: none;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  background: transparent;
  outline: none;
  -moz-appearance: textfield;
  appearance: textfield;
}

.quantity-selector input::-webkit-outer-spin-button,
.quantity-selector input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Actions - Bold contrast */
.product-actions {
  display: flex;
  gap: 16px;
  margin-top: auto;
}

.btn-lg {
  padding: 0 32px;
  height: 60px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 100px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex: 1;
}

.btn-outline {
  background: #fff;
  border: 2px solid #111827;
  color: #111827;
}

.btn-outline:hover {
  background: #f9fafb;
  transform: translateY(-2px);
}

.btn-primary {
  background: #111827;
  border: 2px solid #111827;
  color: #fff;
}

.btn-primary:hover {
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

/* =========================================
   Shop Info Card - Minimal Integration
   ========================================= */
.shop-info-card {
  display: flex;
  flex-direction: column;
  padding: 40px 0;
  margin-top: 60px;
  border-top: 1px solid #f3f4f6;
  border-bottom: 1px solid #f3f4f6;
}

@media (min-width: 768px) {
  .shop-info-card {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.shop-info-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.shop-avatar-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e5e7eb;
}

.shop-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.shop-name {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.01em;
}

.shop-status {
  font-size: 13px;
  color: #10b981;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}
.shop-status::before {
  content: '';
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
}

.shop-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.btn-sm {
  padding: 0 16px;
  height: 36px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 100px;
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #111827;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-sm:hover {
  border-color: #111827;
}

.shop-info-right {
  display: flex;
  gap: 48px;
  margin-top: 32px;
}

@media (min-width: 768px) {
  .shop-info-right {
    margin-top: 0;
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
}

/* =========================================
   Description & Reviews
   ========================================= */
.product-description, .product-reviews {
  margin-top: 60px;
  max-width: 800px;
}

.section-title {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.02em;
  margin-bottom: 24px;
}

.desc-content {
  color: #374151;
  line-height: 1.8;
  font-size: 16px;
  white-space: pre-wrap;
}

/* Reviews List - Magazine Style */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 40px;
  margin-top: 40px;
}

.review-item {
  display: flex;
  gap: 24px;
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
  gap: 16px;
  margin-bottom: 8px;
}

.user-name {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.review-date {
  font-size: 13px;
  color: #9ca3af;
}

.rating {
  margin-bottom: 12px;
  color: #111827;
}

.comment {
  font-size: 15px;
  color: #374151;
  line-height: 1.6;
}

.review-images {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.review-images img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid #f3f4f6;
  transition: opacity 0.2s;
}
.review-images img:hover {
  opacity: 0.8;
}

.shop-reply {
  background: #f9fafb;
  padding: 20px;
  border-radius: 12px;
  margin-top: 20px;
}

.reply-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #111827;
  margin-bottom: 8px;
}

.reply-content {
  font-size: 15px;
  color: #4b5563;
  line-height: 1.6;
}

.empty-reviews {
  padding: 60px 0;
  color: #9ca3af;
  font-size: 16px;
  font-style: italic;
}
</style>