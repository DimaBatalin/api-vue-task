<script setup>
import { ref, onMounted, reactive, watch } from 'vue';
import CartModal from "@/Modals/CartModal.vue";
import ProductModal from "@/Modals/ProductModal.vue";
import { useCart } from "@/composables/useCart.js";
import {API_KEY, API_BASE_URL} from "../config.js";
import img from '@/assets/img.png';


const {
  cart,
  addToCart,
  cartItemsCount,
  loadCart
} = useCart();


// Состояние
const current_page = ref(1);
const products = ref([]);
const categories = ref([]);
const totalPages = ref(1);
const totalProducts = ref(0);
const isViewModalProduct = ref(false);
const CurrentProductId = ref(null);

let isCartOpen = ref(false);
// Фильтры
const filters = reactive({
  category_id: 1,
  price_min: null,
  price_max: null,
  rating_min: null,
  search: '',
  sort: 'default'
});
// Загрузка категорий
async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/category?api_key=${API_KEY}`, {
      headers: { 'accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

    categories.value = await response.json();
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error);
  }
}

// Загрузка товаров
async function loadProducts() {
  products.value = [];
  try {
    const params = new URLSearchParams({
      api_key: API_KEY,
      page: current_page.value
    });

    if (filters.category_id) params.append('category_id', filters.category_id);

    const response = await fetch(`${API_BASE_URL}/product?${params.toString()}`, {
      headers: { 'accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

    const data = await response.json();

    for (const product of data.items) {
      // Фильтр по цене
      if (!!filters.price_min && !!filters.price_max) {
        if (!(product.price >= filters.price_min && product.price <= filters.price_max)) {
          continue;
        }
      }

      // Фильтр по минимальной цене
      if (!!filters.price_min && product.price < filters.price_min) {
        continue;
      }

      // Фильтр по максимальной цене
      if (!!filters.price_max && product.price > filters.price_max) {
        continue;
      }

      // Фильтр по минимальному рейтингу
      if (!!filters.rating_min && product.rating < filters.rating_min) {
        continue;
      }

      // Фильтр по поиску
      if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
        continue;
      }

      product.category_id = filters.category_id;
      products.value.push(product);
    }

    totalPages.value = data.total_pages || 1;
    totalProducts.value = data.total || products.value.length;
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error);
    products.value = [];
  }
}

async function openProduct(productId) {
  CurrentProductId.value = productId;
  isViewModalProduct.value = true;
}

// Сброс фильтров
function resetFilters() {
  filters.category_id = 1;
  filters.price_min = null;
  filters.price_max = null;
  filters.rating_min = null;
  filters.search = '';
  filters.sort = 'default';
}

// Сброс на первую страницу при изменении фильтров
watch(filters, () => {
  current_page.value = 1;
  loadProducts();
});

onMounted(() => {
  loadCart()
  loadCategories();
  loadProducts();
});
</script>

<template>
  <div class="container">
    <!-- Модальное окно товара -->
    <ProductModal
        :category="categories.length ? categories[filters.category_id-1]?.name : String(filters.category_id)"
        :id="CurrentProductId"
        :is-view-modal-product="isViewModalProduct"
        @close-product-modal="isViewModalProduct=false"
        @add-to-cart="addToCart"
    />

    <CartModal
        :isOpen="isCartOpen"
        v-if="isCartOpen"
        @close="isCartOpen = false"
    />

    <!-- Иконка корзины с количеством -->
    <div class="cart-icon" @click="isCartOpen = true" v-show="!isViewModalProduct">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="cart-badge" v-if="cartItemsCount > 0">{{ cartItemsCount }}</span>
    </div>

    <aside>
      <h3>Фильтры</h3>

      <div class="filter-group">
        <label>Категория:</label>
        <select v-model="filters.category_id">
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Цена от:</label>
        <input type="number" v-model="filters.price_min" placeholder="Мин">
        <label>до:</label>
        <input type="number" v-model="filters.price_max" placeholder="Макс">
      </div>

      <div class="filter-group">
        <label>Рейтинг от:</label>
        <select v-model="filters.rating_min">
          <option :value="null">Любой</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Поиск:</label>
        <input type="text" v-model="filters.search" placeholder="Название товара...">
      </div>

      <button @click="resetFilters">Сбросить фильтры</button>
    </aside>

    <main>
      <h2>Товары ({{ totalProducts }})</h2>

      <div v-if="products.length" class="products-grid">
        <div v-for="product in products" :key="product.id" class="product-card">
          <div class="product-image" @click="openProduct(product.id)">
            <img alt="Нет картинки" :src="product.img" v-if="product.img">
            <img v-else :src="img" alt=""/>
          </div>
          <div class="product-info">
            <h3 @click="openProduct(product.id)" class="product-title">{{ product.name }}</h3>
            <p class="price">{{ product.price }} ₽</p>
            <p>Категория: {{
                categories.find(c => c.id === product.category_id)?.name || product.category_id
              }}</p>
            <div class="rating">
              <span v-for="n in 5" :key="n">
                {{ product.rating >= n ? '★' : '☆' }}
              </span>
              <span>({{ product.rating || 0 }})</span>
            </div>
            <button class="add-to-cart" @click.stop="addToCart(product)">
              {{ cart.find(item => item.id === product.id) ? 'В корзине (' + cart.find(item => item.id === product.id).quantity + ')' : 'В корзину' }}
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="products.length === 0 && filters.category_id">
        <p>Нет товаров в выбранной категории</p>
      </div>

      <div v-else>
        Загрузка...
      </div>

      <!-- Пагинация -->
      <div class="pagination">
        <button
            @click="current_page--; loadProducts();"
            :disabled="current_page <= 1"
        >
          ←
        </button>

        <span v-for="page in Math.min(5, totalPages)" :key="page">
          <button
              @click="current_page = page; loadProducts();"
              :class="{ active: current_page === page }"
          >
            {{ page }}
          </button>
        </span>

        <button
            @click="current_page++; loadProducts();"
            :disabled="current_page >= totalPages"
        >
          →
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Добавляем переменные для корзины */
:root {
  --cart-width: 350px;
  --primary-color: #4CAF50;
  --secondary-color: #45a049;
  --danger-color: #f44336;
}

.container {
  display: flex;
  gap: 30px;
  position: relative;
}

/* Стили для иконки корзины */
.cart-icon {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border: 2px solid #4CAF50;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
}

.cart-icon:hover {
  background: #4CAF50;
  color: white;
  transform: scale(1.05);
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #f44336;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}


.product-card {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.product-image {
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-image:hover img {
  transform: scale(1.05);
}

.product-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-title {
  margin: 0 0 10px 0;
  cursor: pointer;
  color: #333;
  transition: color 0.2s;
}

.product-title:hover {
  color: #4CAF50;
}

.price {
  font-size: 24px;
  font-weight: bold;
  color: #4CAF50;
  margin: 10px 0;
}

.add-to-cart {
  margin-top: auto;
  padding: 12px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.add-to-cart:hover {
  background: #45a049;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

aside {
  width: 250px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.filter-group input,
.filter-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.products-grid {
  display: flex;
  gap: 25px;
  margin: 20px 0;
}

.rating {
  color: #ffc107;
  margin: 10px 0;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}

.pagination button {
  padding: 10px 15px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button.active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Адаптивность */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  aside {
    width: 100%;
    position: static;
  }
  .products-grid {
    flex-direction: column;
    margin: 20px;
  }
  .cart-icon {
    width: 50px;
    height: 50px;
  }
}
</style>
