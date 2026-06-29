<template>
  <div class="product-form-view">
    <div class="header-section">
      <h2 class="title">{{ isEditMode ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới' }}</h2>
      <button class="btn btn-outline" @click="router.back()">Trở lại</button>
    </div>

    <!-- Loading overlay -->
    <div class="loading-overlay" v-if="productStore.loading">
      <div class="spinner"></div>
      <p>Đang xử lý...</p>
    </div>

    <form @submit.prevent="handleSubmit">
      <!-- SECTION 1: Thông tin cơ bản -->
      <div class="form-section">
        <h3>1. Thông tin cơ bản</h3>

        <div class="form-group">
          <label>Tên sản phẩm *</label>
          <input type="text" v-model="product.name" required placeholder="Nhập tên sản phẩm..." />
        </div>

        <div class="form-group">
          <label>Mô tả sản phẩm</label>
          <textarea v-model="product.description" rows="4" placeholder="Mô tả chi tiết..."></textarea>
        </div>

        <div class="form-row">
          <!-- Danh mục -->
          <div class="form-group">
            <label>Danh mục *</label>
            <SearchableSelect 
              v-model="product.categoryId" 
              :options="productStore.categories" 
              placeholder="-- Chọn danh mục --" 
            />
          </div>

          <!-- Loại sản phẩm -->
          <div class="form-group">
            <label>Loại sản phẩm</label>
            <SearchableSelect 
              v-model="product.typeId" 
              :options="productStore.productTypes" 
              placeholder="-- Không chọn --" 
            />
          </div>

          <!-- Giá cơ bản -->
          <div class="form-group">
            <label>Giá cơ bản (VND) *</label>
            <input type="number" v-model="product.basePrice" required min="0" placeholder="0" />
          </div>
        </div>

        <!-- Thumbnail -->
        <div class="form-group">
          <label>Ảnh đại diện sản phẩm</label>
          <div class="image-upload-zone" @click="!isUploading && triggerThumbInput()" :class="{ 'has-image': product.thumbnailUrl, 'uploading': isUploading }">
            <!-- Đang upload -->
            <div class="upload-loading" v-if="isUploading">
              <div class="upload-spinner"></div>
              <p>Đang tải ảnh lên...</p>
            </div>
            <img :src="product.thumbnailUrl" alt="Preview" v-else-if="product.thumbnailUrl" class="thumb-preview">
            <div class="upload-placeholder" v-else>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              <p>Bấm để chọn ảnh</p>
              <span>JPEG, PNG, WebP · Tối đa 5 MB</span>
            </div>
            <div class="upload-overlay" v-if="product.thumbnailUrl && !isUploading"><span>Đổi ảnh</span></div>
          </div>
          <input ref="thumbInputRef" type="file" accept="image/jpeg,image/png,image/webp" style="display:none" @change="onThumbChange">

        </div>
      </div>

      <!-- SECTION 2: Biến thể -->
      <div class="form-section">
        <h3>2. Phân loại hàng (Biến thể)</h3>
        <p class="subtitle">Thêm ít nhất 1 phân loại để bán (ví dụ: Trắng – Size M)</p>

        <div class="variants-list">
          <div class="variant-item" v-for="(v, idx) in variants" :key="idx">
            <div class="variant-header">
              <span class="variant-label">Biến thể #{{ idx + 1 }}</span>
              <button type="button" class="btn-remove" @click="removeVariant(idx)" v-if="variants.length > 1">✕ Xóa</button>
            </div>
            <div class="variant-fields">
              <div class="form-group">
                <label>Tên phân loại *</label>
                <input type="text" v-model="v.options" required placeholder="VD: Trắng - Size M" />
              </div>
              <div class="form-group">
                <label>Giá (VND) *</label>
                <input type="number" v-model="v.price" required min="0" />
              </div>
              <div class="form-group">
                <label>Tồn kho *</label>
                <input type="number" v-model="v.stock" required min="0" />
              </div>
            </div>

            <!-- Ảnh biến thể -->
            <div class="variant-images">
              <label class="section-label">Ảnh biến thể</label>
              <div class="variant-image-grid" v-if="v.imageUrls && v.imageUrls.length > 0">
                <div class="variant-image-item" v-for="(imgUrl, imgIdx) in v.imageUrls" :key="imgIdx">
                  <img :src="imgUrl" alt="Variant Image Preview" />
                  <button type="button" class="btn-image-delete" @click="removeVariantImage(idx, imgIdx)" title="Xóa ảnh">✕</button>
                </div>
              </div>
              <input 
                :id="'variant-upload-' + idx"
                type="file" 
                multiple 
                accept="image/jpeg,image/png,image/webp" 
                style="display: none" 
                @change="onVariantImagesChange($event, idx)" 
              />
              <button type="button" class="btn btn-outline btn-xs" @click="triggerVariantUpload(idx)">+ Tải ảnh lên</button>
            </div>
          </div>
        </div>

        <button type="button" class="btn btn-outline btn-sm mt-2" @click="addVariant">+ Thêm phân loại</button>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-outline" @click="router.back()">Hủy</button>
        <button type="submit" class="btn btn-primary btn-large" :disabled="productStore.loading || isUploading">
          {{ productStore.loading ? 'Đang lưu...' : isUploading ? 'Đang tải ảnh...' : 'Lưu Sản Phẩm' }}
        </button>
      </div>
    </form>

    <!-- Modal thêm danh mục -->
    <div class="modal-overlay" v-if="showAddCategoryModal" @click.self="showAddCategoryModal = false">
      <div class="modal">
        <h3>Thêm Danh Mục Mới</h3>
        <div class="form-group">
          <label>Tên danh mục *</label>
          <input type="text" v-model="newCategoryName" placeholder="VD: Thời trang" @keyup.enter="submitAddCategory" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showAddCategoryModal = false">Hủy</button>
          <button class="btn btn-primary" @click="submitAddCategory" :disabled="!newCategoryName.trim()">Thêm</button>
        </div>
      </div>
    </div>

    <!-- Modal thêm loại sản phẩm -->
    <div class="modal-overlay" v-if="showAddTypeModal" @click.self="showAddTypeModal = false">
      <div class="modal">
        <h3>Thêm Loại Sản Phẩm Mới</h3>
        <div class="form-group">
          <label>Tên loại *</label>
          <input type="text" v-model="newTypeName" placeholder="VD: Điện tử" @keyup.enter="submitAddType" />
        </div>
        <div class="form-group">
          <label>Mô tả</label>
          <input type="text" v-model="newTypeDesc" placeholder="Mô tả ngắn (tùy chọn)" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showAddTypeModal = false">Hủy</button>
          <button class="btn btn-primary" @click="submitAddType" :disabled="!newTypeName.trim()">Thêm</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { uploadToCloudinary } from '../../api/cloudinary.js';
import { useRouter, useRoute } from 'vue-router';
import { useProductStore } from '../../stores/product.js';
import SearchableSelect from '../../components/SearchableSelect.vue';

const router = useRouter();
const route  = useRoute();
const productStore = useProductStore();
const thumbInputRef = ref(null);
const isUploading  = ref(false);  // true khi đang upload bất kỳ ảnh nào

const isEditMode = ref(false);

// ── Form state ──────────────────────────────────────────────
const product = ref({
  name:         '',
  description:  '',
  categoryId:   '',
  typeId:       '',
  basePrice:    0,
  thumbnailUrl: '',
});

const variants = ref([
  { options: 'Mặc định', price: 0, stock: 10, imageUrls: [] }
]);

// ── Modal state ─────────────────────────────────────────────
const showAddCategoryModal = ref(false);
const newCategoryName      = ref('');
const showAddTypeModal     = ref(false);
const newTypeName          = ref('');
const newTypeDesc          = ref('');

// ── Lifecycle ────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    productStore.fetchCategories(),
    productStore.fetchProductTypes(),
  ]);
  // TODO: nếu route có param id → load sản phẩm để edit
  if (route.params.id) {
    isEditMode.value = true;
  }
});

// ── Thumbnail ────────────────────────────────────────────────
const triggerThumbInput = () => thumbInputRef.value?.click();

const onThumbChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    alert('File quá lớn! Vui lòng chọn ảnh dưới 5 MB.');
    e.target.value = '';
    return;
  }
  try {
    isUploading.value = true;
    const url = await uploadToCloudinary(file);
    product.value.thumbnailUrl = url;
  } catch (err) {
    alert('Upload ảnh thất bại: ' + err.message);
  } finally {
    isUploading.value = false;
    e.target.value = '';
  }
};

// ── Variants ─────────────────────────────────────────────────
const addVariant = () => {
  variants.value.push({ options: '', price: product.value.basePrice, stock: 10, imageUrls: [] });
};
const removeVariant = (idx) => variants.value.splice(idx, 1);

const removeVariantImage = (vIdx, imgIdx) => variants.value[vIdx].imageUrls.splice(imgIdx, 1);

const triggerVariantUpload = (idx) => {
  document.getElementById(`variant-upload-${idx}`)?.click();
};

const onVariantImagesChange = async (e, idx) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const validFiles = [];
  for (let i = 0; i < files.length; i++) {
    if (files[i].size > 5 * 1024 * 1024) {
      alert(`File "${files[i].name}" quá lớn! Vui lòng chọn ảnh dưới 5 MB.`);
    } else {
      validFiles.push(files[i]);
    }
  }
  if (validFiles.length === 0) { e.target.value = ''; return; }

  try {
    isUploading.value = true;
    // Upload song song tất cả ảnh hợp lệ
    const urls = await Promise.all(validFiles.map(f => uploadToCloudinary(f)));
    if (!variants.value[idx].imageUrls) {
      variants.value[idx].imageUrls = [];
    }
    variants.value[idx].imageUrls.push(...urls);
  } catch (err) {
    alert('Upload ảnh biến thể thất bại: ' + err.message);
  } finally {
    isUploading.value = false;
    e.target.value = '';
  }
};

// ── Submit ───────────────────────────────────────────────────
const handleSubmit = async () => {
  if (variants.value.length === 0) {
    alert('Vui lòng thêm ít nhất 1 phân loại hàng.');
    return;
  }
  if (!product.value.categoryId) {
    alert('Vui lòng chọn danh mục.');
    return;
  }

  // Lọc imageUrls rỗng
  const cleanVariants = variants.value.map(v => ({
    ...v,
    imageUrls: (v.imageUrls || []).filter(u => u.trim() !== ''),
  }));

  const result = await productStore.createProduct(product.value, cleanVariants);

  if (result.success) {
    alert('Thêm sản phẩm thành công!');
    router.push('/seller/products');
  } else {
    alert('Lỗi: ' + (result.message || 'Không thể lưu sản phẩm'));
  }
};

// ── Modal: Category ──────────────────────────────────────────
const submitAddCategory = async () => {
  const name = newCategoryName.value.trim();
  if (!name) return;
  const res = await productStore.createCategory(name);
  if (res.success !== false) {
    const added = productStore.categories.find(c => c.name === name);
    if (added) product.value.categoryId = added.id;
    newCategoryName.value = '';
    showAddCategoryModal.value = false;
    alert(`Đã thêm danh mục "${name}"`);
  } else {
    alert('Lỗi: ' + (res.message || 'Thêm danh mục thất bại'));
  }
};

// ── Modal: ProductType ───────────────────────────────────────
const submitAddType = async () => {
  const name = newTypeName.value.trim();
  if (!name) return;
  const res = await productStore.createProductType(name, newTypeDesc.value.trim() || null);
  if (res.success !== false) {
    const added = productStore.productTypes.find(t => t.name === name);
    if (added) product.value.typeId = added.id;
    newTypeName.value = '';
    newTypeDesc.value = '';
    showAddTypeModal.value = false;
    alert(`Đã thêm loại sản phẩm "${name}"`);
  } else {
    alert('Lỗi: ' + (res.message || 'Thêm loại thất bại'));
  }
};
</script>

<style scoped>
.header-section {
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 20px; margin-bottom: 24px;
}
.title { font-size: 20px; color: var(--text-dark); }

/* Loading */
.loading-overlay {
  position: fixed; inset: 0; background: rgba(255,255,255,0.75);
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; z-index: 100; gap: 12px;
}
.spinner {
  width: 36px; height: 36px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Sections */
.form-section {
  background: #F9FAFB; border: 1px solid var(--border-color);
  border-radius: var(--radius-md); padding: 24px; margin-bottom: 24px;
}
.form-section h3 { font-size: 16px; margin-bottom: 20px; color: var(--primary-color); }
.subtitle { font-size: 13px; color: var(--text-light); margin-top: -10px; margin-bottom: 20px; }

.form-group { margin-bottom: 16px; flex: 1; }
.form-group label {
  display: block; margin-bottom: 8px; font-weight: 500;
  font-size: 14px; color: var(--text-dark);
}
.form-group input,
.form-group textarea,
.form-group select {
  width: 100%; padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  outline: none; font-family: inherit;
  transition: var(--transition); box-sizing: border-box;
}
.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus { border-color: var(--primary-color); }
.form-row { display: flex; gap: 20px; }

/* Select with add button */
.select-with-add { display: flex; gap: 8px; align-items: stretch; }
.select-with-add select { flex: 1; }
.btn-add-inline {
  background: var(--primary-color); color: #fff;
  border: none; border-radius: var(--radius-sm);
  width: 36px; font-size: 20px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; line-height: 1;
}
.btn-add-inline:hover { opacity: 0.85; }



/* Thumbnail zone */
.image-upload-zone {
  border: 2px dashed var(--border-color); border-radius: var(--radius-md);
  height: 180px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; overflow: hidden; position: relative;
  background: var(--bg-color); transition: var(--transition-fast);
}
.image-upload-zone:hover:not(.uploading) { border-color: var(--primary-color); }
.image-upload-zone.has-image { border-style: solid; border-color: var(--border-color); }
.image-upload-zone.uploading { cursor: not-allowed; border-color: var(--primary-color); border-style: solid; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--text-light); }
.upload-placeholder p { font-weight: 500; color: var(--text-dark); font-size: 15px; }
.upload-placeholder span { font-size: 12px; }
.thumb-preview { width: 100%; height: 100%; object-fit: contain; }
.upload-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  color: white; font-weight: 600; font-size: 15px;
  opacity: 0; transition: opacity 0.2s;
}
.image-upload-zone:hover .upload-overlay { opacity: 1; }

/* Upload loading state */
.upload-loading {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  color: var(--primary-color);
}
.upload-loading p { font-size: 13px; font-weight: 500; margin: 0; }
.upload-spinner {
  width: 32px; height: 32px;
  border: 3px solid rgba(0,0,0,0.1);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* Variants */
.variants-list { display: flex; flex-direction: column; gap: 16px; }
.variant-item {
  background: var(--white); padding: 16px;
  border-radius: var(--radius-sm); border: 1px solid var(--border-color);
}
.variant-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px;
}
.variant-label { font-weight: 600; font-size: 14px; color: var(--text-dark); }
.variant-fields { display: flex; gap: 16px; }
.variant-fields .form-group { margin-bottom: 0; }

.variant-images { margin-top: 12px; border-top: 1px dashed var(--border-color); padding-top: 12px; }
.section-label { font-size: 13px; font-weight: 500; color: var(--text-dark); display: block; margin-bottom: 8px; }
.variant-image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}
.variant-image-item {
  position: relative;
  width: 80px;
  height: 80px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--bg-color);
}
.variant-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.btn-image-delete {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: background-color 0.2s;
}
.btn-image-delete:hover {
  background: #EF4444;
}
.btn-remove {
  background: none; border: 1px solid #EF4444; color: #EF4444;
  font-size: 13px; cursor: pointer; padding: 4px 10px;
  border-radius: var(--radius-sm);
}
.btn-remove:hover { background: #FEE2E2; }
.btn-xs { padding: 4px 10px; font-size: 13px; }
.btn-sm { padding: 8px 16px; font-size: 14px; }
.mt-2 { margin-top: 16px; }

.form-actions { display: flex; justify-content: flex-end; gap: 12px; }
.btn-large { padding: 14px 40px; font-size: 16px; }
button:disabled { opacity: 0.6; cursor: not-allowed; }

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
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }
</style>
