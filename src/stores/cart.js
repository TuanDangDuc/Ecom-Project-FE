// src/stores/cart.js  —  Móc API thật (BE PHP + X-User-Id auth)
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { cartApi, formatVariantOptions } from '../api/index.js'; // <-- Đã sửa dòng này
import { useUserStore } from './user.js';

export const useCartStore = defineStore('cart', () => {
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // ── Helper lấy userId hiện tại ─────────────────────────────
  function getUserId() {
    const userStore = useUserStore();
    return userStore.currentUser?.id ?? null;
  }

  // ── Computed ────────────────────────────────────────────────
  // BE trả về `currentPrice` cho price hiện tại của variant
  const totalCost = computed(() =>
    items.value.reduce((sum, item) => sum + (item.currentPrice ?? item.price ?? 0) * item.quantity, 0)
  );

  const cartItemsCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  // ── Fetch giỏ hàng từ BE ────────────────────────────────────
  // Gọi khi: user vừa đăng nhập, hoặc vào trang Cart
  // Response: { success, cart: { id, userId, totalCost, items: [...] } }
  async function fetchCart() {
    const userId = getUserId();
    if (!userId) { items.value = []; return; }

    loading.value = true;
    error.value = null;
    try {
      const data = await cartApi.getCart();
      if (data.success && data.cart) {
        items.value = data.cart.items ?? [];
      }
    } catch (e) {
      error.value = e.message;
      console.error('[Cart] fetchCart:', e);
    } finally {
      loading.value = false;
    }
  }

  // ── Thêm sản phẩm ──────────────────────────────────────────
  // BE trả về { success, message } (không trả item) → phải refetch
  async function addItem(variant, product, quantity = 1) {
    const userId = getUserId();
    if (!userId) { alert('Vui lòng đăng nhập!'); return false; }

    loading.value = true;
    try {
      const res = await cartApi.addItem(variant.id, quantity);
      if (res.success) {
        await fetchCart(); // đồng bộ lại từ server
        return true;
      } else {
        alert(res.message || 'Thêm vào giỏ hàng thất bại');
        return false;
      }
    } catch (e) {
      alert('Thêm vào giỏ hàng thất bại: ' + e.message);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ── Cập nhật số lượng (optimistic update + rollback) ────────
  async function updateQuantity(itemId, quantity) {
    if (quantity < 1) return;
    const userId = getUserId();
    const item = items.value.find(i => i.id === itemId);
    if (!item || !userId) return;

    const oldQty = item.quantity;
    item.quantity = quantity; // cập nhật UI ngay

    try {
      const res = await cartApi.updateItem(userId, itemId, quantity);
      if (!res.success) {
        item.quantity = oldQty; // rollback
        alert(res.message || 'Cập nhật thất bại');
      }
    } catch (e) {
      item.quantity = oldQty; // rollback
      alert('Cập nhật số lượng thất bại: ' + e.message);
    }
  }

  // ── Xoá item (optimistic update + rollback) ─────────────────
  async function removeItem(itemId) {
    const userId = getUserId();
    if (!userId) return;

    const backup = [...items.value];
    items.value = items.value.filter(i => i.id !== itemId);

    try {
      const res = await cartApi.removeItem(userId, itemId);
      if (!res.success) {
        items.value = backup;
        alert(res.message || 'Xoá thất bại');
      }
    } catch (e) {
      items.value = backup;
      alert('Xoá sản phẩm thất bại: ' + e.message);
    }
  }

  // ── Xoá local (sau checkout, BE tự xoá cart items) ─────────
  function clearCartLocal() {
    items.value = [];
  }

  return {
    items, loading, error,
    totalCost, cartItemsCount,
    fetchCart, addItem, removeItem, updateQuantity, clearCartLocal,
    formatVariantOptions, // export để dùng trong template
  };
});