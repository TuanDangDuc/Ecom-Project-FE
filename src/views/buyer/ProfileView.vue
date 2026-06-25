<template>
  <div class="profile-layout container mt-4">
    <div class="sidebar">
      <div class="user-summary">
        <div class="avatar"><img :src="userStore.currentUser?.avatarUrl" alt="" v-if="userStore.currentUser?.avatarUrl" />
          <span v-else>
            {{ (userStore.currentUser?.fullName || userStore.currentUser?.username || 'U').charAt(0) }}
          </span>
        </div>
        <div class="info">
          <div class="name">
            {{ userStore.currentUser?.fullName || userStore.currentUser?.username || 'Người dùng' }}
          </div>
          <div class="edit"><router-link to="/profile/account">Sửa hồ sơ</router-link></div>
        </div>
      </div>
      <ul class="nav-list">
        <li>
          <router-link to="/profile/account" class="sidebar-link">
            Hồ Sơ Của Tôi
          </router-link>
        </li>
        <li>
          <router-link to="/profile/orders" class="sidebar-link">
            Đơn Mua
          </router-link>
        </li>
        <li>
          <router-link to="/profile/addresses" class="sidebar-link">
            Địa Chỉ
          </router-link>
        </li>
      </ul>

      <div class="register-shop-box" v-if="userStore.currentUser?.role === 'BUYER'">
        <p>Bạn chưa có cửa hàng?</p>
        <button class="btn btn-outline btn-sm" @click="handleRegisterShop">
          Đăng ký bán hàng ngay
        </button>
      </div>
    </div>
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '../../stores/user';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const userStore = useUserStore();
const router = useRouter();

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login');
  }
});

const handleRegisterShop = () => {
  alert('Vui lòng liên hệ admin để nâng quyền SELLER trước khi tạo cửa hàng.')
}
</script>

<style scoped>
.mt-4 { margin-top: 2rem; }
.profile-layout {
  display: flex;
  gap: 24px;
}
.sidebar {
  width: 250px;
}
.user-summary {
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
.info .edit a {
  font-size: 13px;
  color: var(--text-light);
}
.info .edit a:hover {
  color: var(--primary-color);
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

.register-shop-box {
  margin-top: 30px;
  padding: 20px;
  background: rgba(255, 90, 95, 0.05);
  border: 1px dashed var(--primary-color);
  border-radius: var(--radius-md);
  text-align: center;
}
.register-shop-box p {
  font-size: 14px;
  color: var(--text-dark);
  font-weight: 500;
  margin-bottom: 12px;
}
.btn-sm {
  width: 100%;
  padding: 8px;
  font-size: 13px;
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
