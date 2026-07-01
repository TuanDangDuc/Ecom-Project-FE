import { authApi, userApi, addressApi, orderApi, shopApi } from '../api/index.js'

import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useShopStore } from './shop';

export const useUserStore = defineStore('user', () => {

  localStorage.removeItem('user');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('token');

  const savedUser = sessionStorage.getItem('user');
  const currentUser = ref(savedUser ? JSON.parse(savedUser) : null);
  const addresses = ref([]);
  const orders = ref([]);

  const isLoggedIn = computed(() => currentUser.value !== null);

  const userAddresses = computed(() => addresses.value);
  const userOrders = computed(() => orders.value);

  async function fetchAddresses() {
    if (!currentUser.value) return;
    try {
      const res = await addressApi.getByUserId(currentUser.value.id);
      addresses.value = Array.isArray(res) ? res : (res?.data || []);
    } catch (err) {
      console.error('[fetchAddresses]', err);
    }
  }

  async function fetchOrders() {
    if (!currentUser.value) return;
    try {
      const res = await orderApi.getMyOrders();
      let orderList = Array.isArray(res) ? res : (res?.data || []);
      orders.value = orderList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      console.error('[fetchOrders]', err);
    }
  }

  async function login(username, password) {
  try {
    const loginRes = await authApi.login(username, password)

    if (!loginRes || loginRes.success === false) return false

    const userRes = await userApi.getByUsername(username)
    const user = userRes?.data || userRes?.user || userRes || {}

    user.role = loginRes.role

    try {
      const shopRes = await shopApi.getByUserId(user.id)
      const list = shopRes?.data || shopRes?.shops || shopRes?.result || []
      const shop = Array.isArray(list) ? list[0] : list
      if (shop && shop.id) {
        user.shopId = shop.id
      }
    } catch (_) {

    }

    sessionStorage.setItem('userId', user.id)
    sessionStorage.setItem('userRole', loginRes.role)
    sessionStorage.setItem('user', JSON.stringify(user))

    currentUser.value = user

      await fetchAddresses();
      await fetchOrders();

      return true
    } catch (error) {
      console.error('[Login]', error)
      return false
    }
  }

  function logout() {
    currentUser.value = null;
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('user');

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
  }

  async function addAddress(addressData) {
    if (!currentUser.value) return null;

    const payload = {
      userId: currentUser.value.id,
      ...addressData
    };

    try {
      const res = await addressApi.create(payload);
      if (res && res.success !== false) {
        await fetchAddresses();
        return res;
      }
    } catch (err) {
      console.error('[addAddress]', err);
    }
    return null;
  }

  async function createOrder(address, cartStoreItems, subtotal, shippingFee) {
    if (!currentUser.value) return null;

    const payload = {
      recipientName: address.fullName || address.recipientName || 'Khách hàng',
      recipientPhone: address.phoneNumber,
      note: 'Giao hàng',
      shippingAddressId: address.id,
      cartItemIds: cartStoreItems.map(item => item.id)
    };

    try {
      const res = await orderApi.placeOrder(payload);
      if (res && res.success !== false) {
        await fetchOrders();
        return res;
      }
    } catch (err) {
      console.error('[createOrder]', err);
    }
    return null;
  }

  async function registerShop(shopName, description = '', avatarUrl = '') {
    if (!currentUser.value || currentUser.value.shopId) return false;

    try {
      const payload = {
        name: shopName,
        description: description || 'Chào mừng đến với cửa hàng của tôi',
        avatarUrl: avatarUrl || `https://picsum.photos/seed/shop${Date.now()}/100/100`,
        userId: currentUser.value.id
      };

      const res = await shopApi.create(payload);
      if (res && res.success !== false) {
        currentUser.value.shopId = res?.data?.id || res.shop?.id || Date.now();
        sessionStorage.setItem('user', JSON.stringify(currentUser.value));
        return true;
      }
    } catch (err) {
      console.error('[registerShop]', err);
    }
    return false;
  }

  return {
    currentUser,
    addresses,
    orders,
    isLoggedIn,
    userAddresses,
    userOrders,
    fetchAddresses,
    fetchOrders,
    login,
    logout,
    addAddress,
    createOrder,
    registerShop
  };
});