<template>
  <div class="seller-dashboard">
    <div class="header-section">
      <h2 class="title">Tổng Quan Cửa Hàng</h2>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🛍️</div>
        <div class="stat-info">
          <div class="stat-value">{{ shopStore.shopProducts.length }}</div>
          <div class="stat-label">Sản phẩm hiện có</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐️</div>
        <div class="stat-info">
          <div class="stat-value">{{ shopStore.currentShop?.ratingAverage }}</div>
          <div class="stat-label">Đánh giá trung bình</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-info">
          <div class="stat-value">12</div>
          <div class="stat-label">Đơn hàng chờ xử lý</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useShopStore } from '../../stores/shop';
const shopStore = useShopStore();
</script>

<style scoped>
.header-section {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 20px;
  margin-bottom: 24px;
}
.title {
  font-size: 20px;
  color: var(--text-dark);
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #F9FAFB;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}
.stat-icon {
  font-size: 36px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--white);
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1;
  margin-bottom: 4px;
}
.stat-label {
  color: var(--text-light);
  font-size: 14px;
}
</style>
