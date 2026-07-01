<template>
  <div class="account-info">
    <h2 class="section-title">Hồ Sơ Của Tôi</h2>
    <p class="subtitle">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>

    <div class="profile-content" v-if="user">
      <div class="form-section">
        <form @submit.prevent="saveProfile">
          <div class="form-group row">
            <label>Tên Đăng Nhập</label>
            <div class="value">{{ user.username || user.userName }}</div>
          </div>

          <div class="form-group row">
            <label>Tên</label>
            <input type="text" v-model="formData.fullName" required />
          </div>

          <div class="form-group row">
            <label>Email</label>
            <input type="email" v-model="formData.email" />
          </div>

          <div class="form-group row">
            <label>Giới Tính</label>
            <div class="radio-group">
              <label><input type="radio" value="MALE" v-model="formData.sex"> Nam</label>
              <label><input type="radio" value="FEMALE" v-model="formData.sex"> Nữ</label>
              <label><input type="radio" value="OTHER" v-model="formData.sex"> Khác</label>
            </div>
          </div>

          <div class="form-group row">
            <label>Ngày Sinh</label>
            <input type="date" v-model="formData.dateOfBirth" />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Đang Lưu...' : 'Lưu Thay Đổi' }}
            </button>
            <span class="success-msg" v-if="successMsg">{{ successMsg }}</span>
          </div>
        </form>
      </div>

      <div class="avatar-section">
        <div class="avatar-preview" @click="triggerFileInput" title="Bấm để đổi ảnh">
          <img :src="formData.avatarUrl || user.avatarUrl" alt="Avatar" v-if="formData.avatarUrl || user.avatarUrl">
          <span class="avatar-initial" v-else>{{ (formData.fullName || 'U').charAt(0) }}</span>
          <div class="avatar-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            <span>Thay ảnh</span>
          </div>
        </div>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style="display:none"
          @change="onFileChange"
        >
        <button class="btn-upload" @click="triggerFileInput">
          Tải ảnh lên từ thiết bị
        </button>
        <p class="avatar-hint">Dung lượng tối đa 1 MB<br>Dịnh dạng: JPEG, PNG, WEBP</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../../../stores/user'
import { userApi } from '../../../api'

const userStore = useUserStore()
const user = computed(() => userStore.currentUser)

const formData = ref({
  username: '',
  fullName: '',
  email: '',
  sex: '',
  dateOfBirth: '',
  avatarUrl: ''
})

const isSaving = ref(false)
const successMsg = ref('')
const fileInputRef = ref(null)

const triggerFileInput = () => fileInputRef.value?.click()

const onFileChange = (e) => {
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

onMounted(async () => {
  let current = user.value

  if (!current) {
    const savedUser = localStorage.getItem('user')

    if (savedUser) {
      current = JSON.parse(savedUser)
      userStore.currentUser = current
    }
  }

  if (!current?.username && !current?.userName) return

  formData.value = {
    username: current.username || current.userName || '',
    fullName: current.fullName || '',
    email: current.email || '',
    sex: current.sex || 'MALE',
    dateOfBirth: current.dateOfBirth || '',
    avatarUrl: current.avatarUrl || ''
  }
})

const saveProfile = async () => {
  try {
    isSaving.value = true
    successMsg.value = ''

    const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
    const username =
      formData.value.username ||
      user.value?.username ||
      user.value?.userName ||
      savedUser.username ||
      savedUser.userName

    if (!username) {
      alert('Không tìm thấy username để cập nhật.')
      return
    }

    const payload = {
      username,
      email: formData.value.email,
      fullName: formData.value.fullName,
      sex: formData.value.sex,
      dateOfBirth: formData.value.dateOfBirth,
      avatarUrl: formData.value.avatarUrl
    }

    const res = await userApi.update(payload)

    const updatedUser = {
      ...savedUser,
      ...user.value,
      ...payload,
      ...(res?.data || res?.user || {})
    }

    userStore.currentUser = updatedUser
    localStorage.setItem('user', JSON.stringify(updatedUser))

    successMsg.value = 'Lưu thành công!'
    setTimeout(() => successMsg.value = '', 3000)
  } catch (err) {
    alert(err.message || 'Cập nhật thất bại')
  } finally {
    isSaving.value = false
  }
}
</script>
<style scoped>
.section-title {
  font-size: 20px;
  color: var(--text-dark);
  margin-bottom: 4px;
}
.subtitle {
  color: var(--text-light);
  font-size: 14px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}
.profile-content {
  display: flex;
  gap: 40px;
}
.form-section {
  flex: 1;
}
.avatar-section {
  width: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 40px;
  border-left: 1px solid var(--border-color);
}
.form-group.row {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.form-group.row label {
  width: 120px;
  color: var(--text-color);
  font-weight: 500;
  font-size: 14px;
}
.form-group.row .value {
  color: var(--text-dark);
  font-weight: 500;
  flex: 1;
}
.form-group.row input[type="text"],
.form-group.row input[type="date"],
.form-group.row input[type="email"],
.form-group.row input[type="tel"] {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: var(--transition);
  background: var(--white);
}
.form-group.row input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
}
.radio-group {
  display: flex;
  gap: 20px;
  flex: 1;
}
.radio-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  width: auto;
  font-weight: 400;
}
.edit-link {
  color: var(--primary-color);
  font-size: 13px;
  margin-left: 12px;
  text-decoration: underline;
}
.form-actions {
  margin-top: 32px;
  padding-left: 120px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.success-msg {
  color: var(--success);
  font-size: 14px;
  font-weight: 500;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--bg-color);
  overflow: hidden;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: var(--primary-color);
  font-weight: 700;
  cursor: pointer;
  position: relative;
  border: 3px solid var(--border-color);
  transition: var(--transition-fast);
}
.avatar-preview:hover {
  border-color: var(--primary-color);
}
.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-initial {
  font-size: 40px;
  font-weight: 700;
  color: var(--primary-color);
}
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
  transition: opacity 0.2s ease;
  color: white;
  font-size: 12px;
  font-weight: 500;
  border-radius: 50%;
}
.avatar-preview:hover .avatar-overlay { opacity: 1; }

.btn-upload {
  display: block;
  width: 100%;
  padding: 9px 16px;
  border: 1.5px dashed var(--primary-color);
  background: rgba(14, 165, 233, 0.05);
  color: var(--primary-color);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  margin-bottom: 10px;
}
.btn-upload:hover {
  background: rgba(14, 165, 233, 0.12);
}
.avatar-section .form-group {
  width: 100%;
  margin-bottom: 12px;
}
.avatar-section .form-group label {
  display: block;
  font-size: 13px;
  margin-bottom: 6px;
  text-align: center;
  color: var(--text-color);
}
.avatar-section .form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 13px;
  outline: none;
}
.avatar-hint {
  font-size: 12px;
  color: var(--text-light);
  text-align: center;
  line-height: 1.5;
}
</style>
