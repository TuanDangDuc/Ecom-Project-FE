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