<template>
  <div class="home">
    <!-- Top Collections -->
    <section class="container collections">
      <div class="collection-card" v-for="(col, index) in collections" :key="index">
        <div class="col-bg">
          <img :src="col.image" :alt="col.title">
        </div>
        <div class="col-overlay">
          <div class="col-content">
            <h3>{{ col.title }}<br>Collection</h3>
            <a href="#" class="shop-now">SHOP NOW <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"></polyline></svg></a>
          </div>
        </div>
      </div>
    </section>

    <!-- New Products Section -->
    <section class="container new-products">
      <div class="section-header">
        <h2 class="section-title">NEW PRODUCTS</h2>
        <div class="tabs">
          <button class="tab active">Laptops</button>
          <button class="tab">Smartphones</button>
          <button class="tab">Cameras</button>
          <button class="tab">Accessories</button>
        </div>
      </div>

      <div class="product-grid">
        <div class="product-card" v-for="product in products" :key="product.id">


          <!-- Image -->
          <router-link :to="`/product/${product.id}`" class="product-image">
            <img :src="product.thumbnailUrl" :alt="product.name">
          </router-link>

          <!-- Info -->
          <div class="product-info">
            <h3 class="product-name">
              <router-link :to="`/product/${product.id}`">{{ product.name }}</router-link>
            </h3>
            <div class="product-price">
              <span class="new-price">₫{{ formatPrice(product.basePrice) }}</span>
              <span class="sold-count">{{ product.id * 15 + 12 }} đã bán</span>
            </div>
          </div>


        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { products } from '../../mock/data';

const collections = [
  { title: 'Laptop', image: 'https://picsum.photos/seed/laptop1/400/400' },
  { title: 'Accessories', image: 'https://picsum.photos/seed/acc1/400/400' },
  { title: 'Cameras', image: 'https://picsum.photos/seed/cam1/400/400' }
];

const formatPrice = (price) => {
  return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
</script>

<style scoped>
.home {
  padding-bottom: 80px;
}

/* Collections */
.collections {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 30px;
  margin-bottom: 60px;
}
.collection-card {
  position: relative;
  background: var(--bg-color);
  height: 240px;
  overflow: hidden;
}
.col-bg {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 20%;
}
.col-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: right center;
}
.col-overlay {
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: 75%;
  background: var(--primary-color);
  clip-path: polygon(0 0, 100% 0, 60% 100%, 0 100%);
  display: flex;
  align-items: center;
}
.col-content {
  padding-left: 30px;
  color: white;
}
.col-content h3 {
  font-size: 24px;
  font-weight: 800;
  color: white;
  margin-bottom: 12px;
  line-height: 1.2;
}
.shop-now {
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 5px;
  color: white;
  opacity: 0.9;
}
.shop-now:hover { opacity: 1; margin-left: 4px; }

/* New Products Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 2px solid var(--border-color);
}
.section-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-dark);
  text-transform: uppercase;
  margin-bottom: -2px;
  border-bottom: 2px solid transparent;
}
.tabs {
  display: flex;
  gap: 24px;
}
.tab {
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-light);
  cursor: pointer;
  transition: var(--transition-fast);
  padding: 10px 0;
  margin-bottom: -2px;
  border-bottom: 2px solid transparent;
}
.tab:hover {
  color: var(--primary-color);
}
.tab.active {
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.product-card {
  background: white;
  position: relative;
  padding: 0;
  display: flex;
  flex-direction: column;
  transition: var(--transition);
  height: 380px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  overflow: hidden;
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* Tags */
.product-tags {
  position: absolute;
  top: 15px; right: 15px;
  display: flex;
  gap: 5px;
  z-index: 2;
}
.tag {
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 2px;
  border: 2px solid transparent;
}
.tag.sale { background: transparent; color: var(--primary-color); border-color: var(--primary-color); }
.tag.new { background: var(--primary-color); }

/* Image */
.product-image {
  width: 100%;
  aspect-ratio: 1;
  display: block;
  overflow: hidden;
  margin-bottom: 0;
}
.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition);
}
.product-card:hover .product-image img { transform: scale(1.05); }

/* Info */
.product-info {
  text-align: left;
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
}
.product-name {
  font-size: 14px;
  font-weight: 400;
  margin-bottom: 12px;
  line-height: 1.4;
  height: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.product-name a { color: var(--text-dark); }
.product-name a:hover { color: var(--primary-color); }

.product-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}
.new-price {
  color: var(--primary-color);
  font-size: 18px;
  font-weight: 700;
}
.sold-count {
  color: var(--text-light);
  font-size: 12px;
}

/* Hover Actions */
.product-actions {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 15px;
  background: white;
  transform: translateY(10px);
  opacity: 0;
  transition: var(--transition);
  visibility: hidden;
}
.product-card:hover .product-actions {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}
.action-btn {
  background: transparent;
  border: none;
  color: var(--text-dark);
  cursor: pointer;
  padding: 5px;
  transition: var(--transition-fast);
}
.action-btn:hover { color: var(--primary-color); }
</style>
