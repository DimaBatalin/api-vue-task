import { ref, computed } from 'vue';

const cart = ref([]);

function loadCart() {
    const saved = localStorage.getItem('cart');
    if (saved) {
        try {
            cart.value = JSON.parse(saved);
        } catch {
            cart.value = [];
        }
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart.value));
}

function addToCart(product) {
    const item = cart.value.find(i => i.id === product.id);
    if (item) {
        item.quantity++;
    } else {
        cart.value.push({
            ...product,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    saveCart();
}

function removeFromCart(id) {
    cart.value = cart.value.filter(i => i.id !== id);
    saveCart();
}

function increaseQuantity(id) {
    const item = cart.value.find(i => i.id === id);
    if (item) item.quantity++;
    saveCart();
}

function decreaseQuantity(id) {
    const item = cart.value.find(i => i.id === id);
    if (!item) return;

    if (item.quantity > 1) item.quantity--;
    else removeFromCart(id);

    saveCart();
}

const cartItemsCount = computed(() =>
    cart.value.reduce((s, i) => s + i.quantity, 0)
);

const cartTotal = computed(() =>
    cart.value.reduce((s, i) => s + i.price * i.quantity, 0)
);

export function useCart() {
    return {
        cart,
        loadCart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        cartItemsCount,
        cartTotal
    };
}
