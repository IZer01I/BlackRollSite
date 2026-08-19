/**
 * Основной JavaScript blackRoll
 * Общие функции и утилиты
 */

// Глобальное состояние каталога
let catalogData = [];

/**
 * Загружает каталог товаров с сервера
 */
async function loadCatalog() {
    try {
        const response = await fetch('/api/catalog');
        if (!response.ok) throw new Error('Ошибка загрузки каталога');
        catalogData = await response.json();
        renderProducts(catalogData);
    } catch (error) {
        console.error('Ошибка при загрузке каталога:', error);
    }
}

/**
 * Рендерит карточки товаров в сетку
 * @param {Array} products - массив товаров
 */
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    if (products.length === 0) {
        grid.innerHTML = '<p class="empty-cart-msg">Товары не найдены</p>';
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category}" onclick="goToProduct(${product.id})">
            <div class="product-image">
                <div class="image-placeholder">${product.name[0]}</div>
                ${product.spicy ? '<span class="spicy-badge">🌶 Острый</span>' : ''}
            </div>
            <div class="product-info-card">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-meta-card">
                    <span>${product.weight} г</span>
                    <span>${product.category}</span>
                </div>
                <div class="product-footer">
                    <span class="price">${product.price} ₽</span>
                    <button class="add-btn" onclick="event.stopPropagation(); addToCart(${product.id}, 1)">+</button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Переход на страницу товара
 * @param {number} productId - ID товара
 */
function goToProduct(productId) {
    window.location.href = `/product/${productId}`;
}

/**
 * Фильтрация товаров по категории
 * @param {string} category - категория или 'all'
 */
function filterProducts(category) {
    if (category === 'all') {
        renderProducts(catalogData);
    } else {
        const filtered = catalogData.filter(p => p.category === category);
        renderProducts(filtered);
    }
    
    // Обновляем активную кнопку фильтра
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
}

/**
 * Инициализация фильтров категорий
 */
function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filterProducts(btn.dataset.category);
        });
    });
}

/**
 * Форматирование числа в валюту
 * @param {number} value - число
 * @returns {string} отформатированная строка
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    updateCartCount();
});
