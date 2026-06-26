<template>
  <div class="search-view container mt-4">
    <div class="search-header">
      <div class="search-meta">
        <h2>Kết quả cho: <span class="query-text">"{{ query || 'Tất cả sản phẩm' }}"</span></h2>
        <p class="result-count">{{ filteredProducts.length }} sản phẩm</p>
      </div>
    </div>

    <div class="search-layout">
      <!-- Filters Sidebar -->
      <aside class="filters">
        <div class="filter-header">
          <h3 class="filter-title">Bộ Lọc</h3>
          <button class="reset-btn" @click="resetFilters" v-if="hasActiveFilters">Xóa lọc</button>
        </div>

        <!-- Category -->
        <div class="filter-group">
          <h4>Danh Mục</h4>
          <ul class="filter-list">
            <li v-for="cat in categories" :key="cat.id">
              <label :class="{ active: selectedCategories.includes(cat.id) }">
                <input type="checkbox" :value="cat.id" v-model="selectedCategories">
                <span class="check-label">{{ cat.name }}</span>
              </label>
            </li>
          </ul>
        </div>

        <!-- Price Range -->
        <div class="filter-group">
          <h4>Khoảng Giá</h4>
          <div class="price-presets">
            <button
              v-for="preset in pricePresets"
              :key="preset.label"
              class="preset-btn"
              :class="{ active: minPrice === preset.min && maxPrice === preset.max }"
              @click="setPresetPrice(preset)"
            >{{ preset.label }}</button>
          </div>
        </div>


        <!-- Rating -->
        <div class="filter-group">
          <h4>Đánh Giá</h4>
          <div class="rating-options">
            <label
              v-for="r in [5,4,3]"
              :key="r"
              class="rating-label"
              :class="{ active: minRating === r }"
              @click="minRating = minRating === r ? 0 : r"
            >
              <span class="stars">{{ '★'.repeat(r) }}{{ '☆'.repeat(5-r) }}</span>
              <span class="rating-text">trở lên</span>
            </label>
          </div>
        </div>
      </aside>

      <!-- Results -->
      <div class="results">
        <!-- Sort Bar -->
        <div class="sort-bar">
          <span class="sort-label">Sắp xếp:</span>
          <button
            v-for="opt in sortOptions"
            :key="opt.value"
            class="sort-btn"
            :class="{ active: sortBy === opt.value }"
            @click="sortBy = opt.value"
          >{{ opt.label }}</button>
        </div>

        <!-- Active Filter Tags -->
        <div class="active-filters" v-if="hasActiveFilters">
          <span class="filter-tag" v-if="selectedCategories.length > 0">
            Danh mục: {{ selectedCategories.length }} đã chọn
            <button @click="selectedCategories = []">✕</button>
          </span>
          <span class="filter-tag" v-if="minPrice || maxPrice">
            Giá: {{ minPrice ? '₫'+formatPrice(minPrice) : '0' }} — {{ maxPrice ? '₫'+formatPrice(maxPrice) : '∞' }}
            <button @click="minPrice = null; maxPrice = null">✕</button>
          </span>
          <span class="filter-tag" v-if="minRating > 0">
            Từ {{ minRating }} sao
            <button @click="minRating = 0">✕</button>
          </span>
        </div>

        <div class="product-grid" v-if="filteredProducts.length > 0">
          <router-link
            :to="`/product/${product.id}`"
            class="product-card"
            v-for="product in filteredProducts"
            :key="product.id"
          >
            <div class="product-image">
              <img :src="product.thumbnailUrl" :alt="product.name">
            </div>
            <div class="product-info">
              <h4 class="product-name">{{ product.name }}</h4>
              <div class="product-price-row">
                <div class="product-price">₫{{ formatPrice(product.basePrice) }}</div>
              </div>
              <div class="product-rating">
                <span class="stars">★★★★★</span>
                <span class="sold">Đã bán 1k+</span>
              </div>
            </div>
          </router-link>
        </div>
        <div v-else class="empty-state">
          <p class="empty-text">Không tìm thấy sản phẩm nào phù hợp.</p>
          <button class="btn btn-outline mt-2" @click="resetFilters">Xóa bộ lọc</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { products as allProducts, categories } from '../../mock/data';

const route = useRoute();

const query = ref(route.query.keyword || '');
const selectedCategories = ref([]);
const minPrice = ref(null);
const maxPrice = ref(null);
const minRating = ref(0);
const sortBy = ref('newest');

const sortOptions = [
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Giá tăng dần', value: 'price_asc' },
  { label: 'Giá giảm dần', value: 'price_desc' },
];

const pricePresets = [
  { label: 'Dưới 200K', min: null, max: 200000 },
  { label: '200K - 2TR', min: 200000, max: 2000000 },
  { label: '2TR - 10TR', min: 2000000, max: 10000000 },
  { label: 'Trên 10TR', min: 10000000, max: null },
];

watch(() => route.query.keyword, (newKeyword) => {
  query.value = newKeyword || '';
});

const setPresetPrice = (preset) => {
  if (minPrice.value === preset.min && maxPrice.value === preset.max) {
    minPrice.value = null;
    maxPrice.value = null;
  } else {
    minPrice.value = preset.min;
    maxPrice.value = preset.max;
  }
};

const hasActiveFilters = computed(() =>
  selectedCategories.value.length > 0 || minPrice.value || maxPrice.value || minRating.value > 0
);

const filteredProducts = computed(() => {
  let result = allProducts.filter(p => {
    if (query.value && !p.name.toLowerCase().includes(query.value.toLowerCase())) return false;
    if (selectedCategories.value.length > 0 && !selectedCategories.value.includes(p.categoryId)) return false;
    if (minPrice.value && p.basePrice < minPrice.value) return false;
    if (maxPrice.value && p.basePrice > maxPrice.value) return false;
    if (minRating.value > 0 && p.ratingAverage < minRating.value) return false;
    return true;
  });

  switch (sortBy.value) {
    case 'price_asc': return [...result].sort((a, b) => a.basePrice - b.basePrice);
    case 'price_desc': return [...result].sort((a, b) => b.basePrice - a.basePrice);
    case 'popular': return [...result].sort((a, b) => b.ratingAverage - a.ratingAverage);
    case 'newest': return [...result].sort((a, b) => b.id - a.id);
    default: return result;
  }
});

const resetFilters = () => {
  selectedCategories.value = [];
  minPrice.value = null;
  maxPrice.value = null;
  minRating.value = 0;
  sortBy.value = 'newest';
};

const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
</script>

<style scoped>
.mt-4 { margin-top: 2rem; margin-bottom: 4rem; }
.mt-2 { margin-top: 12px; }

.search-header {
  margin-bottom: 28px;
}
.search-meta h2 {
  font-size: 22px;
  color: var(--text-dark);
  font-weight: 600;
}
.query-text {
  color: var(--primary-color);
}
.result-count {
  font-size: 14px;
  color: var(--text-light);
  margin-top: 4px;
}

.search-layout {
  display: flex;
  gap: 28px;
  align-items: flex-start;
}

/* Sidebar Filters */
.filters {
  width: 240px;
  flex-shrink: 0;
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  position: sticky;
  top: 90px;
}
.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
}
.filter-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-dark);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.reset-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
  padding: 0;
}
.reset-btn:hover { text-decoration: underline; }

.filter-group {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}
.filter-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
.filter-group h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 14px;
  color: var(--text-dark);
}
.filter-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.filter-list label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  cursor: pointer;
  color: var(--text-color);
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
  border: 1px solid transparent;
}
.filter-list label:hover { background: var(--bg-color); }
.filter-list label.active {
  background: rgba(14, 165, 233, 0.07);
  color: var(--primary-color);
  border-color: rgba(14, 165, 233, 0.2);
  font-weight: 500;
}
.filter-list input[type="checkbox"] { display: none; }
.check-label { flex: 1; }

/* Price presets */
.price-presets {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}
.preset-btn {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--border-color);
  background: var(--white);
  border-radius: var(--radius-sm);
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: var(--transition-fast);
  color: var(--text-color);
}
.preset-btn:hover { border-color: var(--primary-color); color: var(--primary-color); }
.preset-btn.active {
  background: rgba(14, 165, 233, 0.07);
  border-color: var(--primary-color);
  color: var(--primary-color);
  font-weight: 500;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}
.price-inputs input {
  flex: 1;
  padding: 9px 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 13px;
  outline: none;
  width: 0;
  transition: var(--transition-fast);
}
.price-inputs input:focus { border-color: var(--primary-color); }
.dash { color: var(--text-light); font-weight: 500; }

/* Rating Options */
.rating-options { display: flex; flex-direction: column; gap: 8px; }
.rating-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  border: 1px solid transparent;
}
.rating-label:hover { background: var(--bg-color); }
.rating-label.active {
  background: rgba(14, 165, 233, 0.07);
  border-color: rgba(14, 165, 233, 0.2);
}
.rating-label .stars { color: #FBBF24; font-size: 15px; letter-spacing: 1px; }
.rating-text { font-size: 13px; color: var(--text-color); }

/* Results */
.results { flex: 1; min-width: 0; }

.sort-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--white);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  flex-wrap: wrap;
}
.sort-label {
  font-size: 14px;
  color: var(--text-light);
  font-weight: 500;
  margin-right: 4px;
}
.sort-btn {
  padding: 7px 14px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  font-size: 13px;
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-color);
  font-weight: 500;
}
.sort-btn:hover { background: var(--bg-color); color: var(--primary-color); }
.sort-btn.active {
  background: var(--primary-color);
  color: var(--white);
  border-color: var(--primary-color);
}

/* Active filter tags */
.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(14, 165, 233, 0.08);
  border: 1px solid rgba(14, 165, 233, 0.2);
  color: var(--primary-color);
  padding: 5px 10px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
}
.filter-tag button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--primary-color);
  font-size: 14px;
  line-height: 1;
  padding: 0;
  display: flex;
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
  gap: 16px;
}
.product-card {
  background: var(--white);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}
.product-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-hover);
  border-color: transparent;
}
.product-image {
  position: relative;
  overflow: hidden;
}
.product-image img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.product-card:hover .product-image img { transform: scale(1.05); }
.product-info {
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.product-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-dark);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 10px;
  line-height: 1.4;
}
.product-price-row { margin-top: auto; margin-bottom: 8px; }
.product-price { color: var(--primary-color); font-size: 16px; font-weight: 700; }
.product-rating {
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-light);
}
.stars { color: #FBBF24; letter-spacing: 2px; }

.empty-state {
  text-align: center;
  padding: 80px 60px;
  color: var(--text-light);
  background: var(--white);
  border-radius: var(--radius-lg);
}
.empty-text {
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: var(--text-dark);
  margin-bottom: 12px;
}
</style>
