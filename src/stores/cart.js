
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { cartApi, formatVariantOptions } from '../api/index.js';
import { useUserStore } from './user.js';

export const useCartStore = defineStore('cart', () => {
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);

  function getUserId() {
    const userStore = useUserStore();
    return userStore.currentUser?.id ?? null;
  }

  const totalCost = computed(() =>
    items.value.reduce((sum, item) => sum + (item.currentPrice ?? item.price ?? 0) * item.quantity, 0)
  );

  const cartItemsCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  );

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

  async function addItem(variant, product, quantity = 1) {
    const userId = getUserId();
    if (!userId) {
      const mockId = Date.now() + Math.random();
      items.value.push({
        id: mockId,
        productVariantId: variant.id,
        productName: product.name,
        productThumbnail: variant.imageUrl || product.thumbnailUrl || product.imageUrl,
        currentPrice: variant.price || product.basePrice,
        price: variant.price || product.basePrice,
        quantity: quantity,
        variantOptions: variant.variantOptions || null
      });
      alert('Đã thêm sản phẩm vào giỏ hàng (tạm thời)');
      return true;
    }

    loading.value = true;
    try {
      const res = await cartApi.addItem(variant.id, quantity);
      if (res.success) {
        await fetchCart();
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

  async function updateQuantity(itemId, quantity) {
    if (quantity < 1) return;
    const userId = getUserId();
    const item = items.value.find(i => i.id === itemId);
    if (!item || !userId) return;

    const oldQty = item.quantity;
    item.quantity = quantity;

    try {
      const res = await cartApi.updateItem(itemId, quantity);
      if (!res.success) {
        item.quantity = oldQty;
        alert(res.message || 'Cập nhật thất bại');
      }
    } catch (e) {
      item.quantity = oldQty;
      alert('Cập nhật số lượng thất bại: ' + e.message);
    }
  }

  async function removeItem(itemId) {
    const userId = getUserId();
    if (!userId) return;

    const backup = [...items.value];
    items.value = items.value.filter(i => i.id !== itemId);

    try {
      const res = await cartApi.removeItem(itemId);
      if (!res.success) {
        items.value = backup;
        alert(res.message || 'Xoá thất bại');
      }
    } catch (e) {
      items.value = backup;
      alert('Xoá sản phẩm thất bại: ' + e.message);
    }
  }

  function clearCartLocal() {
    items.value = [];
  }

  return {
    items, loading, error,
    totalCost, cartItemsCount,
    fetchCart, addItem, removeItem, updateQuantity, clearCartLocal,
    formatVariantOptions,
  };
});