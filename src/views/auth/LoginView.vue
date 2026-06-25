<template>
  <div class="auth-view container mt-4">
    <div class="auth-card">
      <div class="auth-header">
        <h2>Đăng Nhập</h2>
        <p>Chào mừng bạn trở lại với ShopeeLite</p>
      </div>
      
      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Tên đăng nhập</label>
          <input type="text" v-model="username" placeholder="Nhập tên đăng nhập" required />
          <span class="hint">Nhập username đã đăng ký</span>
        </div>
        
        <div class="form-group">
          <div class="password-label-row">
            <label>Mật khẩu</label>
            <router-link to="/forgot-password" class="forgot-link">Quên mật khẩu?</router-link>
          </div>
          <input type="password" v-model="password" placeholder="Nhập mật khẩu" required />
          <span class="hint">Nhập mật khẩu của tài khoản</span>
        </div>
        
        <div class="form-error" v-if="errorMsg">{{ errorMsg }}</div>
        
        <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
          {{ isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập' }}
        </button>
      </form>

      <div class="auth-footer">
        Chưa có tài khoản? <router-link to="/register" class="link">Đăng ký ngay</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/user';
import { useShopStore } from '../../stores/shop';

const router = useRouter();
const userStore = useUserStore();
const shopStore = useShopStore();

const username = ref('');
const password = ref('');
const errorMsg = ref('');
const isLoading = ref(false); // Trạng thái chặn bấm liên tục khi đang đợi API mạng

const handleLogin = async () => {
  errorMsg.value = '';
  isLoading.value = true;
  
  try {
    // Chờ đợi hàm login xử lý và xác thực token thông qua API mạng
    const success = await userStore.login(username.value, password.value);
    
    if (success) {
      // Phân quyền điều hướng trang sau khi đăng nhập thành công
      const role = userStore.currentUser?.role

        if (role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else if (role === 'SELLER') {
          router.push('/seller/dashboard')
        } else {
          router.push('/')
        }
    } else {
      errorMsg.value = 'Sai tên đăng nhập hoặc mật khẩu!';
    }
  } catch (err) {
    errorMsg.value = 'Hệ thống đang bận hoặc mất kết nối mạng, vui lòng thử lại!';
    console.error('Lỗi giao diện Login:', err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.mt-4 { 
  margin-top: 4rem; 
  margin-bottom: 4rem; 
  display: flex; 
  justify-content: center; 
}
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
.password-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.password-label-row label {
  margin-bottom: 0;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-dark);
}
.forgot-link {
  font-size: 13px;
  color: var(--primary-color);
  text-decoration: none;
}
.forgot-link:hover {
  text-decoration: underline;
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
.hint {
  display: block;
  font-size: 12px;
  color: var(--text-light);
  margin-top: 4px;
  font-style: italic;
}
.form-error {
  color: #ef4444;
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  margin-bottom: 20px;
  text-align: left;
}
.btn-block {
  width: 100%;
}
.auth-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--text-light);
}
.auth-footer .link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}
.auth-footer .link:hover {
  text-decoration: underline;
}
</style>