<template>
  <div class="auth-view container mt-4">
    <div class="auth-card">
      <div class="auth-header">
        <h2>{{ step === 1 ? 'Quên Mật Khẩu' : (step === 2 ? 'Nhập Mã Xác Nhận' : 'Tạo Mật Khẩu Mới') }}</h2>
        <p>{{ step === 1 ? 'Nhập email của bạn để nhận mã khôi phục' : (step === 2 ? `Mã xác nhận đã được gửi đến ${email}` : 'Vui lòng nhập mật khẩu mới của bạn') }}</p>
      </div>
      <div class="form-error" v-if="errorMsg">{{ errorMsg }}</div>
      
      <!-- Step 1: Email -->
      <form class="auth-form" @submit.prevent="handleSendOTP" v-if="step === 1">
        <div class="form-group">
          <label>Email liên kết</label>
          <input type="email" v-model="email" placeholder="example@email.com" required />
        </div>
        <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
          {{ isLoading ? 'Đang gửi...' : 'Gửi Mã Xác Nhận' }}
        </button>
      </form>

      <!-- Step 2: OTP -->
      <form class="auth-form" @submit.prevent="handleVerifyOTP" v-if="step === 2">
        <div class="form-group">
          <label>Mã OTP</label>
          <input type="text" v-model="otp" placeholder="Nhập 6 số" required maxlength="6" />
        </div>
        <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
          {{ isLoading ? 'Đang xác nhận...' : 'Xác Nhận OTP' }}
        </button>
        <div class="text-center mt-3">
          <a href="#" class="link" @click.prevent="handleSendOTP">Gửi lại mã</a>
        </div>
      </form>

      <!-- Step 3: New Password -->
      <form class="auth-form" @submit.prevent="handleResetPassword" v-if="step === 3">
        <div class="form-group">
          <label>Mật khẩu mới</label>
          <input type="password" v-model="newPassword" placeholder="Tối thiểu 6 ký tự" required minlength="6" />
        </div>
        <div class="form-group">
          <label>Xác nhận mật khẩu mới</label>
          <input type="password" v-model="confirmPassword" placeholder="Nhập lại mật khẩu" required minlength="6" />
        </div>
        <div class="form-error" v-if="errorMsg">{{ errorMsg }}</div>
        <div class="form-success" v-if="successMsg">{{ successMsg }}</div>
        
        <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading || successMsg !== ''">
          {{ isLoading ? 'Đang đổi...' : 'Đổi Mật Khẩu' }}
        </button>
      </form>

      <div class="auth-footer" v-if="!successMsg">
        Nhớ mật khẩu rồi? <router-link to="/login" class="link">Đăng nhập</router-link>
      </div>
      <div class="auth-footer" v-else>
        <router-link to="/login" class="btn btn-outline btn-block mt-3">Về trang Đăng nhập</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
//sửa lại toàn bộ
import { ref } from 'vue'
import { authApi } from '../../api'

const step = ref(1)
const email = ref('')
const otp = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const requestId = ref('')

const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleSendOTP = async () => {
  errorMsg.value = ''
  successMsg.value = ''

  try {
    isLoading.value = true

    const res = await authApi.forgotPassword(email.value)

    requestId.value = res.requestId
    localStorage.setItem('resetRequestId', res.requestId)

    step.value = 2
  } catch (err) {
    errorMsg.value = err.message || 'Gửi OTP thất bại'
  } finally {
    isLoading.value = false
  }
}

const handleVerifyOTP = async () => {
  errorMsg.value = ''
  successMsg.value = ''

  try {
    isLoading.value = true

    const id = requestId.value || localStorage.getItem('resetRequestId')

    await authApi.verifyOtp({
      requestId: id,
      otp: otp.value
    })

    step.value = 3
  } catch (err) {
    errorMsg.value = err.message || 'Mã OTP không hợp lệ'
  } finally {
    isLoading.value = false
  }
}

const handleResetPassword = async () => {
  errorMsg.value = ''
  successMsg.value = ''

  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'Mật khẩu xác nhận không khớp!'
    return
  }

  try {
    isLoading.value = true

    const id = requestId.value || localStorage.getItem('resetRequestId')

    await authApi.resetPassword({
      requestId: id,
      newPassword: newPassword.value
    })

    localStorage.removeItem('resetRequestId')
    successMsg.value = 'Đổi mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.'
  } catch (err) {
    errorMsg.value = err.message || 'Đổi mật khẩu thất bại'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.mt-4 { margin-top: 4rem; margin-bottom: 4rem; display: flex; justify-content: center; }
.mt-3 { margin-top: 1rem; }
.text-center { text-align: center; }
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
.form-success {
  color: var(--success);
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
  background: rgba(16, 185, 129, 0.1);
  padding: 10px;
  border-radius: var(--radius-sm);
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
</style>
