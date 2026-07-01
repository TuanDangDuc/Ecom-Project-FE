<template>
  <div class="admin-shops">
    <div class="page-header">
      <h1 class="page-title">Quản Lý Cửa Hàng</h1>
      <p class="subtitle">Xem danh sách và trạng thái hoạt động của các cửa hàng (Shops)</p>
    </div>

    <div class="shops-card">
      <div class="table-responsive">
        <table class="shops-table">
          <thead>
            <tr>
              <th>ID Shop</th>
              <th>Cửa Hàng</th>
              <th>Chủ Sở Hữu (User ID)</th>
              <th>Đánh Giá</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="shop in shopsList" :key="shop.id">
              <td>#{{ shop.id }}</td>
              <td>
                <div class="shop-info">
                  <div class="avatar">
                    <img :src="shop.avatarUrl" v-if="shop.avatarUrl" alt="Avatar">
                    <span v-else>{{ shop.name.charAt(0) }}</span>
                  </div>
                  <div class="name">{{ shop.name }}</div>
                </div>
              </td>
              <td>#{{ shop.userId }}</td>
              <td>
                <div class="rating">
                  <span class="stars">★</span> {{ shop.ratingAverage }}
                </div>
              </td>
              <td>
                <span
                  class="status-badge"
                  :class="(shop.shopStatus || shop.status || 'ACTIVE').toLowerCase()"
                >
                  {{ shop.shopStatus || shop.status || 'ACTIVE' }}
                </span>
              </td>
              <td>
                <div class="action-group">
                  <button
                    class="btn btn-sm"
                    :class="(shop.shopStatus || shop.status) === 'ACTIVE' ? 'btn-danger' : 'btn-success'"
                    @click="toggleStatus(shop)"
                  >
                    {{ (shop.shopStatus || shop.status) === 'ACTIVE' ? 'Đình Chỉ' : 'Kích Hoạt' }}
                  </button>

                  <button
                    class="btn btn-sm btn-danger"
                    @click="deleteShop(shop)"
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { shopApi } from '../../api'

const shopsList = ref([])

onMounted(async () => {
  try {
    const res = await shopApi.getAll(1, 100); // Lấy số lượng lớn hoặc backend trả full
    shopsList.value = Array.isArray(res) ? res : (res?.data || res?.shops || []);
  } catch (error) {
    console.error('Lỗi khi tải danh sách cửa hàng:', error);
  }
})

const toggleStatus = async (shop) => {
  const currentStatus = shop.shopStatus || shop.status || 'ACTIVE'
  const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

  const confirmMsg = newStatus === 'INACTIVE'
    ? `Bạn có chắc muốn đình chỉ cửa hàng ${shop.name}?`
    : `Bạn có chắc muốn kích hoạt lại cửa hàng ${shop.name}?`

  if (!confirm(confirmMsg)) return

  try {
    await shopApi.updateStatus(shop.id, newStatus)
    shop.shopStatus = newStatus
    shop.status = newStatus
  } catch (err) {
    alert(err.message || 'Cập nhật trạng thái shop thất bại')
  }
}

const deleteShop = async (shop) => {
  if (!confirm(`Xóa cửa hàng ${shop.name}?`)) return

  try {
    await shopApi.delete(shop.id)
    shopsList.value = shopsList.value.filter(s => s.id !== shop.id)
  } catch (err) {
    alert(err.message || 'Xóa shop thất bại')
  }
}
</script>
<style scoped>
.page-header {
  margin-bottom: 32px;
}
.page-title {
  font-size: 28px;
  color: var(--text-dark);
  margin-bottom: 8px;
}
.subtitle {
  color: var(--text-light);
}

.shops-card {
  background: var(--white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.shops-table {
  width: 100%;
  border-collapse: collapse;
}

.shops-table th, .shops-table td {
  padding: 16px 24px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.shops-table th {
  background: #F8FAFC;
  font-weight: 600;
  color: var(--text-color);
  font-size: 14px;
}

.shop-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--primary-color);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.name {
  font-weight: 500;
  color: var(--text-dark);
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
}
.stars {
  color: #FBBF24;
}

.status-badge.inactive {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  font-weight: 600;
}
.btn-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}
.btn-danger:hover {
  background: #EF4444;
  color: var(--white);
}
.btn-success {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}
.btn-success:hover {
  background: #10B981;
  color: var(--white);
}

.action-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
