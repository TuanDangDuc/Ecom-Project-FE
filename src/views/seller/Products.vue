<template>
  <div class="seller-products">
    <div class="header-section">
      <h2 class="title">Sản Phẩm Của Tôi</h2>
      <router-link to="/seller/products/add" class="btn btn-primary">+ Thêm Sản Phẩm</router-link>
    </div>

    <div class="products-table">
      <div class="table-header">
        <div class="col-product">Tên Sản Phẩm</div>
        <div class="col-price">Giá (thấp nhất)</div>
        <div class="col-stock">Tồn Kho</div>
        <div class="col-action">Thao Tác</div>
      </div>
      <div class="table-body">
        <div class="table-row" v-for="product in productsWithStats" :key="product.id">
          <div class="col-product item-info">
            <img :src="product.thumbnailUrl" :alt="product.name">
            <div class="name">{{ product.name }}</div>
          </div>
          <div class="col-price">₫{{ formatPrice(product.minPrice) }}</div>
          <div class="col-stock">{{ product.totalStock }}</div>
          <div class="col-action">
            <button class="action-btn">Sửa</button>
            <button class="action-btn delete">Xóa</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useShopStore } from '../../stores/shop';

const shopStore = useShopStore();

const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const productsWithStats = computed(() => {
  return shopStore.shopProducts.map(p => {
    const pVariants = shopStore.variants.filter(v => v.productId === p.id);
    const minPrice = pVariants.length > 0 ? Math.min(...pVariants.map(v => v.price)) : p.basePrice;
    const totalStock = pVariants.length > 0 ? pVariants.reduce((sum, v) => sum + v.stock, 0) : 0;
    return { ...p, minPrice, totalStock };
  });
});
</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 20px;
  margin-bottom: 24px;
}
.title {
  font-size: 20px;
  color: var(--text-dark);
}
.products-table {
  width: 100%;
}
.table-header {
  display: flex;
  padding: 16px;
  background: #F9FAFB;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-weight: 600;
  color: var(--text-dark);
  font-size: 14px;
}
.table-row {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}
.col-product { flex: 3; }
.col-price { flex: 1; text-align: right; padding-right: 20px; }
.col-stock { flex: 1; text-align: center; }
.col-action { flex: 1; text-align: right; }

.item-info {
  display: flex;
  align-items: center;
  gap: 16px;
}
.item-info img {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  border: 1px solid var(--border-color);
}
.item-info .name {
  font-weight: 500;
  color: var(--text-dark);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.action-btn {
  background: none;
  border: none;
  color: #2563EB;
  cursor: pointer;
  font-size: 14px;
  margin-left: 12px;
}
.action-btn:hover { text-decoration: underline; }
.action-btn.delete { color: #EF4444; }
</style>
