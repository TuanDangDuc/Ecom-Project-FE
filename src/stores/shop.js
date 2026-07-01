import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { shopApi, productApi, variantApi } from '../api/index.js';

export const useShopStore = defineStore('shop', () => {
  const currentShop = ref(null);
  const shops = ref([]);
  const products = ref([]);
  const variants = ref([]);

  async function loadShop(userId) {
    try {
      const res = await shopApi.getByUserId(userId);
      let list = Array.isArray(res) ? res : (res?.data || []);
      if (list.length > 0) {
        currentShop.value = list[0];
      } else {
        currentShop.value = null;
      }
    } catch (err) {
      console.error('[loadShop]', err);
    }
  }

  async function createShop(shopData) {
    try {
      const res = await shopApi.create(shopData);
      if (res && res.success !== false) {

        await loadShop(shopData.userId);
      }
    } catch (err) {
      console.error('[createShop]', err);
    }
  }

  async function updateShop(shopData) {
    if (!currentShop.value) return;
    try {
      const res = await shopApi.update(shopData);
      if (res && res.success !== false) {
        await loadShop(currentShop.value.userId);
      }
    } catch (err) {
      console.error('[updateShop]', err);
    }
  }

  const shopProducts = computed(() => {
    if (!currentShop.value) return [];
    return products.value.filter(p => p.shopId === currentShop.value.id);
  });

  async function fetchShopProducts() {
    if (!currentShop.value) return;
    try {
      const res = await productApi.getByShopId(currentShop.value.id);
      products.value = Array.isArray(res) ? res : (res?.data || []);
    } catch (err) {
      console.error('[fetchShopProducts]', err);
    }
  }

  async function addProduct(productData, variantList) {
    if (!currentShop.value) return;

    try {
      const payload = {
        name: productData.name,
        description: productData.description || '',
        thumbnailUrl: productData.thumbnailUrl || '',
        basePrice: Number(productData.basePrice) || 0,
        categoryId: productData.categoryId ? Number(productData.categoryId) : null,
        typeId: productData.typeId ? Number(productData.typeId) : null,
        ratingAverage: 0,
        shopId: currentShop.value.id
      };

      const productRes = await productApi.create(payload);
      if (productRes && productRes.success !== false) {
        const newProductId = productRes.data?.id || productRes.product?.id || productRes.id;
        if (newProductId) {
           for (const v of variantList) {
              await variantApi.create(newProductId, {
                options: v.options,
                price: Number(v.price) || 0,
                stock: Number(v.stock) || 0
              });
           }
        }
        await fetchShopProducts();
      }
    } catch (err) {
      console.error('[addProduct]', err);
    }
  }

  return { currentShop, products, variants, shopProducts, loadShop, createShop, updateShop, addProduct, fetchShopProducts };
});
