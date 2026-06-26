<template>
  <div class="admin-categories">
    <div class="page-header">
      <div>
        <h1 class="page-title">Quản Lý Danh Mục & Loại Sản Phẩm</h1>
        <p class="subtitle">Thêm, xem các danh mục và loại sản phẩm trên hệ thống</p>
      </div>
    </div>

    <div class="two-col">
      <!-- CATEGORIES -->
      <div class="card">
        <div class="card-header">
          <h2>Danh Mục (Category)</h2>
          <button class="btn btn-primary btn-sm" @click="showCatModal = true">+ Thêm</button>
        </div>

        <div class="loading-row" v-if="loadingCat">
          <div class="spinner"></div> Đang tải...
        </div>
        <div class="empty-row" v-else-if="productStore.categories.length === 0">Chưa có danh mục nào.</div>
        <table class="data-table" v-else>
          <thead><tr><th>ID</th><th>Tên</th></tr></thead>
          <tbody>
            <tr v-for="cat in productStore.categories" :key="cat.id">
              <td>#{{ cat.id }}</td>
              <td>{{ cat.name }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PRODUCT TYPES -->
      <div class="card">
        <div class="card-header">
          <h2>Loại Sản Phẩm (ProductType)</h2>
          <button class="btn btn-primary btn-sm" @click="showTypeModal = true">+ Thêm</button>
        </div>

        <div class="loading-row" v-if="loadingType">
          <div class="spinner"></div> Đang tải...
        </div>
        <div class="empty-row" v-else-if="productStore.productTypes.length === 0">Chưa có loại sản phẩm nào.</div>
        <table class="data-table" v-else>
          <thead><tr><th>ID</th><th>Tên</th><th>Mô tả</th></tr></thead>
          <tbody>
            <tr v-for="pt in productStore.productTypes" :key="pt.id">
              <td>#{{ pt.id }}</td>
              <td>{{ pt.name }}</td>
              <td class="desc">{{ pt.description || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: thêm Category -->
    <div class="modal-overlay" v-if="showCatModal" @click.self="showCatModal = false">
      <div class="modal">
        <h3>Thêm Danh Mục</h3>
        <div class="form-group">
          <label>Tên danh mục *</label>
          <input type="text" v-model="newCatName" placeholder="VD: Thời trang" @keyup.enter="submitCategory" autofocus />
        </div>
        <p class="error-msg" v-if="catError">{{ catError }}</p>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showCatModal = false">Hủy</button>
          <button class="btn btn-primary" @click="submitCategory" :disabled="submittingCat || !newCatName.trim()">
            {{ submittingCat ? 'Đang thêm...' : 'Thêm' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: thêm ProductType -->
    <div class="modal-overlay" v-if="showTypeModal" @click.self="showTypeModal = false">
      <div class="modal">
        <h3>Thêm Loại Sản Phẩm</h3>
        <div class="form-group">
          <label>Tên loại *</label>
          <input type="text" v-model="newTypeName" placeholder="VD: Điện tử" @keyup.enter="submitType" autofocus />
        </div>
        <div class="form-group">
          <label>Mô tả</label>
          <input type="text" v-model="newTypeDesc" placeholder="Tùy chọn" />
        </div>
        <p class="error-msg" v-if="typeError">{{ typeError }}</p>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showTypeModal = false">Hủy</button>
          <button class="btn btn-primary" @click="submitType" :disabled="submittingType || !newTypeName.trim()">
            {{ submittingType ? 'Đang thêm...' : 'Thêm' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useProductStore } from '../../stores/product.js';

const productStore = useProductStore();

const loadingCat  = ref(false);
const loadingType = ref(false);

// Category modal
const showCatModal  = ref(false);
const newCatName    = ref('');
const catError      = ref('');
const submittingCat = ref(false);

// Type modal
const showTypeModal  = ref(false);
const newTypeName    = ref('');
const newTypeDesc    = ref('');
const typeError      = ref('');
const submittingType = ref(false);

onMounted(async () => {
  loadingCat.value  = true;
  loadingType.value = true;
  await Promise.all([
    productStore.fetchCategories().finally(() => loadingCat.value = false),
    productStore.fetchProductTypes().finally(() => loadingType.value = false),
  ]);
});

const submitCategory = async () => {
  catError.value = '';
  const name = newCatName.value.trim();
  if (!name) { catError.value = 'Tên không được để trống.'; return; }
  submittingCat.value = true;
  const res = await productStore.createCategory(name);
  submittingCat.value = false;
  if (res.success === false) {
    catError.value = res.message || 'Thêm thất bại';
  } else {
    newCatName.value = '';
    showCatModal.value = false;
  }
};

const submitType = async () => {
  typeError.value = '';
  const name = newTypeName.value.trim();
  if (!name) { typeError.value = 'Tên không được để trống.'; return; }
  submittingType.value = true;
  const res = await productStore.createProductType(name, newTypeDesc.value.trim() || null);
  submittingType.value = false;
  if (res.success === false) {
    typeError.value = res.message || 'Thêm thất bại';
  } else {
    newTypeName.value = '';
    newTypeDesc.value = '';
    showTypeModal.value = false;
  }
};
</script>

<style scoped>
.page-header { margin-bottom: 28px; }
.page-title  { font-size: 26px; color: var(--text-dark); margin-bottom: 6px; }
.subtitle    { color: var(--text-light); }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
@media (max-width: 860px) { .two-col { grid-template-columns: 1fr; } }

.card {
  background: var(--white); border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm); overflow: hidden;
}
.card-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 20px; border-bottom: 1px solid var(--border-color);
}
.card-header h2 { font-size: 15px; color: var(--text-dark); }
.btn-sm { padding: 6px 14px; font-size: 13px; }

.loading-row, .empty-row {
  display: flex; align-items: center; gap: 10px;
  padding: 30px 20px; color: var(--text-light); font-size: 14px;
}
.spinner {
  width: 18px; height: 18px; border: 2px solid var(--border-color);
  border-top-color: var(--primary-color); border-radius: 50%;
  animation: spin 0.7s linear infinite; flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th {
  text-align: left; padding: 10px 16px;
  background: #F9FAFB; color: var(--text-dark);
  font-weight: 600; font-size: 13px;
}
.data-table td {
  padding: 12px 16px; border-top: 1px solid var(--border-color); color: var(--text-dark);
}
.data-table tr:hover td { background: #F9FAFB; }
.desc { color: var(--text-light); font-size: 13px; }

/* Modals */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 200;
}
.modal {
  background: var(--white); border-radius: var(--radius-md);
  padding: 28px; min-width: 360px; box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}
.modal h3 { font-size: 18px; margin-bottom: 20px; color: var(--text-dark); }
.form-group { margin-bottom: 14px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; }
.form-group input {
  width: 100%; padding: 9px 12px; border: 1px solid var(--border-color);
  border-radius: var(--radius-sm); box-sizing: border-box; font-size: 14px;
}
.form-group input:focus { outline: none; border-color: var(--primary-color); }
.error-msg { color: #EF4444; font-size: 13px; margin-bottom: 8px; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
