<template>
  <div class="admin-dashboard">
    <div class="page-header">
      <h1 class="page-title">Tổng Quan Hệ Thống</h1>
      <p class="subtitle">Báo cáo thống kê tổng quát toàn sàn</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon users">👥</div>
        <div class="stat-info">
          <h3>Tổng Người Dùng</h3>
          <div class="value">{{ usersCount }}</div>
          <div class="trend positive">↑ 12% so với tháng trước</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon shops">🏪</div>
        <div class="stat-info">
          <h3>Cửa Hàng Hoạt Động</h3>
          <div class="value">{{ shopsCount }}</div>
          <div class="trend positive">↑ 5% so với tháng trước</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon revenue">💰</div>
        <div class="stat-info">
          <h3>Doanh Thu Toàn Sàn</h3>
          <div class="value">₫125.5M</div>
          <div class="trend positive">↑ 20% so với tháng trước</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orders">📦</div>
        <div class="stat-info">
          <h3>Đơn Hàng Thành Công</h3>
          <div class="value">1,248</div>
          <div class="trend negative">↓ 2% so với tháng trước</div>
        </div>
      </div>
    </div>

    <div class="charts-section">
      <div class="chart-card">
        <h3 class="chart-title">Biểu Đồ Doanh Thu (Minh họa)</h3>
        <div class="chart-placeholder">

          <div class="bar-chart">
            <div class="bar" style="height: 40%"></div>
            <div class="bar" style="height: 60%"></div>
            <div class="bar" style="height: 35%"></div>
            <div class="bar" style="height: 80%"></div>
            <div class="bar" style="height: 55%"></div>
            <div class="bar" style="height: 90%"></div>
            <div class="bar" style="height: 70%"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { userApi, shopApi, orderApi } from '../../api/index';

const usersCount = ref(0);
const shopsCount = ref(0);
const ordersCount = ref(0);

onMounted(async () => {
  try {

    const resUsers = await userApi.getAll(1, 1000);
    const usersList = Array.isArray(resUsers) ? resUsers : (resUsers?.data || resUsers?.users || []);
    usersCount.value = usersList.length;

    const resShops = await shopApi.getAll(1, 1000);
    const shopsList = Array.isArray(resShops) ? resShops : (resShops?.data || resShops?.shops || []);
    shopsCount.value = shopsList.length;

  } catch (err) {
    console.error('Lỗi tải dashboard:', err);
  }
});
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}
.stat-card {
  background: var(--white);
  padding: 24px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 20px;
}
.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}
.stat-icon.users { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
.stat-icon.shops { background: rgba(16, 185, 129, 0.1); color: #10B981; }
.stat-icon.revenue { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }
.stat-icon.orders { background: rgba(139, 92, 246, 0.1); color: #8B5CF6; }

.stat-info h3 {
  font-size: 14px;
  color: var(--text-light);
  font-weight: 500;
  margin-bottom: 4px;
}
.stat-info .value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 4px;
}
.trend {
  font-size: 12px;
  font-weight: 500;
}
.trend.positive { color: var(--success); }
.trend.negative { color: #EF4444; }

.charts-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
.chart-card {
  background: var(--white);
  padding: 24px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
.chart-title {
  font-size: 18px;
  color: var(--text-dark);
  margin-bottom: 24px;
}
.chart-placeholder {
  height: 300px;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: flex-end;
  padding: 20px;
  gap: 16px;
}
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  width: 100%;
  height: 100%;
  padding-bottom: 20px;
}
.bar {
  flex: 1;
  background: var(--primary-color);
  border-radius: 4px 4px 0 0;
  opacity: 0.8;
  transition: var(--transition);
}
.bar:hover {
  opacity: 1;
}
</style>
