<template>
  <div class="checkout-view container mt-4">
    <div class="checkout-layout">
      <div class="checkout-main">

        <div class="section-card address-section">
          <div class="section-header">
            <h3 class="section-title">Thông Tin Giao Hàng</h3>
            <router-link to="/profile/addresses" class="btn btn-outline btn-sm">Thay đổi</router-link>
          </div>
          <div class="address-box loading" v-if="isLoadingAddresses">
            Đang tải địa chỉ giao hàng...
          </div>
          <div class="address-box" v-else-if="defaultAddress">
            <div class="user-info">
              <span class="name">{{ recipientName }}</span>
              <span class="phone">{{ defaultAddress.phoneNumber }}</span>
            </div>
            <div class="address-detail">
              <span class="badge-default">{{ addressTypeLabel(defaultAddress.addressType) }}</span>
              <span>{{ shippingAddressText }}</span>
            </div>
          </div>
          <div class="address-box empty" v-else>
            Bạn chưa có địa chỉ giao hàng. Vui lòng
            <router-link to="/profile/addresses">thêm địa chỉ</router-link>.
          </div>
        </div>

        <div class="section-card">
          <h3 class="section-title">Ghi chú đơn hàng</h3>
          <textarea
            v-model="orderNote"
            class="note-input"
            rows="3"
            placeholder="Ghi chú cho người bán (không bắt buộc)..."
          ></textarea>
        </div>

        <div class="section-card order-section">
          <h3 class="section-title">Sản Phẩm Đã Chọn</h3>
          <div class="order-items">
            <div class="cart-item" v-for="item in cartStore.items" :key="item.id">
              <div class="item-image">
                <img v-if="item.productThumbnail" :src="item.productThumbnail" :alt="item.productName">
                <div v-else class="image-placeholder">{{ productInitial(item.productName) }}</div>
              </div>
              <div class="item-details">
                <div class="name">{{ item.productName || 'Sản phẩm' }}</div>
                <div class="variant" v-if="hasVariantOptions(item.variantOptions)">
                  Loại: {{ formatVariantOptions(item.variantOptions) }}
                </div>
              </div>
              <div class="item-price-qty">
                <div class="price">₫{{ formatPrice(itemPrice(item)) }}</div>
                <div class="qty">x{{ item.quantity }}</div>
              </div>
              <div class="item-total">₫{{ formatPrice(itemPrice(item) * item.quantity) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="checkout-sidebar">
        <div class="section-card payment-section">
          <h3 class="section-title">Tóm Tắt Đơn Hàng</h3>
          <div class="summary-list">
            <div class="summary-row">
              <span>Tạm tính</span>
              <span>₫{{ formatPrice(cartStore.totalCost) }}</span>
            </div>
            <div class="summary-row">
              <span>Phí vận chuyển</span>

              <span v-if="cartStore.totalCost > 500000" class="discount">Miễn phí</span>
              <span v-else>₫30.000</span>
            </div>
            <div class="summary-row total-row">
              <span>Tổng cộng</span>
              <span class="final-price">₫{{ formatPrice(estimatedTotal) }}</span>
            </div>
          </div>
          <button
            class="btn btn-primary btn-place-order"
            @click="placeOrder"
            :disabled="isLoadingAddresses || !defaultAddress || cartStore.items.length === 0 || isOrdering"
          >
            {{ isOrdering ? 'Đang xử lý...' : 'Hoàn Tất Đặt Hàng' }}
          </button>
          <p class="secure-checkout-text">🔒 Thanh toán an toàn và bảo mật</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useCartStore } from '../../stores/cart';
import { useUserStore } from '../../stores/user';
import { useRouter } from 'vue-router';
import { addressApi, orderApi, formatVariantOptions } from '../../api/index.js';

const cartStore = useCartStore();
const userStore = useUserStore();
const router = useRouter();

const isOrdering = ref(false);
const isLoadingAddresses = ref(false);
const orderNote = ref('');
const addresses = ref([]);

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    alert('Vui lòng đăng nhập để tiếp tục thanh toán!');
    router.push('/login');
    return;
  }

  if (cartStore.items.length === 0) {
    await cartStore.fetchCart();
  }
  await fetchAddresses();
});

const defaultAddress = computed(() =>
  addresses.value.find(a => a.isDefault) || addresses.value[0] || null
);

const recipientName = computed(() =>
  defaultAddress.value?.fullName ||
  userStore.currentUser?.fullName ||
  userStore.currentUser?.username ||
  'Khach hang'
);

const shippingAddressText = computed(() => {
  if (!defaultAddress.value) return '';
  return [
    defaultAddress.value.specificAddress,
    defaultAddress.value.ward,
    defaultAddress.value.district,
    defaultAddress.value.province,
  ].filter(Boolean).join(', ');
});

const fetchAddresses = async () => {
  const userId = userStore.currentUser?.id;
  if (!userId) {
    addresses.value = [];
    return;
  }

  try {
    isLoadingAddresses.value = true;
    const res = await addressApi.getByUserId(userId);
    const list = res?.data || res.addresses || res?.result || [];
    addresses.value = Array.isArray(list) ? list : [];
  } catch (e) {
    console.error('[Checkout] fetchAddresses:', e);
    addresses.value = [];
  } finally {
    isLoadingAddresses.value = false;
  }
};

const estimatedTotal = computed(() => {
  const shipping = cartStore.totalCost > 500000 ? 0 : 30000;
  return cartStore.totalCost + shipping;
});

const formatPrice = (price) => {
  if (!price && price !== 0) return '0';
  return Math.round(Number(price) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const itemPrice = (item) => {
  return Number(item.currentPrice ?? item.priceAtAdded ?? item.price ?? 0);
};

const hasVariantOptions = (options) => {
  return Array.isArray(options) ? options.length > 0 : !!options;
};

const productInitial = (name) => {
  return (name || 'S').trim().charAt(0).toUpperCase();
};

const addressTypeLabel = (type) => {
  const labels = {
    HOME: 'Nhà riêng',
    OFFICE: 'Văn phòng',
  };
  return labels[type] || type || 'Địa chỉ';
};

const placeOrder = async () => {
  if (cartStore.items.length === 0) {
    alert('Giỏ hàng trống!');
    return;
  }
  if (!defaultAddress.value) {
    alert('Vui lòng thêm địa chỉ giao hàng!');
    return;
  }

  isOrdering.value = true;
  try {

    const res = await orderApi.placeOrder({
      recipientName: recipientName.value,
      recipientPhone: defaultAddress.value.phoneNumber,
      note: orderNote.value,
      shippingAddressId: defaultAddress.value.id,
      cartItemIds: cartStore.items.map(i => i.id),
    });

    if (res.success) {
      cartStore.clearCartLocal();
      alert(`Đặt hàng thành công! Mã đơn: ${res.orderCode}`);
      router.push('/profile/orders');
    } else {
      alert('Đặt hàng thất bại: ' + res.message);
    }
  } catch (e) {
    alert('Đặt hàng thất bại: ' + e.message);
  } finally {
    isOrdering.value = false;
  }
};
</script>

<style scoped>
.mt-4 { margin-top: 2rem; }
.checkout-layout { display: flex; gap: 30px; align-items: flex-start; }
.checkout-main { flex: 1; display: flex; flex-direction: column; gap: 20px; }
.checkout-sidebar { width: 400px; position: sticky; top: 100px; }
.section-card { background: var(--white); padding: 30px; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-title { font-size: 20px; color: var(--text-dark); margin-bottom: 16px; }
.btn-sm { padding: 6px 12px; font-size: 13px; border-radius: 99px; }
.note-input {
  width: 100%; padding: 12px 14px; box-sizing: border-box;
  border: 1.5px solid var(--border-color); border-radius: var(--radius-md);
  font-family: inherit; font-size: 14px; resize: vertical; outline: none;
}
.note-input:focus { border-color: var(--primary-color); }
.address-box { background: #F9FAFB; border: 1px solid var(--border-color); padding: 20px; border-radius: var(--radius-md); }
.address-box.loading { color: var(--text-light); text-align: center; }
.address-box.empty { color: #EF4444; text-align: center; background: #FEF2F2; border-color: #FCA5A5; }
.address-box.empty a { font-weight: bold; text-decoration: underline; }
.user-info { margin-bottom: 10px; font-size: 16px; }
.user-info .name { font-weight: 600; color: var(--text-dark); margin-right: 12px; }
.user-info .phone { color: var(--text-color); }
.address-detail { color: var(--text-color); line-height: 1.5; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.badge-default { background: rgba(16,185,129,0.1); color: var(--success); padding: 4px 8px; font-size: 12px; font-weight: 600; border-radius: 4px; }
.order-items { display: flex; flex-direction: column; }
.cart-item { display: flex; align-items: center; padding: 20px 0; border-bottom: 1px solid var(--border-color); }
.cart-item:last-child { border-bottom: none; padding-bottom: 0; }
.item-image { width: 64px; height: 64px; border-radius: var(--radius-sm); overflow: hidden; margin-right: 16px; }
.item-image img { width: 100%; height: 100%; object-fit: cover; }
.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #EEF2F7;
  color: var(--text-light);
  font-weight: 700;
  font-size: 20px;
}
.item-details { flex: 1; }
.item-details .name { font-size: 15px; font-weight: 500; color: var(--text-dark); margin-bottom: 4px; }
.item-details .variant { font-size: 13px; color: var(--text-light); }
.item-price-qty { text-align: right; margin-right: 30px; }
.item-price-qty .price { font-weight: 500; color: var(--text-dark); }
.item-price-qty .qty { font-size: 13px; color: var(--text-light); }
.item-total { width: 100px; text-align: right; font-weight: 600; color: var(--primary-color); }
.summary-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.summary-row { display: flex; justify-content: space-between; color: var(--text-color); font-size: 15px; }
.discount { color: var(--success); }
.total-row { align-items: center; margin-top: 8px; padding-top: 24px; border-top: 1px solid var(--border-color); }
.total-row span:first-child { font-weight: 600; color: var(--text-dark); font-size: 16px; }
.final-price { font-size: 32px; color: var(--primary-color); font-weight: 800; }
.btn-place-order { width: 100%; padding: 16px; font-size: 16px; border-radius: var(--radius-md); }
.btn-place-order:disabled { background: var(--border-color); cursor: not-allowed; }
.secure-checkout-text { text-align: center; margin-top: 16px; font-size: 13px; color: var(--text-light); }
</style>
