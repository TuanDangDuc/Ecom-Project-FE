<template>
  <div class="admin-users">
    <div class="page-header">
      <h1 class="page-title">Quản Lý Người Dùng</h1>
      <p class="subtitle">Xem và quản lý trạng thái tài khoản của người dùng</p>
    </div>

    <div class="users-card">
      <div class="table-responsive">
        <table class="users-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>ID</th>
              <th>Họ và Tên</th>
              <th>Giới Tính</th>
              <th>Ngày Sinh</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="table-message">Đang tải danh sách người dùng...</td>
            </tr>
            <tr v-else-if="usersList.length === 0">
              <td colspan="7" class="table-message">Không có người dùng ở trang này.</td>
            </tr>
            <tr v-for="(user, index) in usersList" :key="user.id">
              <td>{{ (page - 1) * limit + index + 1 }}</td>
              <td>#{{ user.id }}</td>

              <td>
                <div class="user-info">
                  <div class="avatar">
                    <img
                      :src="user.avatarUrl"
                      v-if="user.avatarUrl"
                      @error="user.avatarUrl = null"
                      alt="Avatar"
                    >
                    <span v-else>{{ (user.fullName || user.username || 'U').charAt(0).toUpperCase() }}</span>
                  </div>
                  <div>
                    <div class="name">{{ user.fullName || user.username }}</div>
                    <div class="role">{{ user.role }}</div>
                  </div>
                </div>
              </td>

              <td>{{ user.sex || 'Chưa cập nhật' }}</td>

              <td>{{ user.dateOfBirth || 'Chưa cập nhật' }}</td>

              <td>
                <span
                  class="status-badge"
                  :class="(user.accountStatus || user.status || 'ACTIVE').toLowerCase()"
                >
                  {{ user.accountStatus || user.status || 'ACTIVE' }}
                </span>
              </td>

              <td>
                <div class="action-group">
                  <button
                    v-if="user.role !== 'ADMIN'"
                    class="btn btn-sm"
                    :class="(user.accountStatus || user.status || 'ACTIVE') === 'ACTIVE'
                      ? 'btn-danger'
                      : 'btn-success'"
                    @click="toggleStatus(user)"
                  >
                    {{ (user.accountStatus || user.status || 'ACTIVE') === 'ACTIVE'
                      ? 'Khóa'
                      : 'Mở Khóa' }}
                  </button>

                  <select
                    class="role-select"
                    :value="user.role"
                    @change="changeRole(user, $event.target.value)"
                  >
                    <option value="BUYER">BUYER</option>
                    <option value="SELLER">SELLER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>

                  <button
                    class="btn btn-sm btn-danger"
                    @click="deleteUser(user)"
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-bar">
        <span>Trang {{ page }} · {{ usersList.length }} người dùng</span>
        <div class="pagination-actions">
          <button class="page-btn" :disabled="page === 1 || loading" @click="changePage(page - 1)">
            Trước
          </button>
          <button class="page-number" disabled>{{ page }}</button>
          <button class="page-btn" :disabled="!hasNextPage || loading" @click="changePage(page + 1)">
            Sau
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { userApi } from '../../api'

const usersList = ref([])
const page = ref(1)
const limit = ref(10)
const loading = ref(false)
const hasNextPage = computed(() => usersList.value.length === limit.value)

const loadUsers = async () => {
  try {
    loading.value = true
    const res = await userApi.getAll(page.value, limit.value)

    usersList.value =
      res?.data?.data ||
      res?.data ||
      res.users ||
      []
  } catch (err) {
    alert(err.message || 'Không tải được danh sách user')
  } finally {
    loading.value = false
  }
}

const changePage = async (nextPage) => {
  if (nextPage < 1 || loading.value) return
  page.value = nextPage
  await loadUsers()

  if (usersList.value.length === 0 && page.value > 1) {
    page.value -= 1
    await loadUsers()
  }
}

const toggleStatus = async (user) => {
  const currentStatus = user.accountStatus || user.status || 'ACTIVE'
  const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

  const confirmMsg = newStatus === 'INACTIVE'
    ? `Bạn có chắc muốn khóa tài khoản ${user.fullName || user.username || user.userName}?`
    : `Bạn có chắc muốn mở khóa tài khoản ${user.fullName || user.username || user.userName}?`

  if (!confirm(confirmMsg)) return

  try {
    await userApi.updateStatus(user.username || user.userName, newStatus)
    await loadUsers()
  } catch (err) {
    alert(err.message || 'Cập nhật trạng thái thất bại')
  }
}

const changeRole = async (user, role) => {
  if (!confirm(`Đổi quyền ${user.username || user.userName} thành ${role}?`)) return

  try {
    await userApi.updateRole(user.username || user.userName, role)
    await loadUsers()
  } catch (err) {
    alert(err.message || 'Đổi role thất bại')
  }
}

const deleteUser = async (user) => {
  if (!confirm(`Xóa user ${user.username || user.userName}?`)) return

  try {
    await userApi.deleteByUsername(user.username || user.userName)
    await loadUsers()
    if (usersList.value.length === 0 && page.value > 1) {
      page.value -= 1
      await loadUsers()
    }
  } catch (err) {
    alert(err.message || 'Xóa user thất bại')
  }
}

onMounted(loadUsers)
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

.users-card {
  background: var(--white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th, .users-table td {
  padding: 16px 24px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.users-table th {
  background: #F8FAFC;
  font-weight: 600;
  color: var(--text-color);
  font-size: 14px;
}

.users-table td:last-child {
  min-width: 260px;
}

.table-message {
  padding: 32px 24px;
  text-align: center !important;
  color: var(--text-light);
}

.pagination-bar {
  min-height: 64px;
  padding: 12px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: var(--text-light);
  font-size: 14px;
}

.pagination-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn,
.page-number {
  min-width: 40px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--white);
  color: var(--text-dark);
  cursor: pointer;
}

.page-number {
  border-color: var(--primary-color);
  color: var(--primary-color);
  font-weight: 600;
}

.page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

@media (max-width: 640px) {
  .pagination-bar {
    align-items: flex-start;
    flex-direction: column;
  }
}

.user-info {
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

.role {
  font-size: 12px;
  color: #8B5CF6;
  background: rgba(139, 92, 246, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  margin-top: 4px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
}
.status-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
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
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;
}

.role-select {
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 13px;
}

</style>
