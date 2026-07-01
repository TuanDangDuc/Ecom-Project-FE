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
              <th>ID</th>
              <th>Họ và Tên</th>
              <th>Giới Tính</th>
              <th>Ngày Sinh</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in usersList" :key="user.id">
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userApi } from '../../api'

const usersList = ref([])
const page = ref(1)
const limit = ref(10)
const loading = ref(false)

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
