<template>
  <div class="seller-layout container mt-4">
    <div class="sidebar">
      <div class="shop-summary" v-if="shopStore.currentShop">
        <div class="avatar"><img :src="shopStore.currentShop.avatarUrl" alt="" v-if="shopStore.currentShop.avatarUrl" /><span v-else>{{ shopStore.currentShop.name.charAt(0) }}</span></div>
        <div class="info">
          <div class="name">{{ shopStore.currentShop.name }}</div>
          <div class="status">Cửa hàng của bạn</div>
        </div>
      </div>
      <ul class="nav-list">
        <li>
          <router-link to="/seller/dashboard" class="sidebar-link">
            Tổng Quan
          </router-link>
        </li>
        <li>
          <router-link to="/seller/orders" class="sidebar-link">
            Quản Lý Đơn Hàng
          </router-link>
        </li>
        <li>
          <router-link to="/seller/products" class="sidebar-link">
            Quản Lý Sản Phẩm
          </router-link>
        </li>
        <li>
          <router-link to="/seller/profile" class="sidebar-link">
            Hồ Sơ Shop
          </router-link>
        </li>
      </ul>
    </div>
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useShopStore } from '../../stores/shop';
import { useUserStore } from '../../stores/user';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const shopStore = useShopStore();
const userStore = useUserStore();
const router = useRouter();

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login');
  } else if (!userStore.currentUser.shopId) {
    alert("Bạn chưa có cửa hàng!");
    router.push('/');
  }
});
</script>

<style scoped>
.mt-4 { margin-top: 2rem; }
.seller-layout {
  display: flex;
  gap: 24px;
}
.sidebar {
  width: 250px;
}
.shop-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 20px;
}
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-gradient);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  overflow: hidden;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.info .name {
  font-weight: 600;
  color: var(--text-dark);
}
.info .status {
  font-size: 13px;
  color: var(--text-light);
}
.nav-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sidebar-link {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  color: var(--text-color);
  font-weight: 500;
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
  border-left: 4px solid transparent;
}
.sidebar-link:hover {
  background: var(--bg-color);
  color: var(--primary-color);
  border-left-color: rgba(37, 99, 235, 0.3);
}
.sidebar-link.router-link-active {
  background: rgba(37, 99, 235, 0.05);
  color: var(--primary-color);
  font-weight: 600;
  border-left-color: var(--primary-color);
}
.main-content {
  flex: 1;
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 30px;
  box-shadow: var(--shadow-sm);
  min-height: 500px;
}
</style>
