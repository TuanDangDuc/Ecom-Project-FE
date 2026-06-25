<template>
  <div class="addresses-view">
    <div class="header-section">
      <h2 class="title">Địa Chỉ Của Tôi</h2>
      <button class="btn btn-primary" @click="showAddForm = true">+ Thêm địa chỉ mới</button>
    </div>

    <div class="address-list">
      <div class="address-card" v-for="addr in addresses" :key="addr.id">
        <div class="info-area">
          <div class="user-row">
            
            <span class="divider">|</span>
            <span class="phone">{{ addr.phoneNumber }}</span>
          </div>
          <div class="address-text">{{ addr.specificAddress }}</div>
          <div class="address-text">{{ addr.ward }}, {{ addr.district }}, {{ addr.province }}</div>
          <div class="badges">
            <span class="badge" v-if="addr.isDefault">Mặc định</span>
            <span class="badge-type">{{ addr.addressType }}</span>
          </div>
        </div>
        <div class="action-area">
          <div class="actions">
            <button class="action-btn" @click="editAddress(addr)">Cập nhật</button>
            <button class="action-btn delete" @click="deleteAddress(addr.id)">Xóa</button>
          </div>
          <button class="btn btn-outline btn-sm" :disabled="addr.isDefault" @click="setDefaultAddress(addr)">Thiết lập mặc định</button>
        </div>
      </div>
    </div>

    <!-- Modal Form (Simplified) -->
    <div class="modal-overlay" v-if="showAddForm">
      <div class="modal-content">
        <h3>{{ isEditing ? 'Cập Nhật Địa Chỉ' : 'Thêm Địa Chỉ Mới' }}</h3>
        <form @submit.prevent="submitForm">
          <div class="form-row">
    
            <input type="text" v-model="formData.phoneNumber" placeholder="Số điện thoại" required />
          </div>
          <div class="form-row">
            <input type="text" v-model="formData.province" placeholder="Tỉnh/Thành phố" required />
            <input type="text" v-model="formData.district" placeholder="Quận/Huyện" required />
          </div>
          <div class="form-row">
            <input type="text" v-model="formData.ward" placeholder="Phường/Xã" required />
          </div>
          <div class="form-row">
            <input type="text" v-model="formData.specificAddress" placeholder="Địa chỉ cụ thể" required />
          </div>
          <div class="form-row options">
            <label><input type="radio" v-model="formData.addressType" value="HOME" /> Nhà riêng</label>
            <label><input type="radio" v-model="formData.addressType" value="OFFICE" /> Văn phòng</label>
          </div>
          <div class="form-row checkbox">
            <label><input type="checkbox" v-model="formData.isDefault" /> Đặt làm địa chỉ mặc định</label>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="closeForm">Trở lại</button>
            <button type="submit" class="btn btn-primary">Hoàn thành</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { addressApi } from '../../../api'

const addresses = ref([])
const showAddForm = ref(false)
const isEditing = ref(false)
const loading = ref(false)

const formData = ref(getEmptyForm())

function getEmptyForm() {
  return {
    id: null,
    phoneNumber: '',
    province: '',
    district: '',
    ward: '',
    specificAddress: '',
    addressType: 'HOME',
    isDefault: false,
    city: '',
    country: 'Vietnam'
  }
}

const normalizeAddress = (addr) => ({
  id: addr.id,
  phoneNumber: addr.phoneNumber || '',
  province: addr.province || '',
  district: addr.district || '',
  ward: addr.ward || '',
  specificAddress: addr.specificAddress || '',
  addressType: addr.addressType || 'HOME',
  isDefault: !!addr.isDefault,
  city: addr.city || '',
  country: addr.country || 'Vietnam'
})

const loadAddresses = async () => {
  try {
    loading.value = true
    const userId = Number(localStorage.getItem('userId'))

    const res = await addressApi.getByUserId(userId)

    const list = res.data || res.addresses || res.result || []
    addresses.value = Array.isArray(list)
      ? list.map(normalizeAddress)
      : []
  } catch (err) {
    console.error('[Load addresses]', err)
    addresses.value = []
  } finally {
    loading.value = false
  }
}

const editAddress = (addr) => {
  formData.value = normalizeAddress(addr)
  isEditing.value = true
  showAddForm.value = true
}

const closeForm = () => {
  showAddForm.value = false
  isEditing.value = false
  formData.value = getEmptyForm()
}

const buildCreatePayload = () => {
  const userId = Number(localStorage.getItem('userId'))

  return {
    province: formData.value.province,
    district: formData.value.district,
    ward: formData.value.ward,
    specificAddress: formData.value.specificAddress,
    isDefault: formData.value.isDefault,
    addressType: formData.value.addressType,
    phoneNumber: formData.value.phoneNumber,
    city: formData.value.city,
    country: formData.value.country,
    userId
  }
}

const buildUpdatePayload = () => {
  return {
    id: formData.value.id,
    province: formData.value.province,
    district: formData.value.district,
    ward: formData.value.ward,
    specificAddress: formData.value.specificAddress,
    isDefault: formData.value.isDefault,
    addressType: formData.value.addressType,
    phoneNumber: formData.value.phoneNumber,
    city: formData.value.city,
    country: formData.value.country
  }
}

const submitForm = async () => {
  try {
    if (!formData.value.province || !formData.value.district || !formData.value.specificAddress || !formData.value.phoneNumber) {
      alert('Vui lòng nhập đầy đủ tỉnh/thành, quận/huyện, địa chỉ cụ thể và số điện thoại.')
      return
    }

    if (isEditing.value) {
      await addressApi.update(buildUpdatePayload())
    } else {
      await addressApi.create(buildCreatePayload())
    }

    await loadAddresses()
    closeForm()
  } catch (err) {
    alert(err.message || 'Lưu địa chỉ thất bại')
  }
}

const deleteAddress = async (id) => {
  if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return

  try {
    await addressApi.delete(id)
    await loadAddresses()
  } catch (err) {
    alert(err.message || 'Xóa địa chỉ thất bại')
  }
}

const setDefaultAddress = async (addr) => {
  try {
    await addressApi.update({
      id: addr.id,
      province: addr.province,
      district: addr.district,
      ward: addr.ward,
      specificAddress: addr.specificAddress,
      isDefault: true,
      addressType: addr.addressType,
      phoneNumber: addr.phoneNumber,
      city: addr.city,
      country: addr.country
    })

    await loadAddresses()
  } catch (err) {
    alert(err.message || 'Thiết lập mặc định thất bại')
  }
}

onMounted(loadAddresses)
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
.address-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.address-card {
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-color);
}
.address-card:last-child {
  border-bottom: none;
}
.user-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 16px;
}
.user-row .name { font-weight: 600; color: var(--text-dark); }
.user-row .divider { color: var(--border-color); }
.user-row .phone { color: var(--text-light); }
.address-text {
  color: var(--text-color);
  margin-bottom: 4px;
}
.badges {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}
.badge {
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 4px;
}
.badge-type {
  border: 1px solid var(--text-light);
  color: var(--text-light);
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 4px;
}
.action-area {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
}
.actions {
  display: flex;
  gap: 16px;
}
.action-btn {
  background: none;
  border: none;
  color: #2563EB;
  cursor: pointer;
  font-size: 14px;
}
.action-btn:hover { text-decoration: underline; }
.action-btn.delete { color: #EF4444; }
.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: var(--radius-sm);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: var(--white);
  padding: 30px;
  border-radius: var(--radius-lg);
  width: 500px;
  box-shadow: var(--shadow-lg);
}
.modal-content h3 {
  margin-bottom: 20px;
  font-size: 20px;
}
.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.form-row input[type="text"] {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  outline: none;
  font-family: inherit;
}
.form-row input[type="text"]:focus {
  border-color: var(--primary-color);
}
.options {
  gap: 20px;
}
.checkbox {
  margin-top: 20px;
  margin-bottom: 30px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
