<template>
  <div class="seller-orders">
    <div class="page-header">
      <h1 class="page-title">Quản Lý Đơn Hàng</h1>
      <p class="subtitle">Theo dõi và cập nhật trạng thái đơn hàng của Shop</p>
    </div>

    <div class="orders-card">
      <div class="tabs">
        <button class="tab active">Tất Cả</button>
        <button class="tab">Chờ Xác Nhận</button>
        <button class="tab">Đang Giao</button>
        <button class="tab">Đã Giao</button>
        <button class="tab">Đã Hủy</button>
      </div>
      
      <div class="orders-list">
        <div class="order-item" v-for="order in shopOrders" :key="order.id">
          <div class="order-header">
            <div class="order-meta">
              <span class="order-id">Mã ĐH: {{ order.orderCode }}</span>
              <span class="order-date">{{ new Date(order.createdAt).toLocaleString('vi-VN') }}</span>
            </div>
            <div class="order-status" :class="getStatusClass(order.status)">
              {{ order.status }}
            </div>
          </div>
          
          <div class="order-products">
            <div class="product-row" v-for="item in order.items" :key="item.id">
              <div class="prod-img">
                <img :src="item.productThumbnail" alt="Product">
              </div>
              <div class="prod-info">
                <div class="prod-name">{{ item.productName }}</div>
                <div class="prod-variant">Phân loại: {{ item.variantOptions }}</div>
                <div class="prod-qty">x{{ item.quantity }}</div>
              </div>
              <div class="prod-price">₫{{ formatPrice(item.priceAtPurchase) }}</div>
            </div>
          </div>
          
          <div class="order-footer">
            <div class="customer-info">
              <strong>Khách hàng:</strong> {{ order.recipientName }} - {{ order.recipientPhone }}
            </div>
            <div class="order-total">
              Tổng số tiền: <span>₫{{ formatPrice(order.totalAmount) }}</span>
            </div>
            <div class="order-actions">
              <button class="btn btn-outline btn-sm" v-if="order.status === 'Chờ xác nhận'" @click="updateStatus(order, 'Đang giao')">Xác Nhận & Giao Hàng</button>
              <button class="btn btn-primary btn-sm" v-if="order.status === 'Đang giao'" @click="updateStatus(order, 'Đã giao')">Đã Giao Thành Công</button>
              <button class="btn btn-danger btn-sm" v-if="order.status === 'Chờ xác nhận'">Hủy Đơn</button>
            </div>
          </div>
        </div>
        
        <div class="empty-state" v-if="shopOrders.length === 0">
          <p class="empty-text">Chưa có đơn hàng nào.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../../stores/user';
import { orders } from '../../mock/data';

const userStore = useUserStore();
const shopOrders = ref([]);

onMounted(() => {
  // In a real app, fetch orders by shopId
  // Here we just mock it. Assume user1 (shopId 101) has all mock orders.
  shopOrders.value = [...orders];
});

const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const getStatusClass = (status) => {
  if (status === 'Chờ xác nhận') return 'warning';
  if (status === 'Đang giao') return 'info';
  if (status === 'Đã giao') return 'success';
  if (status === 'Đã hủy') return 'danger';
  return '';
};

const updateStatus = (order, newStatus) => {
  order.status = newStatus;
  alert(`Đã cập nhật trạng thái đơn hàng thành: ${newStatus}`);
};
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}
.page-title {
  font-size: 24px;
  color: var(--text-dark);
  margin-bottom: 8px;
}
.subtitle {
  color: var(--text-light);
}

.orders-card {
  background: var(--white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background: #F8FAFC;
}
.tab {
  flex: 1;
  padding: 16px;
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: var(--transition);
}
.tab:hover {
  color: var(--primary-color);
}
.tab.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  font-weight: 600;
  background: var(--white);
}

.orders-list {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.order-item {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #F8FAFC;
  border-bottom: 1px solid var(--border-color);
}
.order-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
}
.order-id {
  font-weight: 600;
  color: var(--text-dark);
}
.order-date {
  color: var(--text-light);
}
.order-status {
  font-weight: 600;
  font-size: 14px;
}
.order-status.warning { color: #F59E0B; }
.order-status.info { color: #3B82F6; }
.order-status.success { color: #10B981; }
.order-status.danger { color: #EF4444; }

.order-products {
  padding: 20px;
}
.product-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}
.product-row:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}
.prod-img {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  overflow: hidden;
}
.prod-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.prod-info {
  flex: 1;
}
.prod-name {
  font-weight: 500;
  color: var(--text-dark);
  margin-bottom: 4px;
}
.prod-variant {
  font-size: 13px;
  color: var(--text-light);
  margin-bottom: 8px;
}
.prod-qty {
  font-size: 14px;
  color: var(--text-dark);
}
.prod-price {
  font-weight: 600;
  color: var(--primary-color);
}

.order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #F8FAFC;
  border-top: 1px solid var(--border-color);
}
.customer-info {
  font-size: 14px;
  color: var(--text-color);
}
.order-total {
  font-size: 15px;
  color: var(--text-dark);
}
.order-total span {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-color);
  margin-left: 8px;
}
.order-actions {
  display: flex;
  gap: 12px;
}
.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}
.btn-danger {
  background: transparent;
  border: 1px solid #EF4444;
  color: #EF4444;
}
.btn-danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-light);
}
</style>
