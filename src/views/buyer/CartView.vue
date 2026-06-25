<template>
  <div class="cart-view container mt-4">
    <div class="cart-main" v-if="cartStore.items.length > 0">
      <div class="cart-items-section">
        <h2 class="section-title">Giỏ hàng của bạn</h2>
        <div class="cart-header">
          <div class="col-product">Sản Phẩm</div>
          <div class="col-price">Đơn Giá</div>
          <div class="col-qty">Số Lượng</div>
          <div class="col-total">Số Tiền</div>
          <div class="col-action"></div>
        </div>

        <div class="cart-items">
          <div class="cart-item" v-for="item in cartStore.items" :key="item.id">
            <div class="col-product item-info">
              <img v-if="item.productThumbnail" :src="item.productThumbnail" :alt="item.productName">
              <div v-else class="image-placeholder">{{ productInitial(item.productName) }}</div>
              <div class="details">
                <div class="name">{{ item.productName || 'Sản phẩm' }}</div>
                <div class="variant" v-if="hasVariantOptions(item.variantOptions)">
                  Phân loại: {{ formatVariantOptions(item.variantOptions) }}
                </div>
              </div>
            </div>
            <div class="col-price">₫{{ formatPrice(itemPrice(item)) }}</div>
            <div class="col-qty">
              <div class="quantity-selector">
                <button @click="updateQty(item, item.quantity - 1)">-</button>
                <input type="number" :value="item.quantity" @change="e => updateQty(item, parseInt(e.target.value))" />
                <button @click="updateQty(item, item.quantity + 1)">+</button>
              </div>
            </div>
            <div class="col-total item-total">₫{{ formatPrice(itemPrice(item) * item.quantity) }}</div>
            <div class="col-action">
              <button class="delete-btn" @click="cartStore.removeItem(item.id)" title="Xóa sản phẩm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="cart-summary-section">
        <h3 class="summary-title">Tóm tắt đơn hàng</h3>
        <div class="summary-row">
          <span>Tổng phụ ({{ cartStore.cartItemsCount }} sản phẩm)</span>
          <span>₫{{ formatPrice(cartStore.totalCost) }}</span>
        </div>
        <div class="summary-row total-row">
          <span>Tổng cộng</span>
          <span class="total-price">₫{{ formatPrice(cartStore.totalCost) }}</span>
        </div>
        <button class="btn btn-primary btn-checkout" @click="router.push('/checkout')">Tiến Hành Thanh Toán</button>
      </div>
    </div>
    
    <div class="empty-cart" v-else>
      <div class="empty-icon">🛍️</div>
      <div class="empty-msg">Giỏ hàng của bạn đang trống</div>
      <p class="empty-sub">Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
      <router-link to="/" class="btn btn-primary">Mua Sắm Ngay</router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useCartStore } from '../../stores/cart';
import { useRouter } from 'vue-router';
import { formatVariantOptions } from '../../api/index.js';

const cartStore = useCartStore();
const router = useRouter();

onMounted(() => {
  cartStore.fetchCart();
});

const itemPrice = (item) => {
  return Number(item.currentPrice ?? item.priceAtAdded ?? item.price ?? 0);
};

const hasVariantOptions = (options) => {
  return Array.isArray(options) ? options.length > 0 : !!options;
};

const productInitial = (name) => {
  return (name || 'S').trim().charAt(0).toUpperCase();
};

const formatPrice = (price) => {
  return Math.round(Number(price) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const updateQty = (item, newQty) => {
  if (newQty < 1) return;
  cartStore.updateQuantity(item.id, newQty);
};
</script>

<style scoped>
.mt-4 { margin-top: 2rem; }
.cart-main {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}
.cart-items-section {
  flex: 1;
  background: var(--white);
  padding: 30px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.cart-summary-section {
  width: 380px;
  background: var(--white);
  padding: 30px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 100px;
}
.section-title {
  font-size: 24px;
  margin-bottom: 24px;
  color: var(--text-dark);
}
.cart-header {
  display: flex;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-light);
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.cart-item {
  display: flex;
  align-items: center;
  padding: 24px 0;
  border-bottom: 1px dashed var(--border-color);
  transition: var(--transition);
}
.cart-item:last-child {
  border-bottom: none;
}
.col-product { flex: 3; }
.col-price { flex: 1; text-align: center; font-weight: 500; }
.col-qty { flex: 1; display: flex; justify-content: center; }
.col-total { flex: 1; text-align: center; font-weight: 600; }
.col-action { width: 50px; text-align: center; }

.item-info {
  display: flex;
  gap: 16px;
}
.item-info img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
}
.image-placeholder {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: #EEF2F7;
  color: var(--text-light);
  font-weight: 700;
  font-size: 24px;
}
.item-info .details {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.item-info .name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-dark);
  margin-bottom: 6px;
  line-height: 1.4;
}
.item-info .variant {
  font-size: 13px;
  color: var(--text-light);
  background: var(--bg-color);
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  align-self: flex-start;
}
.item-total {
  color: var(--primary-color);
}
.quantity-selector {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.quantity-selector button {
  width: 32px;
  height: 32px;
  background: var(--bg-color);
  border: none;
  cursor: pointer;
  transition: var(--transition);
}
.quantity-selector button:hover {
  background: var(--border-color);
}
.quantity-selector input {
  width: 44px;
  height: 32px;
  text-align: center;
  border: none;
  border-left: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  font-family: inherit;
  font-weight: 500;
}
.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-light);
  padding: 8px;
  border-radius: 50%;
  transition: var(--transition);
}
.delete-btn:hover {
  color: #EF4444;
  background: #FEF2F2;
}

.summary-title {
  font-size: 18px;
  margin-bottom: 24px;
  color: var(--text-dark);
}
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  color: var(--text-color);
  font-size: 15px;
}
.total-row {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
  align-items: center;
}
.total-row span:first-child {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 16px;
}
.total-price {
  color: var(--primary-color);
  font-size: 28px;
  font-weight: 700;
}
.btn-checkout {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  margin-top: 30px;
  border-radius: var(--radius-md);
}

.empty-cart {
  text-align: center;
  background: var(--white);
  padding: 80px 20px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  max-width: 600px;
  margin: 40px auto;
}
.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}
.empty-msg {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 10px;
}
.empty-sub {
  color: var(--text-light);
  margin-bottom: 30px;
}
</style>
