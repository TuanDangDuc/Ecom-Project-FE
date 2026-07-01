<template>
  <div class="searchable-select" ref="selectRef" @click="toggleDropdown">
    <div class="select-header" :class="{ 'is-open': isOpen }">
      <span>{{ selectedName || placeholder }}</span>
      <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>

    <div class="select-dropdown" v-if="isOpen" @click.stop>
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          ref="searchInput"
          v-model="searchQuery"
          placeholder="Tìm kiếm..."
          @input="onSearch"
        />
      </div>
      <ul class="options-list">
        <li v-if="filteredOptions.length === 0" class="no-options">
          Không tìm thấy kết quả
        </li>
        <li
          v-for="opt in filteredOptions"
          :key="opt.id"
          class="option-item"
          :class="{ 'is-selected': modelValue === opt.id }"
          @click="selectOption(opt)"
        >
          {{ opt.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '-- Chọn --'
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const searchQuery = ref('');
const selectRef = ref(null);
const searchInput = ref(null);

const selectedName = computed(() => {
  const selected = props.options.find(o => o.id === props.modelValue);
  return selected ? selected.name : '';
});

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options;
  const q = searchQuery.value.toLowerCase();
  return props.options.filter(o => o.name.toLowerCase().includes(q));
});

const toggleDropdown = async () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    searchQuery.value = '';
    await nextTick();
    searchInput.value?.focus();
  }
};

const selectOption = (opt) => {
  emit('update:modelValue', opt.id);
  isOpen.value = false;
};

const handleClickOutside = (e) => {
  if (selectRef.value && !selectRef.value.contains(e.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.searchable-select {
  position: relative;
  width: 100%;
}

.select-header {
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--white);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: var(--transition);
  font-size: 14px;
  color: var(--text-dark);
}

.select-header.is-open, .select-header:hover {
  border-color: var(--primary-color);
}

.chevron {
  transition: transform 0.2s;
  color: var(--text-light);
}
.select-header.is-open .chevron {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--white);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-box {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 8px;
  background: #F9FAFB;
}

.search-box svg {
  color: var(--text-light);
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 13px;
  color: var(--text-dark);
}

.options-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
}

.option-item {
  padding: 10px 12px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-dark);
  transition: background 0.2s;
}

.option-item:hover {
  background: rgba(37, 99, 235, 0.05);
  color: var(--primary-color);
}

.option-item.is-selected {
  background: rgba(37, 99, 235, 0.1);
  color: var(--primary-color);
  font-weight: 500;
}

.no-options {
  padding: 12px;
  text-align: center;
  color: var(--text-light);
  font-size: 13px;
  font-style: italic;
}
</style>
