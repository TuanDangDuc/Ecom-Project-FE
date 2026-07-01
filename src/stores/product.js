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

  const shopProducts  = ref([]);
  const loading       = ref(false);
  const error         = ref(null);

  function getShopId() {
    const userStore = useUserStore();
    return userStore.currentUser?.shopId ?? null;
  }

  async function fetchCategories() {
    try {
      const res = await categoryApi.getAll();

      if (Array.isArray(res)) {
        categories.value = res;
      } else {
        categories.value = res?.data ?? res?.categories ?? [];
      }
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

  async function updateCategory(id, name) {
    try {
      const res = await categoryApi.update(id, { name });
      if (res.success !== false) {
        await fetchCategories();
      }
      return res;
    } catch (e) {
      console.error('[Product] updateCategory:', e);
      return { success: false, message: e.message };
    }
  }

  async function deleteCategory(id) {
    try {
      const res = await categoryApi.delete(id);
      if (res.success !== false) {
        categories.value = categories.value.filter(c => c.id !== id);
      }
      return res;
    } catch (e) {
      console.error('[Product] deleteCategory:', e);
      return { success: false, message: e.message };
    }
  }

  async function fetchProductTypes() {
    try {
      const res = await productTypeApi.getAll();

      if (Array.isArray(res)) {
        productTypes.value = res;
      } else {
        productTypes.value = res?.data ?? res?.productTypes ?? res?.product_types ?? [];
      }
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

  async function updateProductType(id, name, description) {
    try {
      const res = await productTypeApi.update(id, { name, description });
      if (res.success !== false) {
        await fetchProductTypes();
      }
      return res;
    } catch (e) {
      console.error('[Product] updateProductType:', e);
      return { success: false, message: e.message };
    }
  }

  async function deleteProductType(id) {
    try {
      const res = await productTypeApi.delete(id);
      if (res.success !== false) {
        productTypes.value = productTypes.value.filter(t => t.id !== id);
      }
      return res;
    } catch (e) {
      console.error('[Product] deleteProductType:', e);
      return { success: false, message: e.message };
    }
  }

  async function fetchShopProducts() {
    const shopId = getShopId();
    if (!shopId) { shopProducts.value = []; return; }

    loading.value = true;
    error.value = null;
    try {
      const res = await productApi.getByShopId(shopId);

      if (Array.isArray(res)) {
        shopProducts.value = res;
      } else {
        shopProducts.value = res?.data ?? res?.products ?? [];
      }
    } catch (e) {
      error.value = e.message;
      console.error('[Product] fetchShopProducts:', e);
    } finally {
      loading.value = false;
    }
  }

  async function createProduct(productData, variantList) {
    const shopId = getShopId();
    if (!shopId) throw new Error('Chưa có shopId');

    loading.value = true;
    error.value = null;
    try {

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
      console.log('[createProduct] BE response:', productRes);

      if (productRes.success === false) {
        throw new Error(productRes.message || 'Tạo sản phẩm thất bại');
      }

      const newProductId =
        productRes?.data?.id ??
        productRes?.product?.id ??
        productRes?.id;

      if (!newProductId) throw new Error('Không lấy được ID sản phẩm mới từ BE');

      for (const v of variantList) {
        const varRes = await variantApi.create(newProductId, {
          options: v.options,
          price:   Number(v.price) || 0,
          stock:   Number(v.stock) || 0,
        });

        if (v.imageFiles && v.imageFiles.length > 0) {
          const variantId =
            varRes.data?.id ??
            varRes.variant?.id ??
            varRes.id;
          if (variantId) {
            const formData = new FormData();
            for (const file of v.imageFiles) {
              formData.append('images[]', file);
            }
            await productImageApi.addToVariant(variantId, formData);
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

  async function fetchVariants(productId) {
    const res = await variantApi.getByProductId(productId);
    return Array.isArray(res) ? res : (res?.data ?? []);
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
    updateCategory,
    deleteCategory,
    fetchProductTypes,
    createProductType,
    updateProductType,
    deleteProductType,
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
