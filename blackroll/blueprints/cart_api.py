"""
Blueprint для API корзины.
Обрабатывает действия с корзиной (добавление, удаление, изменение количества).
В данном примере корзина хранится в сессии Flask.
"""
from flask import Blueprint, request, jsonify, session

cart_api_bp = Blueprint('cart_api', __name__)


def get_cart():
    """Получает корзину из сессии."""
    return session.get('cart', {})


def save_cart(cart):
    """Сохраняет корзину в сессию."""
    session['cart'] = cart


@cart_api_bp.route('/api/cart', methods=['GET'])
def get_cart_items():
    """Возвращает текущее состояние корзины."""
    cart = get_cart()
    # Преобразуем ключи (строки) в нужный формат ответа
    items = []
    total = 0
    for product_id, quantity in cart.items():
        items.append({
            'id': int(product_id),
            'quantity': quantity
        })
        # Цену пока не считаем тут, фронтенд сам подставит или сделаем отдельный эндпоинт
    return jsonify({'items': items, 'count': len(items)})


@cart_api_bp.route('/api/cart/add', methods=['POST'])
def add_to_cart():
    """Добавляет товар в корзину."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Нет данных'}), 400
    
    product_id = str(data.get('id'))
    quantity = data.get('quantity', 1)
    
    if not product_id:
        return jsonify({'error': 'Не указан ID товара'}), 400
    
    cart = get_cart()
    
    if product_id in cart:
        cart[product_id] += quantity
    else:
        cart[product_id] = quantity
    
    save_cart(cart)
    return jsonify({'success': True, 'cart_count': sum(cart.values())})


@cart_api_bp.route('/api/cart/remove', methods=['POST'])
def remove_from_cart():
    """Удаляет товар из корзины."""
    data = request.get_json()
    product_id = str(data.get('id'))
    
    cart = get_cart()
    if product_id in cart:
        del cart[product_id]
        save_cart(cart)
        return jsonify({'success': True, 'cart_count': sum(cart.values())})
    
    return jsonify({'error': 'Товар не найден в корзине'}), 404


@cart_api_bp.route('/api/cart/update', methods=['POST'])
def update_cart():
    """Обновляет количество товара в корзине."""
    data = request.get_json()
    product_id = str(data.get('id'))
    quantity = data.get('quantity', 0)
    
    cart = get_cart()
    
    if quantity <= 0:
        if product_id in cart:
            del cart[product_id]
    else:
        cart[product_id] = quantity
    
    save_cart(cart)
    return jsonify({'success': True, 'cart_count': sum(cart.values())})


@cart_api_bp.route('/api/cart/clear', methods=['POST'])
def clear_cart():
    """Очищает корзину."""
    session.pop('cart', None)
    return jsonify({'success': True, 'cart_count': 0})
