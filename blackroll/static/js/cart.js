/**
 * Управление корзиной blackRoll
 * Работа с API корзины и отображение
 */

// Состояние корзины
let cartState = {
    items: [],
    totalCount: 0
};

/**
 * Обновляет счетчик товаров в шапке
 */
async function updateCartCount() {
    try {
        const response = await fetch('/api/cart');
        if (!response.ok) throw new Error('Ошибка получения корзины');
        const data = await response.json();
        
        const countElement = document.getElementById('cartCount');
        if (countElement) {
            countElement.textContent = data.count || 0;
        }
        
        cartState.totalCount = data.count || 0;
    } catch (error) {
        console.error('Ошибка обновления счетчика корзины:', error);
    }
}

/**
 * Добавляет товар в корзину
 * @param {number} productId - ID товара
 * @param {number} quantity - количество
 */
async function addToCart(productId, quantity = 1) {
    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: productId, quantity })
        });
        
        if (!response.ok) throw new Error('Ошибка добавления в корзину');
        
        const result = await response.json();
        if (result.success) {
            updateCartCount();
            showNotification('Товар добавлен в корзину');
        }
    } catch (error) {
        console.error('Ошибка при добавлении в корзину:', error);
    }
}

/**
 * Удаляет товар из корзины
 * @param {number} productId - ID товара
 */
async function removeFromCart(productId) {
    try {
        const response = await fetch('/api/cart/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: productId })
        });
        
        if (!response.ok) throw new Error('Ошибка удаления из корзины');
        
        const result = await response.json();
        if (result.success) {
            updateCartCount();
            loadCartItems(); // Перезагружаем содержимое модального окна
        }
    } catch (error) {
        console.error('Ошибка при удалении из корзины:', error);
    }
}

/**
 * Обновляет количество товара в корзине
 * @param {number} productId - ID товара
 * @param {number} quantity - новое количество
 */
async function updateCartItem(productId, quantity) {
    try {
        const response = await fetch('/api/cart/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: productId, quantity })
        });
        
        if (!response.ok) throw new Error('Ошибка обновления корзины');
        
        const result = await response.json();
        if (result.success) {
            updateCartCount();
            loadCartItems();
        }
    } catch (error) {
        console.error('Ошибка при обновлении корзины:', error);
    }
}

/**
 * Загружает и отображает товары в модальном окне корзины
 */
async function loadCartItems() {
    try {
        // Получаем корзину с сервера
        const cartResponse = await fetch('/api/cart');
        if (!cartResponse.ok) throw new Error('Ошибка получения корзины');
        const cartData = await cartResponse.json();
        
        // Если корзина пуста
        if (!cartData.items || cartData.items.length === 0) {
            const cartItemsEl = document.getElementById('cartItems');
            if (cartItemsEl) {
                cartItemsEl.innerHTML = '<p class="empty-cart-msg">Корзина пуста</p>';
            }
            updateCartTotal(0);
            return;
        }
        
        // Загружаем каталог для получения цен и названий
        const catalogResponse = await fetch('/api/catalog');
        if (!catalogResponse.ok) throw new Error('Ошибка загрузки каталога');
        const catalog = await catalogResponse.json();
        
        // Создаем мапу товаров для быстрого доступа
        const catalogMap = {};
        catalog.forEach(item => {
            catalogMap[item.id] = item;
        });
        
        // Формируем HTML корзины
        let total = 0;
        const itemsHtml = cartData.items.map(item => {
            const product = catalogMap[item.id];
            if (!product) return '';
            
            const itemTotal = product.price * item.quantity;
            total += itemTotal;
            
            return `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${product.name}</div>
                        <div class="cart-item-price">${product.price} ₽ × ${item.quantity}</div>
                    </div>
                    <div class="cart-item-controls">
                        <div class="qty-control">
                            <button onclick="updateCartItem(${item.id}, ${item.quantity - 1})">−</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateCartItem(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                        <button class="remove-item" onclick="removeFromCart(${item.id})">&times;</button>
                    </div>
                </div>
            `;
        }).join('');
        
        const cartItemsEl = document.getElementById('cartItems');
        if (cartItemsEl) {
            cartItemsEl.innerHTML = itemsHtml;
        }
        
        updateCartTotal(total);
        
    } catch (error) {
        console.error('Ошибка загрузки товаров корзины:', error);
    }
}

/**
 * Обновляет итоговую сумму в корзине
 * @param {number} total - сумма
 */
function updateCartTotal(total) {
    const totalEl = document.getElementById('cartTotalSum');
    if (totalEl) {
        totalEl.textContent = new Intl.NumberFormat('ru-RU').format(total) + ' ₽';
    }
}

/**
 * Показывает уведомление
 * @param {string} message - текст уведомления
 */
function showNotification(message) {
    // Простая реализация через console или можно добавить UI уведомление
    console.log('Уведомление:', message);
    
    // Можно добавить красивый toast notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2ecc71;
        color: #0a0a0a;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: 600;
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

/**
 * Открывает модальное окно корзины
 */
function openCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.classList.add('active');
        loadCartItems();
    }
}

/**
 * Закрывает модальное окно корзины
 */
function closeCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Переход на страницу оформления заказа
 */
function goToCheckout() {
    window.location.href = '/checkout';
}

// Инициализация обработчиков событий
document.addEventListener('DOMContentLoaded', () => {
    // Кнопка открытия корзины
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', openCartModal);
    }
    
    // Кнопка закрытия корзины
    const closeCart = document.getElementById('closeCart');
    if (closeCart) {
        closeCart.addEventListener('click', closeCartModal);
    }
    
    // Закрытие по клику вне модального окна
    const modalOverlay = document.getElementById('cartModal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeCartModal();
            }
        });
    }
    
    // Кнопка оформления заказа
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', goToCheckout);
    }
    
    // Обновляем счетчик при загрузке
    updateCartCount();
});
