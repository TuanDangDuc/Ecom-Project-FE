<template>

  <header class="header">
    <div class="container header-inner">
      <div class="logo">
        <router-link to="/" class="logo-link" title="Về Trang Chủ">
          <span class="logo-text">Ecom<span class="logo-dot">.</span></span>
        </router-link>
      </div>

      <div class="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm, thương hiệu..."
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          class="search-input"
        >
        <button class="search-btn" @click="handleSearch">Tìm Kiếm</button>
      </div>

      <div class="header-actions">
        <router-link to="/cart" class="action-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <span class="action-label">Giỏ hàng</span>
          <span class="action-badge" v-if="cartStore.cartItemsCount > 0">{{ cartStore.cartItemsCount }}</span>
        </router-link>

        <div class="action-item user-menu-container" ref="menuRef" v-if="userStore.isLoggedIn">
          <div @click="toggleDropdown" class="user-trigger">
            <div class="user-avatar">
              <img
                :src="userStore.currentUser.avatarUrl"
                v-if="userStore.currentUser.avatarUrl && !avatarError"
                @error="avatarError = true"
                alt=""
              >
              <span v-else>
                {{ (userStore.currentUser.fullName || userStore.currentUser.username || 'U').charAt(0) }}
              </span>
            </div>
            <span class="action-label">Tài khoản</span>
          </div>
          <Transition name="dropdown">
            <div class="dropdown-menu" v-if="dropdownOpen" @click="dropdownOpen = false">
              <router-link to="/profile/account" class="dropdown-item">Hồ Sơ Của Tôi</router-link>
              <router-link to="/profile/orders" class="dropdown-item">Đơn Mua</router-link>
              <router-link to="/profile/addresses" class="dropdown-item">Địa Chỉ</router-link>
              <router-link
                to="/seller/dashboard"
                class="dropdown-item"
                v-if="userStore.currentUser.role === 'SELLER'"
              >
                Kênh Người Bán
              </router-link>
              <router-link
                to="/admin/dashboard"
                class="dropdown-item"
                v-if="userStore.currentUser.role === 'ADMIN'"
              >
                Kênh Quản Trị
              </router-link>
              <div class="dropdown-divider"></div>
              <a href="#" @click.prevent="handleLogout" class="dropdown-item logout">Đăng xuất</a>
            </div>
          </Transition>
        </div>

        <router-link to="/login" class="action-item" v-else>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span class="action-label">Đăng nhập</span>
        </router-link>
      </div>
    </div>
  </header>

  <nav class="navbar">
    <div class="container navbar-inner">
      <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">Trang Chủ</router-link>

      <router-link :to="`/search?keyword=điện thoại`" class="nav-link">Điện Thoại</router-link>
      <router-link :to="`/search?keyword=laptop`" class="nav-link">Laptop</router-link>
      <router-link :to="`/search?keyword=thời trang`" class="nav-link">Thời Trang</router-link>
      <router-link :to="`/search?keyword=phụ kiện`" class="nav-link">Phụ Kiện</router-link>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/user';
import { useCartStore } from '../../stores/cart';

const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();

const searchQuery = ref('');
const dropdownOpen = ref(false);
const menuRef = ref(null);
const avatarError = ref(false);

watch(() => userStore.currentUser, () => {
  avatarError.value = false;
});

const toggleDropdown = () => { dropdownOpen.value = !dropdownOpen.value; };

const handleClickOutside = (e) => {
  if (menuRef.value && !menuRef.value.contains(e.target)) dropdownOpen.value = false;
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { keyword: searchQuery.value.trim() } });
  }
};

const handleLogout = () => {
  userStore.logout();
  dropdownOpen.value = false;
  router.push('/');
};
</script>

<style scoped>

.header {
  background: var(--white);
  border-bottom: 1px solid var(--border-color);
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}
.header-inner {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: #fff;
  border-radius: 12px;
  transform: rotate(-5deg);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.logo-link:hover .logo-icon {
  transform: rotate(0deg) scale(1.1);
}
.logo-text {
  font-size: 28px;
  font-weight: 900;
  color: var(--text-dark);
  letter-spacing: -1px;
  font-family: 'Inter', sans-serif;
}
.logo-dot { color: var(--primary-color); }

.search-bar {
  flex: 1;
  display: flex;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
  max-width: 560px;
  transition: var(--transition-fast);
}
.search-bar:focus-within {
  border-color: var(--primary-color);
}
.search-input {
  flex: 1;
  padding: 11px 16px;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: inherit;
  background: transparent;
}
.search-btn {
  padding: 0 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition-fast);
  white-space: nowrap;
}
.search-btn:hover { background: var(--primary-color-hover); }

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}
.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  cursor: pointer;
  position: relative;
  color: var(--text-dark);
  transition: var(--transition-fast);
}
.action-item:hover { background: var(--bg-color); color: var(--primary-color); }
.action-label { font-size: 11px; font-weight: 500; white-space: nowrap; }
.action-badge {
  position: absolute;
  top: 4px;
  right: 8px;
  background: var(--primary-color);
  color: white;
  font-size: 10px;
  font-weight: 700;
  min-width: 17px;
  height: 17px;
  border-radius: 99px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
}

.user-menu-container { position: relative; }
.user-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}
.user-trigger:hover { background: var(--bg-color); color: var(--primary-color); }
.user-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 700;
}
.user-avatar img { width: 100%; height: 100%; object-fit: cover; }

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 200px;
  z-index: 9999;
  overflow: hidden;
}
.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.15s, transform 0.15s; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-6px); }
.dropdown-item {
  display: block;
  padding: 11px 18px;
  font-size: 14px;
  color: var(--text-color);
  transition: var(--transition-fast);
}
.dropdown-item:hover { background: var(--bg-color); color: var(--primary-color); }
.dropdown-divider { height: 1px; background: var(--border-color); }
.logout { color: var(--danger); }
.logout:hover { background: #FEF2F2; color: var(--danger); }

.navbar {
  background: var(--white);
  border-bottom: 2px solid var(--border-color);
}
.navbar-inner {
  display: flex;
  align-items: center;
  gap: 2px;
}
.nav-link {
  padding: 14px 18px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: var(--transition-fast);
  white-space: nowrap;
}
.nav-link:hover { color: var(--primary-color); }
.nav-link.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
</style>
