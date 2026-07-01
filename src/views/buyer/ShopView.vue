<template>
  <div class="shop-view container mt-4">
    <div class="shop-header" v-if="shop">
      <div class="shop-info-wrapper">
        <div class="shop-avatar">
          <img :src="shop.avatarUrl" :alt="shop.name" v-if="shop.avatarUrl">
          <span v-else>{{ shop.name.charAt(0) }}</span>
        </div>
        <div class="shop-details">
          <h1 class="shop-name">{{ shop.name }}</h1>
          <div class="shop-stats">
            <span><strong>{{ shopProducts.length }}</strong> Sản phẩm</span>
            <span><strong>{{ shop.ratingAverage ?? 0 }}</strong> Đánh giá</span>
            <span><strong>{{ shop.shopStatus || shop.status || 'ACTIVE' }}</strong></span>
          </div>
          <button class="btn btn-outline btn-sm mt-2">+ Theo Dõi</button>
        </div>
      </div>
    </div>
    
    <div class="shop-content mt-4" v-if="shop">
      <div class="tabs">
        <button class="tab active">Tất Cả Sản Phẩm</button>
        <button class="tab">Sản Phẩm Mới</button>
        <button class="tab">Bán Chạy</button>
      </div>
      
      <div class="product-grid mt-4">
        <router-link :to="`/product/${product.id}`" class="product-card" v-for="product in shopProducts" :key="product.id">
          <div class="product-image">
            <img :src="product.thumbnailUrl" :alt="product.name">
          </div>
          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <div class="product-price-row">
              <div class="product-price">
                  ₫{{ formatPrice(product.price ?? product.basePrice) }}
              </div>
            </div>
            <div class="product-rating">
              <span class="stars">★★★★★</span>
              <span class="sold">{{ product.id * 15 + 12 }} đã bán</span>
            </div>
          </div>
        </router-link>
      </div>
    </div>
    
    <div v-else class="empty-state mt-4">
      <p>Không tìm thấy cửa hàng.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { shopApi, productApi } from '../../api'

const route = useRoute()

const shop = ref(null)
const shopProducts = ref([])
const loading = ref(false)

const shopId = Number(route.params.id)

const loadShop = async () => {
  try {
    const res = await shopApi.getById(shopId)
    shop.value = res.data || res.shop || res
  } catch (err) {
    console.error('[ShopView] loadShop:', err)
    shop.value = null
  }
}

const loadProducts = async () => {
  try {
    const res = await productApi.getByShopId(shopId)
    const list = res.data || res.products || res.result || res || []
    shopProducts.value = Array.isArray(list) ? list : []
  } catch (err) {
    console.error('[ShopView] loadProducts:', err)
    shopProducts.value = []
  }
}

onMounted(async () => {
  try {
    loading.value = true
    await loadShop()
    await loadProducts()
  } finally {
    loading.value = false
  }
})

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString('vi-VN')
}
</script>

<style scoped>
.mt-4 { margin-top: 2rem; margin-bottom: 4rem; }
.mt-2 { margin-top: 12px; }

.shop-header {
  background: var(--white);
  padding: 30px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  background-image: linear-gradient(rgba(37, 99, 235, 0.05), rgba(37, 99, 235, 0));
}
.shop-info-wrapper {
  display: flex;
  align-items: center;
  gap: 24px;
}
.shop-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-size: 32px;
  font-weight: 700;
  border: 4px solid var(--white);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}
.shop-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.shop-name {
  font-size: 24px;
  color: var(--text-dark);
  margin-bottom: 8px;
}
.shop-stats {
  display: flex;
  gap: 24px;
  color: var(--text-light);
  font-size: 14px;
}
.shop-stats strong {
  color: var(--primary-color);
  font-weight: 600;
}
.btn-sm {
  padding: 6px 16px;
  font-size: 13px;
}

.tabs {
  display: flex;
  background: var(--white);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.tab {
  flex: 1;
  padding: 16px;
  background: transparent;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-color);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: var(--transition);
  font-family: inherit;
}
.tab:hover {
  color: var(--primary-color);
}
.tab.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  font-weight: 600;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.product-card {
  background: var(--white);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
  border: 1px solid transparent;
}
.product-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-color);
}
.product-image {
  position: relative;
  overflow: hidden;
}
.product-image img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.product-card:hover .product-image img {
  transform: scale(1.05);
}
.product-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.product-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-dark);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
  line-height: 1.4;
}
.product-price-row {
  margin-top: auto;
  margin-bottom: 8px;
}
.product-price {
  color: var(--primary-color);
  font-size: 16px;
  font-weight: 700;
}
.product-rating {
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-light);
}
.stars {
  color: #FBBF24;
  letter-spacing: 2px;
}
.empty-state {
  text-align: center;
  padding: 60px;
  color: var(--text-light);
  background: var(--white);
  border-radius: var(--radius-md);
}
</style>
