<template>
  <div class="auth-view container mt-4">
    <div class="auth-card">
      <div class="auth-header">
        <h2>Đăng Ký</h2>
        <p>Tạo tài khoản ShopeeLite mới</p>
      </div>
      
      <form class="auth-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label>Tên đăng nhập</label>
          <input type="text" v-model="username" placeholder="Nhập tên đăng nhập" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="email" placeholder="example@email.com" required />
        </div>
        <div class="form-group">
          <label>Mật khẩu</label>
          <input type="password" v-model="password" placeholder="Nhập mật khẩu" required minlength="6" />
        </div>
        <div class="form-group">
          <label>Xác nhận mật khẩu</label>
          <input type="password" v-model="confirmPassword" placeholder="Nhập lại mật khẩu" required minlength="6" />
        </div>
        
        <div class="form-error" v-if="errorMsg">{{ errorMsg }}</div>
        
        <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
          {{ isLoading ? 'Đang đăng ký...' : 'Đăng Ký' }}
        </button>
      </form>

      <div class="auth-footer">
        Đã có tài khoản? <router-link to="/login" class="link">Đăng nhập</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../../api'

const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

const handleRegister = async () => {
  errorMsg.value = ''

  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Mật khẩu xác nhận không khớp!'
    return
  }

  try {
    isLoading.value = true

    const payload = {
      username: username.value,
      email: email.value,
      password: password.value
    }

    const res = await authApi.register(payload)

    if (res.success) {
      alert('Đăng ký thành công! Vui lòng đăng nhập.')
      router.push('/login')
    } else {
      errorMsg.value = res.message || 'Đăng ký thất bại!'
    }
  } catch (err) {
    errorMsg.value = err.message || 'Đăng ký thất bại!'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.mt-4 { margin-top: 4rem; margin-bottom: 4rem; display: flex; justify-content: center; }
.auth-card {
  width: 100%;
  max-width: 480px;
  background: var(--white);
  padding: 40px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}
.auth-header {
  text-align: center;
  margin-bottom: 30px;
}
.auth-header h2 {
  font-size: 28px;
  color: var(--primary-color);
  margin-bottom: 8px;
}
.auth-header p {
  color: var(--text-light);
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-dark);
}
.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 15px;
  outline: none;
  transition: var(--transition);
  font-family: inherit;
}
.form-group input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.form-error {
  color: #ef4444;
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
  background: rgba(239, 68, 68, 0.1);
  padding: 10px;
  border-radius: var(--radius-sm);
}
.btn-block {
  width: 100%;
  padding: 14px;
  font-size: 16px;
}
.auth-footer {
  margin-top: 24px;
  text-align: center;
  color: var(--text-color);
  font-size: 14px;
}
.link {
  color: var(--primary-color);
  font-weight: 600;
}
.link:hover {
  text-decoration: underline;
}
</style>
