import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { shops as mockShops, products as mockProducts, productVariants as mockVariants } from '../mock/data';

export const useShopStore = defineStore('shop', () => {
  const currentShop = ref(null);
  const shops = ref([...mockShops]);
  const products = ref([...mockProducts]);
  const variants = ref([...mockVariants]);

  function loadShop(userId) {
    const shop = shops.value.find(s => s.userId === userId);
    if (shop) {
      currentShop.value = shop;
    }
  }

  function createShop(shopData) {
    shops.value.push(shopData);
    currentShop.value = shopData;
  }

  function updateShop(shopData) {
    if (!currentShop.value) return;
    const index = shops.value.findIndex(s => s.id === shopData.id);
    if (index !== -1) {
      shops.value[index] = { ...shopData };
      currentShop.value = { ...shopData };
    }
  }

  const shopProducts = computed(() => {
    if (!currentShop.value) return [];
    return products.value.filter(p => p.shopId === currentShop.value.id);
  });

  function addProduct(productData, variantList) {
    if (!currentShop.value) return;

    const newProduct = {
      ...productData,
      id: Date.now(),
      shopId: currentShop.value.id,
      ratingAverage: 0
    };
    products.value.push(newProduct);

    variantList.forEach((v, idx) => {
      variants.value.push({
        ...v,
        id: Date.now() + idx + 1000,
        productId: newProduct.id
      });
    });
  }

  return { currentShop, products, variants, shopProducts, loadShop, createShop, updateShop, addProduct };
});
