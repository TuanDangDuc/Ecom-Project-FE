<template>
  <div class="seller-products">
    <div class="header-section">
      <h2 class="title">Sản Phẩm Của Tôi</h2>
      <router-link to="/seller/products/add" class="btn btn-primary">+ Thêm Sản Phẩm</router-link>
    </div>

    <div class="loading-state" v-if="productStore.loading">
      <div class="spinner"></div>
      <span>Đang tải...</span>
    </div>

    <div class="empty-state" v-else-if="productsWithStats.length === 0">
      <p>Bạn chưa có sản phẩm nào.</p>
      <router-link to="/seller/products/add" class="btn btn-primary btn-sm">Thêm ngay</router-link>
    </div>

    <div class="products-table" v-else>
      <div class="table-header">
        <div class="col-product">Tên Sản Phẩm</div>
        <div class="col-price">Giá (thấp nhất)</div>
        <div class="col-stock">Tồn Kho</div>
        <div class="col-action">Thao Tác</div>
      </div>
      <div class="table-body">
        <div class="table-row" v-for="product in productsWithStats" :key="product.id">
          <div class="col-product item-info">
            <img :src="product.thumbnailUrl || 'https://placehold.co/50x50'" :alt="product.name">
            <div class="name">{{ product.name }}</div>
          </div>
          <div class="col-price">₫{{ formatPrice(product.minPrice) }}</div>
          <div class="col-stock">{{ product.totalStock }}</div>
          <div class="col-action">
            <button class="action-btn" @click="editProduct(product.id)">Sửa</button>
            <button class="action-btn delete" @click="confirmDelete(product)">Xóa</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="deletingProduct" @click.self="deletingProduct = null">
      <div class="modal">
        <h3>Xác nhận xóa</h3>
        <p>Bạn có chắc muốn xóa sản phẩm <strong>{{ deletingProduct.name }}</strong>?</p>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="deletingProduct = null">Hủy</button>
          <button class="btn btn-danger" @click="doDelete">Xóa</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '../../stores/product.js';

const router = useRouter();
const productStore = useProductStore();
const deletingProduct = ref(null);

onMounted(() => productStore.fetchShopProducts());

const formatPrice = (price) =>
  (price ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const productsWithStats = computed(() =>
  productStore.shopProducts.map(p => {
    const variants = p.variants ?? [];
    const minPrice   = variants.length > 0 ? Math.min(...variants.map(v => v.price ?? 0)) : (p.basePrice ?? 0);
    const totalStock = variants.reduce((s, v) => s + (v.stock ?? 0), 0);
    return { ...p, minPrice, totalStock };
  })
);

const editProduct   = (id) => router.push(`/seller/products/edit/${id}`);
const confirmDelete = (p)  => { deletingProduct.value = p; };
const doDelete = async () => {
  const res = await productStore.deleteProduct(deletingProduct.value.id);
  deletingProduct.value = null;
  if (!res.success) alert('Xóa thất bại: ' + res.message);
};
</script>

<style scoped>
.header-section {
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 20px; margin-bottom: 24px;
}
.title { font-size: 20px; color: var(--text-dark); }

.loading-state {
  display: flex; align-items: center; gap: 12px;
  padding: 40px; justify-content: center; color: var(--text-light);
}
.spinner {
  width: 24px; height: 24px; border: 3px solid var(--border-color);
  border-top-color: var(--primary-color); border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  text-align: center; padding: 60px 20px; color: var(--text-light);
}
.empty-state p { margin-bottom: 16px; }
.btn-sm { padding: 8px 20px; font-size: 14px; }

.products-table { width: 100%; }
.table-header {
  display: flex; padding: 16px;
  background: #F9FAFB; border: 1px solid var(--border-color);
  border-radius: var(--radius-sm); font-weight: 600;
  color: var(--text-dark); font-size: 14px;
}
.table-row {
  display: flex; align-items: center; padding: 16px;
  border-bottom: 1px solid var(--border-color);
}
.col-product { flex: 3; }
.col-price { flex: 1; text-align: right; padding-right: 20px; }
.col-stock { flex: 1; text-align: center; }
.col-action { flex: 1; text-align: right; }
.item-info { display: flex; align-items: center; gap: 16px; }
.item-info img {
  width: 50px; height: 50px; border-radius: var(--radius-sm);
  object-fit: cover; border: 1px solid var(--border-color);
}
.item-info .name {
  font-weight: 500; color: var(--text-dark);
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.action-btn {
  background: none; border: none; color: #2563EB;
  cursor: pointer; font-size: 14px; margin-left: 12px;
}
.action-btn:hover { text-decoration: underline; }
.action-btn.delete { color: #EF4444; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 200;
}
.modal {
  background: var(--white); border-radius: var(--radius-md);
  padding: 28px; min-width: 320px; box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}
.modal h3 { margin-bottom: 12px; color: var(--text-dark); }
.modal p { color: var(--text-light); margin-bottom: 0; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }
.btn-danger { background: #EF4444; color: #fff; border: none; padding: 8px 20px; border-radius: var(--radius-sm); cursor: pointer; }
.btn-danger:hover { background: #DC2626; }
</style>
