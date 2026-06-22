<template>
  <div class="auth-view container mt-4">
    <div class="auth-card text-center">
      <div class="icon-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mail-icon"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
      </div>
      
      <h2>Xác Thực Email</h2>
      <p class="desc">Chúng tôi đã gửi một liên kết xác thực đến địa chỉ email của bạn. Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam).</p>
      
      <div class="form-success" v-if="successMsg">{{ successMsg }}</div>

      <button class="btn btn-outline btn-block mt-3" @click="handleResend" :disabled="isLoading">
        {{ isLoading ? 'Đang gửi lại...' : 'Gửi Lại Liên Kết' }}
      </button>

      <div class="auth-footer mt-4">
        <router-link to="/login" class="link">Quay lại Đăng nhập</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isLoading = ref(false);
const successMsg = ref('');

const handleResend = () => {
  isLoading.value = true;
  // Mock API call
  setTimeout(() => {
    isLoading.value = false;
    successMsg.value = 'Liên kết mới đã được gửi thành công!';
  }, 1000);
};
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
.text-center {
  text-align: center;
}
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 50%;
  margin-bottom: 24px;
}
.mail-icon {
  color: var(--primary-color);
}
h2 {
  font-size: 26px;
  color: var(--text-dark);
  margin-bottom: 12px;
}
.desc {
  color: var(--text-color);
  line-height: 1.6;
  margin-bottom: 24px;
}
.form-success {
  color: var(--success);
  font-size: 14px;
  margin-bottom: 20px;
  background: rgba(16, 185, 129, 0.1);
  padding: 12px;
  border-radius: var(--radius-sm);
}
.btn-block {
  width: 100%;
  padding: 14px;
  font-size: 16px;
}
.mt-3 {
  margin-top: 16px;
}
.auth-footer {
  margin-top: 24px;
  font-size: 14px;
}
.link {
  color: var(--primary-color);
  font-weight: 600;
}
</style>
