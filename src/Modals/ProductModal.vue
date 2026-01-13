<script>
// Импортируем из config.js
import { API_BASE_URL, API_KEY } from '../../config';

export default {
  props: {
    isViewModalProduct: Boolean,
    id: {
      type: Number,
      required: true,
      default: 0
    },
    category: String,
  },
  data() {
    return {
      productData: {},
      isLoading: false,
      error: null
    }
  },
  watch: {
    // Наблюдаем за изменением id и загружаем товар
    id: {
      immediate: true,
      handler(newId, oldId) {
        if (newId && newId !== oldId) {
          this.loadProduct();
        }
      }
    },
    // Наблюдаем за открытием модалки
    isViewModalProduct: {
      handler(isOpen) {
        if (isOpen && this.id) {
          this.loadProduct();
        }
      },
      immediate: true
    }
  },
  methods: {
    closeModal() {
      this.$emit('close-product-modal');
    },

    async loadProduct() {
      if (!this.id) return;

      this.isLoading = true;
      this.error = null;

      try {
        const params = new URLSearchParams({
          api_key: API_KEY,
        });

        const response = await fetch(`${API_BASE_URL}/product/${this.id}?${params.toString()}`, {
          headers: { 'accept': 'application/json' }
        });

        if (!response.ok) {
          throw new Error(`Ошибка загрузки: ${response.status}`);
        }

        const data = await response.json();
        if (data) {
          this.productData = data;
        }
      } catch (error) {
        console.error('Ошибка загрузки товара:', error);
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },

    addToCart() {
      this.$emit('add-to-cart', this.productData);
    }
  }
}
</script>

<template>
  <!-- Модальное окно -->
  <div class="modal-overlay" v-show="isViewModalProduct" @click.self="closeModal">
    <div class="modal-product">
      <!-- Кнопка закрытия -->
      <button class="modal-close" @click="closeModal">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>

      <!-- Контент модального окна -->
      <div class="modal-content">
        <!-- Изображение товара -->
        <div class="product-image">
          <img :src="productData.img" :alt="productData.name" />
        </div>

        <!-- Информация о товаре -->
        <div class="product-info">
          <h2 class="product-title">{{ productData.name }}</h2>

          <!-- Рейтинг -->
          <div class="product-rating">
            <div class="stars">
              <span class="star" v-for="n in 5" :key="n">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 1L13 7L19 7.75L14.5 12.25L15.5 19L10 16L4.5 19L5.5 12.25L1 7.75L7 7L10 1Z"
                        :fill="n <= Math.floor(productData.rating) ? '#FFD700' : '#E0E0E0'"/>
                </svg>
              </span>
            </div>
            <span class="rating-value">{{ productData.rating }}</span>
            <span class="rating-count">({{ productData.rating_count }} отзывов)</span>
          </div>

          <!-- Цена -->
          <div class="product-price">
            <span class="price">{{ productData.price }} ₽</span>
          </div>

          <div class="product-description" v-show="!!category">
            <h3>Категория: </h3>
            <p>{{ category }}</p>
          </div>
          <!-- Описание -->
          <div class="product-description" v-if="productData.description">
            <h3>Описание</h3>
            <p>{{ productData.description }}</p>
          </div>
          <div class="product-description" v-else>
            <p class="no-description">Описание отсутствует</p>
          </div>

          <!-- Кнопка добавления в корзину -->
          <button class="add-to-cart-btn" @click="addToCart">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="margin-right: 8px;">
              <path d="M6 16C4.9 16 4.01 16.9 4.01 18C4.01 19.1 4.9 20 6 20C7.1 20 8 19.1 8 18C8 16.9 7.1 16 6 16ZM0 0V2H2L5.6 9.59L4.24 12.04C4.09 12.32 4 12.65 4 13C4 14.1 4.9 15 6 15H18V13H6.42C6.28 13 6.17 12.89 6.17 12.75L6.2 12.63L7.1 11H14.55C15.3 11 15.96 10.58 16.3 9.97L19.88 3.48C19.96 3.34 20 3.17 20 3C20 2.45 19.55 2 19 2H4.21L3.27 0H0ZM16 16C14.9 16 14.01 16.9 14.01 18C14.01 19.1 14.9 20 16 20C17.1 20 18 19.1 18 18C18 16.9 17.1 16 16 16Z"
                    fill="white"/>
            </svg>
            Добавить в корзину
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Затемненный фон */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

/* Само модальное окно */
.modal-product {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s ease;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* Кнопка закрытия */
.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s ease;
  z-index: 10;
}

.modal-close:hover {
  background-color: #f5f5f5;
  color: #333;
}

/* Контент модалки */
.modal-content {
  display: flex;
  flex-direction: column;
  padding: 40px;
}

@media (min-width: 768px) {
  .modal-content {
    flex-direction: row;
    gap: 40px;
  }
}

/* Изображение товара */
.product-image {
  flex: 1;
  min-width: 0;
}

.product-image img {
  width: 100%;
  height: auto;
  border-radius: 12px;
  object-fit: cover;
  max-height: 400px;
}

/* Информация о товаре */
.product-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.product-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

/* Рейтинг */
.product-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  display: flex;
  align-items: center;
}

.rating-value {
  font-weight: 600;
  color: #333;
}

.rating-count {
  color: #666;
  font-size: 14px;
}

/* Цена */
.product-price {
  margin-bottom: 24px;
}

.price {
  font-size: 32px;
  font-weight: 700;
  color: #2E7D32;
}

/* Описание */
.product-description {
  margin-bottom: 32px;
}

.product-description h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.product-description p {
  color: #666;
  line-height: 1.6;
}

.no-description {
  color: #999;
  font-style: italic;
}

/* Кнопка добавления в корзину */
.add-to-cart-btn {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin-top: auto;
}

.add-to-cart-btn:hover {
  background: linear-gradient(135deg, #43A047, #1B5E20);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 125, 50, 0.3);
}

.add-to-cart-btn:active {
  transform: translateY(0);
}

/* Анимации */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Адаптивность */
@media (max-width: 767px) {
  .modal-product {
    width: 95%;
    margin: 20px;
  }

  .modal-content {
    padding: 20px;
  }

  .product-title {
    font-size: 24px;
  }

  .price {
    font-size: 28px;
  }

  .add-to-cart-btn {
    padding: 14px 24px;
    font-size: 16px;
  }
}
</style>

