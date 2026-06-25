import { authApi, userApi, addressApi, orderApi, shopApi } from '../api/index.js'
//bổ sung /login
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { users, addresses as mockAddresses, orders as mockOrders } from '../mock/data';
import { useShopStore } from './shop';


export const useUserStore = defineStore('user', () => {
  const savedUser = localStorage.getItem('user');
  const currentUser = ref(savedUser ? JSON.parse(savedUser) : null);
  const addresses = ref([...mockAddresses]); // Sao chép danh sách địa chỉ mẫu
  const orders = ref([...mockOrders]);       // Sao chép danh sách đơn hàng mẫu

  const isLoggedIn = computed(() => currentUser.value !== null);
  
  const userAddresses = computed(() => {
    if (!currentUser.value) return [];
    return addresses.value.filter(a => a.userId === currentUser.value.id);
  });

  const userOrders = computed(() => {
    if (!currentUser.value) return [];
    return orders.value.filter(o => o.userId === currentUser.value.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  });

  /**
   * 🛠️ HÀM ĐĂNG NHẬP ĐÃ SỬA THÀNH ASYNC ĐỂ KẾT NỐI API THẬT
   */
  //Sửa toàn bộ hàm login
  async function login(username, password) {
  try {
    const loginRes = await authApi.login(username, password)

    if (!loginRes.success) return false

    const userRes = await userApi.getByUsername(username)
    const user = userRes.data || userRes.user || userRes

    user.role = loginRes.role

    localStorage.setItem('userId', user.id)
    localStorage.setItem('userRole', loginRes.role)
    localStorage.setItem('user', JSON.stringify(user))

    currentUser.value = user
    return true
  } catch (error) {
    console.error('[Login]', error)
    return false
  }
}

  /**
   * 🛠️ HÀM ĐĂNG XUẤT - XOÁ SẠCH DẤU VẾT TOKEN
   */
  function logout() {
    currentUser.value = null;
    localStorage.removeItem('token'); // Xoá bỏ Token ra khỏi bộ nhớ trình duyệt khi thoát
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
  }

  // Quản lý địa chỉ (Address CRUD)
  function addAddress(addressData) {
    if (!currentUser.value) return;
    const newAddress = {
      id: Date.now(),
      userId: currentUser.value.id,
      ...addressData
    };
    addresses.value.push(newAddress);
    return newAddress;
  }

  // Quản lý Đơn hàng (Giữ nguyên logic của bạn)
  function createOrder(address, cartStoreItems, subtotal, shippingFee) {
    if (!currentUser.value) return null;
    
    const newOrder = {
      id: Date.now(),
      userId: currentUser.value.id,
      recipientName: address.fullName,
      recipientPhone: address.phoneNumber,
      shippingAddressId: address.id,
      subtotal,
      shippingFee,
      totalAmount: subtotal + shippingFee,
      createdAt: new Date().toISOString(),
      status: 'Chờ lấy hàng',
      shippingProvider: 'Shopee Express',
      trackingNumber: 'SPX' + Date.now(),
      items: cartStoreItems.map((item, idx) => ({
        id: Date.now() + idx,
        orderId: Date.now(),
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        priceAtPurchase: item.price,
        productName: item.productName,
        productThumbnail: item.productThumbnail,
        variantOptions: item.variantOptions
      }))
    };
    
    orders.value.push(newOrder);
    return newOrder;
  }

  // Đăng ký cửa hàng
  function registerShop(shopName) {
    if (!currentUser.value || currentUser.value.shopId) return;
    const shopStore = useShopStore();
    const newShopId = Date.now();
    shopStore.createShop({
      id: newShopId,
      name: shopName,
      userId: currentUser.value.id,
      shopStatus: 'active',
      avatarUrl: `https://picsum.photos/seed/shop${newShopId}/100/100`,
      ratingAverage: 5.0
    });
    currentUser.value.shopId = newShopId;
  }

  return {
    currentUser,
    addresses,
    orders,
    isLoggedIn,
    userAddresses,
    userOrders,
    login,
    logout,
    addAddress,
    createOrder,
    registerShop
  };
});