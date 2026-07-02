<template>
  <div class="shop-profile">
    <div class="header-section">
      <h2 class="title">Hồ Sơ Cửa Hàng</h2>
    </div>

    <form class="profile-form" @submit.prevent="handleUpdate" v-if="formData">

      <div class="form-group">
        <label>Ảnh Đại Diện Cửa Hàng</label>
        <div class="avatar-upload-row">
          <div class="avatar-preview" @click="triggerAvatarInput">
            <img :src="formData.avatarUrl" alt="Avatar" v-if="formData.avatarUrl">
            <span class="avatar-initial" v-else>{{ formData.name?.charAt(0) }}</span>
            <div class="avatar-overlay">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              <span>Thay ảnh</span>
            </div>
          </div>
          <div class="avatar-upload-info">
            <input ref="avatarInputRef" type="file" accept="image/jpeg,image/png,image/webp" style="display:none" @change="onAvatarChange">
            <button type="button" class="btn-upload" @click="triggerAvatarInput">Tải ảnh lên từ thiết bị</button>
            <p class="hint">Dung lượng tối đa 1 MB<br>Định dạng: JPEG, PNG, WEBP</p>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Tên cửa hàng</label>
        <input type="text" v-model="formData.name" required />
      </div>
      <div class="form-group">
        <label>Mô tả cửa hàng</label>
        <textarea v-model="formData.description" rows="5" placeholder="Giới thiệu về cửa hàng của bạn..."></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">{{ formData.id ? 'Lưu Thay Đổi' : 'Tạo Cửa Hàng' }}</button>
        <span class="success-msg" v-if="saved">✓ Đã lưu thành công!</span>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { shopApi } from '../../api'

const formData = ref({
  id: null,
  name: '',
  description: '',
  avatarUrl: '',
  userId: null
})

const saved = ref(false)
const loading = ref(false)
const avatarInputRef = ref(null)

const triggerAvatarInput = () => avatarInputRef.value?.click()

const loadShop = async () => {
  try {
    loading.value = true
    const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId')
    const res = await shopApi.getByUserId(userId)

    const shop = Array.isArray(res?.data) ? res?.data[0] : res?.data

    if (shop) {
      formData.value = {
        id: shop.id,
        name: shop.name || '',
        description: shop.description || '',
        avatarUrl: shop.avatarUrl || '',
        userId: shop.userId || Number(userId)
      }
    } else {
      formData.value.userId = Number(userId)
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const onAvatarChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > 1024 * 1024) {
    alert('File quá lớn! Vui lòng chọn ảnh dưới 1 MB.')
    return
  }

  const reader = new FileReader()
  reader.onload = (ev) => {
    formData.value.avatarUrl = ev.target.result
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

const handleUpdate = async () => {
  try {
    if (formData.value.id) {
      await shopApi.update({
        id: formData.value.id,
        name: formData.value.name,
        description: formData.value.description,
        avatarUrl: formData.value.avatarUrl
      })
    } else {
      const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId')

      await shopApi.create({
        name: formData.value.name,
        description: formData.value.description,
        avatarUrl: formData.value.avatarUrl || 'default-shop-avatar.png',
        userId: Number(userId)
      })
    }

    saved.value = true
    await loadShop()
    setTimeout(() => saved.value = false, 3000)
  } catch (err) {
    alert(err.message || 'Lưu cửa hàng thất bại')
  }
}

onMounted(loadShop)
</script>

<style scoped>
.header-section {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
  margin-bottom: 24px;
}
.title { font-size: 22px; }
.profile-form { max-width: 640px; }
.form-group { margin-bottom: 22px; }
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-dark);
  font-size: 14px;
}
.form-group input, .form-group textarea {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: var(--transition-fast);
  background: var(--white);
}
.form-group input:focus, .form-group textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.12);
}

.avatar-upload-row {
  display: flex;
  align-items: center;
  gap: 24px;
}
.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--bg-color);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  border: 2px solid var(--border-color);
  flex-shrink: 0;
  transition: var(--transition-fast);
}
.avatar-preview:hover { border-color: var(--primary-color); }
.avatar-preview img { width: 100%; height: 100%; object-fit: cover; }
.avatar-initial { font-size: 36px; font-weight: 700; color: var(--primary-color); }
.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  color: white;
  font-size: 11px;
  border-radius: 50%;
}
.avatar-preview:hover .avatar-overlay { opacity: 1; }
.avatar-upload-info { display: flex; flex-direction: column; gap: 8px; }
.btn-upload {
  padding: 9px 18px;
  border: 1.5px dashed var(--primary-color);
  background: rgba(14, 165, 233, 0.05);
  color: var(--primary-color);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
}
.btn-upload:hover { background: rgba(14, 165, 233, 0.12); }
.hint { font-size: 12px; color: var(--text-light); line-height: 1.6; }

.form-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 30px;
}
.success-msg { color: var(--success); font-size: 14px; font-weight: 500; }
</style>
