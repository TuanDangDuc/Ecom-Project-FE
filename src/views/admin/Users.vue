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
                    <img :src="user.avatarUrl" v-if="user.avatarUrl" alt="Avatar">
                    <span v-else>{{ user.fullName.charAt(0) }}</span>
                  </div>
                  <div>
                    <div class="name">{{ user.fullName }}</div>
                    <div class="role" v-if="user.role === 'admin'">Admin</div>
                  </div>
                </div>
              </td>
              <td>{{ user.sex }}</td>
              <td>{{ user.dateOfBirth }}</td>
              <td>
                <span class="status-badge" :class="user.accountStatus.toLowerCase()">
                  {{ user.accountStatus }}
                </span>
              </td>
              <td>
                <button 
                  v-if="user.role !== 'admin'"
                  class="btn btn-sm" 
                  :class="user.accountStatus === 'ACTIVE' ? 'btn-danger' : 'btn-success'"
                  @click="toggleStatus(user)"
                >
                  {{ user.accountStatus === 'ACTIVE' ? 'Khóa' : 'Mở Khóa' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { users } from '../../mock/data';

const usersList = ref([]);

onMounted(() => {
  usersList.value = [...users];
});

const toggleStatus = (user) => {
  const confirmMsg = user.accountStatus === 'ACTIVE' 
    ? `Bạn có chắc muốn khóa tài khoản ${user.fullName}?` 
    : `Bạn có chắc muốn mở khóa tài khoản ${user.fullName}?`;
    
  if (confirm(confirmMsg)) {
    user.accountStatus = user.accountStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
  }
};
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
.status-badge.banned {
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
</style>
