<template>
  <div class="admin-categories">
    <div class="page-header">
      <div>
        <h1 class="page-title">Quản Lý Danh Mục &amp; Loại Sản Phẩm</h1>
      </div>
    </div>

    <div class="two-col">

      <div class="card">
        <div class="card-header">
          <h2>Danh Mục </h2>
          <button class="btn btn-primary btn-sm" @click="openCreateCat">+ Thêm</button>
        </div>

        <div class="loading-row" v-if="loadingCat">
          <div class="spinner"></div> Đang tải...
        </div>
        <div class="empty-row" v-else-if="productStore.categories.length === 0">Chưa có danh mục nào.</div>
        <table class="data-table" v-else>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th class="th-actions">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in productStore.categories" :key="cat.id">
              <td class="id-cell">#{{ cat.id }}</td>
              <td>{{ cat.name }}</td>
              <td class="actions-cell">
                <button class="icon-btn edit" @click="openEditCat(cat)" title="Sửa">
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-8.5 8.5A2 2 0 0 1 6.5 15.5H5a1 1 0 01-1-1v-1.5a2 2 0 0 1 .586-1.414l8.5-8.5z"/></svg>
                </button>
                <button class="icon-btn delete" @click="confirmDeleteCat(cat)" title="Xóa">
                  <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-3 7a1 1 0 112 0v5a1 1 0 11-2 0v-5zm4 0a1 1 0 112 0v5a1 1 0 11-2 0v-5z" clip-rule="evenodd"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Loại Sản Phẩm </h2>
          <button class="btn btn-primary btn-sm" @click="openCreateType">+ Thêm</button>
        </div>

        <div class="loading-row" v-if="loadingType">
          <div class="spinner"></div> Đang tải...
        </div>
        <div class="empty-row" v-else-if="productStore.productTypes.length === 0">Chưa có loại sản phẩm nào.</div>
        <table class="data-table" v-else>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Mô tả</th>
              <th class="th-actions">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pt in productStore.productTypes" :key="pt.id">
              <td class="id-cell">#{{ pt.id }}</td>
              <td>{{ pt.name }}</td>
              <td class="desc">{{ pt.description || '—' }}</td>
              <td class="actions-cell">
                <button class="icon-btn edit" @click="openEditType(pt)" title="Sửa">
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-8.5 8.5A2 2 0 0 1 6.5 15.5H5a1 1 0 01-1-1v-1.5a2 2 0 0 1 .586-1.414l8.5-8.5z"/></svg>
                </button>
                <button class="icon-btn delete" @click="confirmDeleteType(pt)" title="Xóa">
                  <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-3 7a1 1 0 112 0v5a1 1 0 11-2 0v-5zm4 0a1 1 0 112 0v5a1 1 0 11-2 0v-5z" clip-rule="evenodd"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="modal-overlay" v-if="showCatModal" @click.self="closeCatModal">
      <div class="modal">
        <h3>{{ editingCat ? 'Sửa Danh Mục' : 'Thêm Danh Mục' }}</h3>
        <div class="form-group">
          <label>Tên danh mục *</label>
          <input
            type="text"
            v-model="newCatName"
            placeholder="VD: Thời trang"
            @keyup.enter="submitCategory"
            autofocus
          />
        </div>
        <p class="error-msg" v-if="catError">{{ catError }}</p>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="closeCatModal">Hủy</button>
          <button
            class="btn btn-primary"
            @click="submitCategory"
            :disabled="submittingCat || !newCatName.trim()"
          >
            {{ submittingCat ? (editingCat ? 'Đang lưu...' : 'Đang thêm...') : (editingCat ? 'Lưu' : 'Thêm') }}
          </button>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="showTypeModal" @click.self="closeTypeModal">
      <div class="modal">
        <h3>{{ editingType ? 'Sửa Loại Sản Phẩm' : 'Thêm Loại Sản Phẩm' }}</h3>
        <div class="form-group">
          <label>Tên loại *</label>
          <input
            type="text"
            v-model="newTypeName"
            placeholder="VD: Điện tử"
            @keyup.enter="submitType"
            autofocus
          />
        </div>
        <div class="form-group">
          <label>Mô tả</label>
          <input type="text" v-model="newTypeDesc" placeholder="Tùy chọn" />
        </div>
        <p class="error-msg" v-if="typeError">{{ typeError }}</p>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="closeTypeModal">Hủy</button>
          <button
            class="btn btn-primary"
            @click="submitType"
            :disabled="submittingType || !newTypeName.trim()"
          >
            {{ submittingType ? (editingType ? 'Đang lưu...' : 'Đang thêm...') : (editingType ? 'Lưu' : 'Thêm') }}
          </button>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="deleteTarget" @click.self="deleteTarget = null">
      <div class="modal modal-confirm">
        <div class="confirm-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3>Xác nhận xóa</h3>
        <p class="confirm-msg">
          Bạn có chắc muốn xóa <strong>"{{ deleteTarget.name }}"</strong>?<br/>
          Hành động này không thể hoàn tác.
        </p>
        <p class="error-msg" v-if="deleteError">{{ deleteError }}</p>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="deleteTarget = null" :disabled="deleting">Hủy</button>
          <button class="btn btn-danger" @click="executeDelete" :disabled="deleting">
            {{ deleting ? 'Đang xóa...' : 'Xóa' }}
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

const showCatModal  = ref(false);
const editingCat    = ref(null);
const newCatName    = ref('');
const catError      = ref('');
const submittingCat = ref(false);

function openCreateCat() {
  editingCat.value  = null;
  newCatName.value  = '';
  catError.value    = '';
  showCatModal.value = true;
}
function openEditCat(cat) {
  editingCat.value  = cat;
  newCatName.value  = cat.name;
  catError.value    = '';
  showCatModal.value = true;
}
function closeCatModal() {
  showCatModal.value = false;
}

const submitCategory = async () => {
  catError.value = '';
  const name = newCatName.value.trim();
  if (!name) { catError.value = 'Tên không được để trống.'; return; }

  submittingCat.value = true;
  let res;
  if (editingCat.value) {
    res = await productStore.updateCategory(editingCat.value.id, name);
  } else {
    res = await productStore.createCategory(name);
  }
  submittingCat.value = false;

  if (res.success === false) {
    catError.value = res.message || (editingCat.value ? 'Cập nhật thất bại' : 'Thêm thất bại');
  } else {
    newCatName.value = '';
    showCatModal.value = false;
  }
};

const showTypeModal  = ref(false);
const editingType    = ref(null);
const newTypeName    = ref('');
const newTypeDesc    = ref('');
const typeError      = ref('');
const submittingType = ref(false);

function openCreateType() {
  editingType.value   = null;
  newTypeName.value   = '';
  newTypeDesc.value   = '';
  typeError.value     = '';
  showTypeModal.value = true;
}
function openEditType(pt) {
  editingType.value   = pt;
  newTypeName.value   = pt.name;
  newTypeDesc.value   = pt.description || '';
  typeError.value     = '';
  showTypeModal.value = true;
}
function closeTypeModal() {
  showTypeModal.value = false;
}

const submitType = async () => {
  typeError.value = '';
  const name = newTypeName.value.trim();
  if (!name) { typeError.value = 'Tên không được để trống.'; return; }

  submittingType.value = true;
  let res;
  if (editingType.value) {
    res = await productStore.updateProductType(editingType.value.id, name, newTypeDesc.value.trim() || null);
  } else {
    res = await productStore.createProductType(name, newTypeDesc.value.trim() || null);
  }
  submittingType.value = false;

  if (res.success === false) {
    typeError.value = res.message || (editingType.value ? 'Cập nhật thất bại' : 'Thêm thất bại');
  } else {
    newTypeName.value   = '';
    newTypeDesc.value   = '';
    showTypeModal.value = false;
  }
};

const deleteTarget = ref(null);
const deleteError  = ref('');
const deleting     = ref(false);

function confirmDeleteCat(cat) {
  deleteError.value  = '';
  deleteTarget.value = { ...cat, _type: 'cat' };
}
function confirmDeleteType(pt) {
  deleteError.value  = '';
  deleteTarget.value = { ...pt, _type: 'type' };
}

const executeDelete = async () => {
  if (!deleteTarget.value) return;
  deleteError.value = '';
  deleting.value = true;
  let res;
  if (deleteTarget.value._type === 'cat') {
    res = await productStore.deleteCategory(deleteTarget.value.id);
  } else {
    res = await productStore.deleteProductType(deleteTarget.value.id);
  }
  deleting.value = false;
  if (res.success === false) {
    deleteError.value = res.message || 'Xóa thất bại';
  } else {
    deleteTarget.value = null;
  }
};

onMounted(async () => {
  loadingCat.value  = true;
  loadingType.value = true;
  await Promise.all([
    productStore.fetchCategories().finally(() => loadingCat.value = false),
    productStore.fetchProductTypes().finally(() => loadingType.value = false),
  ]);
});
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
  padding: 11px 16px; border-top: 1px solid var(--border-color); color: var(--text-dark);
}
.data-table tr:hover td { background: #F9FAFB; }
.th-actions { width: 90px; text-align: center; }
.actions-cell { text-align: center; white-space: nowrap; }
.id-cell { color: var(--text-light); font-size: 13px; }
.desc { color: var(--text-light); font-size: 13px; }

.icon-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 6px;
  border: none; cursor: pointer; transition: background 0.15s, color 0.15s;
  background: transparent;
}
.icon-btn svg { width: 15px; height: 15px; }
.icon-btn.edit  { color: #6366F1; }
.icon-btn.edit:hover  { background: #EEF2FF; }
.icon-btn.delete { color: #EF4444; }
.icon-btn.delete:hover { background: #FEF2F2; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 200;
}
.modal {
  background: var(--white); border-radius: var(--radius-md);
  padding: 28px; min-width: 360px; box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  animation: fadeUp 0.2s ease;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
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

.modal-confirm { text-align: center; max-width: 380px; }
.confirm-icon {
  width: 52px; height: 52px; border-radius: 50%; background: #FEF2F2;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px; color: #EF4444;
}
.confirm-icon svg { width: 28px; height: 28px; }
.modal-confirm h3 { margin-bottom: 8px; }
.confirm-msg { font-size: 14px; color: var(--text-light); margin-bottom: 4px; line-height: 1.6; }
.confirm-msg strong { color: var(--text-dark); }

.btn-danger {
  padding: 9px 20px; border-radius: var(--radius-sm); border: none;
  background: #EF4444; color: #fff; font-weight: 600; cursor: pointer;
  transition: background 0.15s;
}
.btn-danger:hover:not(:disabled) { background: #DC2626; }
</style>
