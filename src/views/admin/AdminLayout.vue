<template>
  <div class="admin-layout">
    <div class="sidebar">
      <div class="logo">
        <router-link to="/admin">
          <h2>Shopee<span>Admin</span></h2>
        </router-link>
      </div>
      <ul class="nav-links">
        <li>
          <router-link to="/admin/dashboard" class="sidebar-link">
            Tổng Quan
          </router-link>
        </li>
        <li>
          <router-link to="/admin/users" class="sidebar-link">
            Quản Lý Người Dùng
          </router-link>
        </li>
        <li>
          <router-link to="/admin/shops" class="sidebar-link">
            Quản Lý Cửa Hàng
          </router-link>
        </li>
        <li>
          <router-link to="/admin/categories" class="sidebar-link">
            Danh Mục & Loại SP
          </router-link>
        </li>
      </ul>
      <div class="sidebar-footer">
        <router-link to="/" class="sidebar-link">
          Về Trang Chủ
        </router-link>
        <button class="sidebar-link logout-btn" @click="handleLogout">
          Đăng Xuất
        </button>
      </div>
    </div>
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  if (userStore.currentUser?.role !== 'ADMIN') {
    alert('Bạn không có quyền truy cập trang quản trị!')
    router.push('/')
  }
})

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-color);
}
.sidebar {
  width: 260px;
  background: var(--white);
  border-right: 1px solid var(--border-color);
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
}
.logo {
  padding: 0 24px 24px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 24px;
}
.logo h2 {
  font-size: 24px;
  color: var(--primary-color);
  margin: 0;
}
.logo h2 span {
  color: var(--text-dark);
}
.nav-links {
  flex: 1;
  padding: 0 16px;
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
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-color);
}
.main-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.logout-btn {
  width: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  margin-top: 8px;
  color: #EF4444;
}
</style>
