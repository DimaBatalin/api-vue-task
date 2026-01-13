<script setup>
import {ref, computed, onMounted} from "vue";
import { useCart } from '@/composables/useCart';

const {
  cart,
  cartTotal,
  cartItemsCount,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity
} = useCart();

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close']);

// Загрузка корзины из localStorage при инициализации
function loadCartFromStorage() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    try {
      cart.value = JSON.parse(savedCart);
    } catch (error) {
      console.error('Ошибка загрузки корзины из localStorage:', error);
      cart.value = [];
    }
  }
}

// Сохранение корзины в localStorage
function saveCartToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart.value));
}


// Очистка корзины
function clearCart() {
  if (confirm('Очистить всю корзину?')) {
    cart.value = [];
    saveCartToStorage();
    showNotification('Корзина очищена');
  }
}

// Уведомления
function showNotification(message) {
  // Создаем уведомление
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 10000;
    animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;

  document.body.appendChild(notification);

  // Удаляем уведомление через 3 секунды
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}


onMounted(() => {
  loadCartFromStorage();
})
</script>

<template>
  <!-- Панель корзины -->
  <div class="cart-panel" :class="{ 'cart-open': isOpen }" v-show="isOpen">
    <div class="cart-header">
      <h3>Корзина ({{ cartItemsCount }})</h3>
      <button class="close-cart" @click="$emit('close')">×</button>
    </div>

    <div v-if="cart.length > 0" class="cart-items">
      <div v-for="item in cart" :key="item.id" class="cart-item">
        <img :src="item.img" :alt="item.name" class="cart-item-img">

        <div class="cart-item-info">
          <h4>{{ item.name }}</h4>
          <p class="cart-item-price">
            {{ item.price }} ₽ × {{ item.quantity }} = {{ item.price * item.quantity }} ₽
          </p>
        </div>

        <div class="cart-item-actions">
          <button class="quantity-btn" @click="decreaseQuantity(item.id)">−</button>
          <span class="quantity">{{ item.quantity }}</span>
          <button class="quantity-btn" @click="increaseQuantity(item.id)">+</button>
          <button class="remove-btn" @click="removeFromCart(item.id)">×</button>
        </div>
      </div>
    </div>

    <div v-else class="empty-cart">
      <p>Корзина пуста</p>
    </div>

    <div v-if="cart.length > 0" class="cart-footer">
      <div class="cart-total">
        <span>Итого:</span>
        <span class="total-price">{{ cartTotal }} ₽</span>
      </div>

      <button class="clear-cart-btn" @click="clearCart">
        Очистить корзину
      </button>

      <button class="checkout-btn">
        Оформить заказ
      </button>
    </div>
  </div>

  <!-- Оверлей ВСЕГДА вне панели -->
  <div
      v-if="isOpen"
      class="cart-overlay"
      @click="$emit('close')"
  ></div>
</template>

<style scoped>
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

/* Панель корзины */
.cart-panel {
  position: fixed;
  top: 0;
  right: -400px;
  width: 350px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 15px rgba(0,0,0,0.1);
  z-index: 1001;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
}

.cart-open {
  right: 0;
}

.cart-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-cart {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-cart:hover {
  background: #f5f5f5;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 15px;
}

.cart-item-info {
  flex: 1;
}

.cart-item-info h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
}

.cart-item-price {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.cart-item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.quantity-btn:hover {
  background: #f0f0f0;
}

.quantity {
  min-width: 20px;
  text-align: center;
}

.remove-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #ffebee;
  color: #f44336;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #f44336;
  color: white;
}

.empty-cart {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.cart-footer {
  padding: 20px;
  border-top: 1px solid #eee;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
}

.total-price {
  color: #4CAF50;
  font-size: 24px;
}

.clear-cart-btn {
  width: 100%;
  padding: 12px;
  background: #ffebee;
  color: #f44336;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 10px;
  transition: all 0.2s;
}

.clear-cart-btn:hover {
  background: #f44336;
  color: white;
}

.checkout-btn {
  width: 100%;
  padding: 15px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s;
}

.checkout-btn:hover {
  background: #45a049;
}

/* Оверлей для корзины */
.cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
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

  .cart-panel {
    width: 100%;
    right: -100%;
  }

  .cart-open {
    right: 0;
  }

  .cart-icon {
    width: 50px;
    height: 50px;
  }
}
</style>