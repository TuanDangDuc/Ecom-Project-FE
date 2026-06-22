<template>
  <div class="product-form-view">
    <div class="header-section">
      <h2 class="title">Thêm Sản Phẩm Mới</h2>
      <button class="btn btn-outline" @click="router.back()">Trở lại</button>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="form-section">
        <h3>1. Thông tin cơ bản</h3>
        <div class="form-group">
          <label>Tên sản phẩm *</label>
          <input type="text" v-model="product.name" required />
        </div>
        <div class="form-group">
          <label>Mô tả sản phẩm</label>
          <textarea v-model="product.description" rows="4"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Danh mục *</label>
            <select v-model="product.categoryId" required>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Giá cơ bản (VND) *</label>
            <input type="number" v-model="product.basePrice" required />
          </div>
        </div>

        <!-- Thumbnail Upload -->
        <div class="form-group">
          <label>Ảnh đại diện sản phẩm *</label>
          <div class="image-upload-zone" @click="triggerThumbInput" :class="{ 'has-image': product.thumbnailUrl }">
            <img :src="product.thumbnailUrl" alt="Preview" v-if="product.thumbnailUrl" class="thumb-preview">
            <div class="upload-placeholder" v-else>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <p>Bấm để chọn ảnh</p>
              <span>JPEG, PNG, WEBP · Tối đa 2 MB</span>
            </div>
            <div class="upload-overlay" v-if="product.thumbnailUrl">
              <span>Đổi ảnh</span>
            </div>
          </div>
          <input ref="thumbInputRef" type="file" accept="image/jpeg,image/png,image/webp" style="display:none" @change="onThumbChange">
        </div>
      </div>

      <div class="form-section">
        <h3>2. Phân loại hàng (Các biến thể)</h3>
        <p class="subtitle">Thêm ít nhất 1 phân loại để bán (ví dụ: Màu sắc, Kích cỡ)</p>
        
        <div class="variants-list">
          <div class="variant-item" v-for="(v, idx) in variants" :key="idx">
            <div class="form-group">
              <label>Tên phân loại (VD: Trắng - Size M) *</label>
              <input type="text" v-model="v.options" required />
            </div>
            <div class="form-group">
              <label>Giá (VND) *</label>
              <input type="number" v-model="v.price" required />
            </div>
            <div class="form-group">
              <label>Tồn kho *</label>
              <input type="number" v-model="v.stock" required />
            </div>
            <button type="button" class="btn-remove" @click="removeVariant(idx)" v-if="variants.length > 1">✕</button>
          </div>
        </div>
        <button type="button" class="btn btn-outline btn-sm mt-2" @click="addVariant">+ Thêm phân loại</button>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary btn-large">Lưu Sản Phẩm</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useShopStore } from '../../stores/shop';
import { categories } from '../../mock/data';

const router = useRouter();
const shopStore = useShopStore();
const thumbInputRef = ref(null);

const product = ref({
  name: '',
  description: '',
  categoryId: 1,
  basePrice: 0,
  thumbnailUrl: '',
  type: 'general',
  imagesUrl: []
});

const triggerThumbInput = () => thumbInputRef.value?.click();

const onThumbChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    alert('File quá lớn! Vui lòng chọn ảnh dưới 2 MB.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => { product.value.thumbnailUrl = ev.target.result; };
  reader.readAsDataURL(file);
  e.target.value = '';
};

const variants = ref([
  { options: 'Mặc định', price: 0, stock: 10 }
]);

const addVariant = () => {
  variants.value.push({ options: '', price: product.value.basePrice, stock: 10 });
};

const removeVariant = (idx) => {
  variants.value.splice(idx, 1);
};

const handleSubmit = () => {
  if (variants.value.length === 0) {
    alert("Vui lòng thêm ít nhất 1 phân loại hàng.");
    return;
  }
  shopStore.addProduct(product.value, variants.value);
  alert("Thêm sản phẩm thành công!");
  router.push('/seller/products');
};
</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 20px;
  margin-bottom: 24px;
}
.title {
  font-size: 20px;
  color: var(--text-dark);
}
.form-section {
  background: #F9FAFB;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 24px;
  margin-bottom: 24px;
}
.form-section h3 {
  font-size: 16px;
  margin-bottom: 20px;
  color: var(--primary-color);
}
.subtitle {
  font-size: 13px;
  color: var(--text-light);
  margin-top: -10px;
  margin-bottom: 20px;
}
.form-group {
  margin-bottom: 16px;
  flex: 1;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
  color: var(--text-dark);
}
.form-group input, .form-group textarea, .form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  outline: none;
  font-family: inherit;
  transition: var(--transition);
}
.form-group input:focus, .form-group textarea:focus, .form-group select:focus {
  border-color: var(--primary-color);
}
.form-row {
  display: flex;
  gap: 20px;
}

.variants-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.variant-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: var(--white);
  padding: 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  position: relative;
}
.variant-item .form-group {
  margin-bottom: 0;
}
.btn-remove {
  background: none;
  border: none;
  color: #EF4444;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  margin-top: 32px;
}
.mt-2 { margin-top: 16px; }
.form-actions {
  display: flex;
  justify-content: flex-end;
}
.btn-large {
  padding: 14px 40px;
  font-size: 16px;
}
/* Image upload zone */
.image-upload-zone {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-md);
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  background: var(--bg-color);
  transition: var(--transition-fast);
}
.image-upload-zone:hover {
  border-color: var(--primary-color);
  background: rgba(14, 165, 233, 0.04);
}
.image-upload-zone.has-image {
  border-style: solid;
  border-color: var(--border-color);
}
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-light);
}
.upload-placeholder p {
  font-weight: 500;
  color: var(--text-dark);
  font-size: 15px;
}
.upload-placeholder span {
  font-size: 12px;
}
.thumb-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 15px;
  opacity: 0;
  transition: opacity 0.2s;
}
.image-upload-zone:hover .upload-overlay { opacity: 1; }
</style>
