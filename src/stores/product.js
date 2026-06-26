import { ref } from 'vue';
import { defineStore } from 'pinia';
import {
  productApi,
  variantApi,
  categoryApi,
  productTypeApi,
  productImageApi,
} from '../api/index.js';
import { useUserStore } from './user.js';

export const useProductStore = defineStore('product', () => {
  const categories    = ref([]);
  const productTypes  = ref([]);

  // Danh sách sản phẩm của shop hiện tại (seller)
  const shopProducts  = ref([]);
  const loading       = ref(false);
  const error         = ref(null);

  // ── helpers ─────────────────────────────────────────────────
  function getShopId() {
    const userStore = useUserStore();
    return userStore.currentUser?.shopId ?? null;
  }

  // ── Categories ───────────────────────────────────────────────
  async function fetchCategories() {
    try {
      const res = await categoryApi.getAll();
      // BE trả về array hoặc { data: [...] }
      categories.value = Array.isArray(res) ? res : (res.data ?? []);
    } catch (e) {
      console.error('[Product] fetchCategories:', e);
    }
  }

  async function createCategory(name) {
    const res = await categoryApi.create({ name });
    if (res.success !== false) {
      await fetchCategories();
    }
    return res;
  }

  // ── Product Types ────────────────────────────────────────────
  async function fetchProductTypes() {
    try {
      const res = await productTypeApi.getAll();
      productTypes.value = Array.isArray(res) ? res : (res.data ?? []);
    } catch (e) {
      console.error('[Product] fetchProductTypes:', e);
    }
  }

  async function createProductType(name, description) {
    const res = await productTypeApi.create({ name, description });
    if (res.success !== false) {
      await fetchProductTypes();
    }
    return res;
  }

  // ── Products (seller) ────────────────────────────────────────
  async function fetchShopProducts() {
    const shopId = getShopId();
    if (!shopId) { shopProducts.value = []; return; }

    loading.value = true;
    error.value = null;
    try {
      const res = await productApi.getByShopId(shopId);
      // BE: array hoặc { data: [...] }
      shopProducts.value = Array.isArray(res) ? res : (res.data ?? []);
    } catch (e) {
      error.value = e.message;
      console.error('[Product] fetchShopProducts:', e);
    } finally {
      loading.value = false;
    }
  }

  // Tạo sản phẩm → tạo variants → (tùy chọn) upload ảnh cho từng variant
  async function createProduct(productData, variantList) {
    const shopId = getShopId();
    if (!shopId) throw new Error('Chưa có shopId');

    loading.value = true;
    error.value = null;
    try {
      // 1. Tạo product
      const payload = {
        name:          productData.name,
        description:   productData.description ?? null,
        thumbnailUrl:  productData.thumbnailUrl ?? null,
        basePrice:     Number(productData.basePrice) || 0,
        categoryId:    productData.categoryId ? Number(productData.categoryId) : null,
        typeId:        productData.typeId     ? Number(productData.typeId)     : null,
        ratingAverage: 0,
        shopId,
      };
      const productRes = await productApi.create(payload);
      if (!productRes.success && productRes.success !== undefined) {
        throw new Error(productRes.message || 'Tạo sản phẩm thất bại');
      }

      const newProductId =
        productRes.data?.id ??
        productRes.product?.id ??
        productRes.id;

      if (!newProductId) throw new Error('Không lấy được ID sản phẩm mới');

      // 2. Tạo từng variant
      for (const v of variantList) {
        const varRes = await variantApi.create(newProductId, {
          options: v.options,
          price:   Number(v.price) || 0,
          stock:   Number(v.stock) || 0,
        });

        // 3. Upload ảnh cho variant (nếu có)
        if (v.imageUrls && v.imageUrls.length > 0) {
          const variantId =
            varRes.data?.id ??
            varRes.variant?.id ??
            varRes.id;
          if (variantId) {
            for (let i = 0; i < v.imageUrls.length; i++) {
              await productImageApi.addToVariant(variantId, {
                url:        v.imageUrls[i],
                imageOrder: i,
              });
            }
          }
        }
      }

      await fetchShopProducts();
      return { success: true };
    } catch (e) {
      error.value = e.message;
      console.error('[Product] createProduct:', e);
      return { success: false, message: e.message };
    } finally {
      loading.value = false;
    }
  }

  async function updateProduct(productId, productData) {
    loading.value = true;
    try {
      const res = await productApi.update(productId, productData);
      if (res.success !== false) {
        await fetchShopProducts();
      }
      return res;
    } catch (e) {
      console.error('[Product] updateProduct:', e);
      return { success: false, message: e.message };
    } finally {
      loading.value = false;
    }
  }

  async function deleteProduct(productId) {
    loading.value = true;
    try {
      const res = await productApi.delete(productId);
      if (res.success !== false) {
        shopProducts.value = shopProducts.value.filter(p => p.id !== productId);
      }
      return res;
    } catch (e) {
      console.error('[Product] deleteProduct:', e);
      return { success: false, message: e.message };
    } finally {
      loading.value = false;
    }
  }

  // ── Variants ─────────────────────────────────────────────────
  async function fetchVariants(productId) {
    const res = await variantApi.getByProductId(productId);
    return Array.isArray(res) ? res : (res.data ?? []);
  }

  async function addVariant(productId, variantData) {
    return await variantApi.create(productId, variantData);
  }

  async function updateVariant(variantId, variantData) {
    return await variantApi.update(variantId, variantData);
  }

  async function deleteVariant(variantId) {
    return await variantApi.delete(variantId);
  }

  // ── Product Images ───────────────────────────────────────────
  async function addImageToVariant(variantId, url, imageOrder = 0) {
    return await productImageApi.addToVariant(variantId, { url, imageOrder });
  }

  async function deleteImage(imageId) {
    return await productImageApi.delete(imageId);
  }

  return {
    categories,
    productTypes,
    shopProducts,
    loading,
    error,
    fetchCategories,
    createCategory,
    fetchProductTypes,
    createProductType,
    fetchShopProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchVariants,
    addVariant,
    updateVariant,
    deleteVariant,
    addImageToVariant,
    deleteImage,
  };
});
