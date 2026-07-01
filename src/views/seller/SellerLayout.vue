<template>
  <div class="seller-layout container mt-4">
    <div class="sidebar">
      <div class="shop-summary" v-if="shopStore.currentShop || shop">
        <div class="avatar">
          <img
            :src="(shopStore.currentShop || shop).avatarUrl"
            alt=""
            v-if="(shopStore.currentShop || shop).avatarUrl"
          />
          <span v-else>
            {{ ((shopStore.currentShop || shop).name || 'S').charAt(0) }}
          </span>
        </div>

        <div class="info">
          <div class="name">{{ (shopStore.currentShop || shop).name }}</div>
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

      <div class="sidebar-footer">
        <router-link to="/" class="sidebar-link back-home">
          ← Về Trang Chính
        </router-link>
      </div>
    </div>

    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useShopStore } from '../../stores/shop'
import { useUserStore } from '../../stores/user'
import { useRouter } from 'vue-router'
import { shopApi } from '../../api'

const shopStore = useShopStore()
const userStore = useUserStore()
const router = useRouter()

const shop = ref(null)

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  if (userStore.currentUser?.role !== 'SELLER') {
    alert('Bạn không có quyền truy cập kênh người bán!')
    router.push('/')
    return
  }

  try {
    const userId = userStore.currentUser?.id || Number(sessionStorage.getItem('userId') || localStorage.getItem('userId'))
    const res = await shopApi.getByUserId(userId)

    const list = res?.data || res.shops || res?.result || []
    const currentShop = Array.isArray(list) ? list[0] : list

    if (currentShop && currentShop.id) {
      shop.value = currentShop
      shopStore.currentShop = currentShop
    }
  } catch (err) {
    console.error('[Seller layout load shop]', err)
  }
})
</script>

<style scoped>
.seller-layout {
  display: flex;
  gap: 30px;
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  min-height: calc(100vh - 100px);
}

.sidebar {
  width: 280px;
  background: var(--white);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
}

.shop-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 24px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info .name {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.info .status {
  font-size: 13px;
  color: #10b981;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.info .status::before {
  content: '';
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.sidebar-link {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.sidebar-link:hover {
  background: #f8fafc;
  color: #0f172a;
  transform: translateX(4px);
}

.sidebar-link.router-link-active {
  background: #0f172a;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
}

.sidebar-footer {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.back-home {
  color: #ef4444;
  background: #fef2f2;
}

.back-home:hover {
  background: #fee2e2;
  color: #dc2626;
  transform: translateX(-4px);
}

.main-content {
  flex: 1;
  background: #ffffff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.03);
  min-height: 600px;
  overflow: hidden;
}
</style>
