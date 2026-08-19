/**
 * Оформление заказа blackRoll
 * Обработка формы и отправка заказа на сервер
 */

let checkoutItems = [];
let catalogData = [];

/**
 * Загружает данные для страницы оформления заказа
 */
async function initCheckout() {
    try {
        // Загружаем корзину
        const cartResponse = await fetch('/api/cart');
        if (!cartResponse.ok) throw new Error('Ошибка получения корзины');
        const cartData = await cartResponse.json();
        
        if (!cartData.items || cartData.items.length === 0) {
            document.getElementById('checkoutItems').innerHTML = 
                '<p class="empty-cart-msg">Ваша корзина пуста. Добавьте товары перед оформлением.</p>';
            document.getElementById('checkoutTotalSum').textContent = '0 ₽';
            document.getElementById('orderForm').style.display = 'none';
            return;
        }
        
        // Загружаем каталог для получения деталей товаров
        const catalogResponse = await fetch('/api/catalog');
        if (!catalogResponse.ok) throw new Error('Ошибка загрузки каталога');
        catalogData = await catalogResponse.json();
        
        // Создаем мапу товаров
        const catalogMap = {};
        catalogData.forEach(item => {
            catalogMap[item.id] = item;
        });
        
        // Формируем список товаров
        let total = 0;
        checkoutItems = cartData.items.map(item => {
            const product = catalogMap[item.id];
            if (!product) return null;
            
            const itemTotal = product.price * item.quantity;
            total += itemTotal;
            
            return {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                total: itemTotal
            };
        }).filter(Boolean); // Убираем null
        
        // Отображаем товары
        renderCheckoutItems();
        updateCheckoutTotal(total);
        
    } catch (error) {
        console.error('Ошибка инициализации оформления:', error);
    }
}

/**
 * Рендерит список товаров в чекауте
 */
function renderCheckoutItems() {
    const container = document.getElementById('checkoutItems');
    if (!container) return;
    
    container.innerHTML = checkoutItems.map(item => `
        <div class="checkout-item">
            <div>
                <strong>${item.name}</strong><br>
                <small>${item.price} ₽ × ${item.quantity}</small>
            </div>
            <div>${item.total} ₽</div>
        </div>
    `).join('');
}

/**
 * Обновляет итоговую сумму
 */
function updateCheckoutTotal(total) {
    const el = document.getElementById('checkoutTotalSum');
    if (el) {
        el.textContent = new Intl.NumberFormat('ru-RU').format(total) + ' ₽';
    }
}

/**
 * Отправляет заказ на сервер
 */
async function submitOrder(formData) {
    try {
        const response = await fetch('/api/orders/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: checkoutItems,
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                payment_method: formData.payment_method,
                comment: formData.comment
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Ошибка создания заказа');
        }
        
        if (result.success) {
            // Очищаем корзину
            await fetch('/api/cart/clear', { method: 'POST' });
            
            // Показываем успех
            showSuccessModal(result.order_id);
        } else {
            throw new Error(result.error || 'Неизвестная ошибка');
        }
        
    } catch (error) {
        console.error('Ошибка отправки заказа:', error);
        alert('Ошибка при оформлении заказа: ' + error.message);
    }
}

/**
 * Показывает модальное окно успеха
 */
function showSuccessModal(orderId) {
    document.getElementById('orderIdDisplay').textContent = '#' + orderId;
    document.getElementById('successModal').style.display = 'flex';
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initCheckout();
    
    // Обработчик формы
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('customerName').value.trim(),
                phone: document.getElementById('customerPhone').value.trim(),
                address: document.getElementById('customerAddress').value.trim(),
                payment_method: document.getElementById('paymentMethod').value,
                comment: document.getElementById('orderComment').value.trim()
            };
            
            // Валидация
            if (!formData.name || !formData.phone || !formData.address) {
                alert('Пожалуйста, заполните все обязательные поля');
                return;
            }
            
            // Отправка
            await submitOrder(formData);
        });
    }
});
