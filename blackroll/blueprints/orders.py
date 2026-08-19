"""
Blueprint для обработки заказов.
Маршруты: оформление заказа, страница успеха, API создания заказа.
"""
from flask import Blueprint, render_template, request, jsonify, redirect, url_for

from data import save_order, get_catalog

orders_bp = Blueprint('orders', __name__)


@orders_bp.route('/checkout')
def checkout_page():
    """Страница оформления заказа (корзина + форма данных клиента)."""
    return render_template('checkout.html')


@orders_bp.route('/order-success/<int:order_id>')
def order_success(order_id):
    """Страница успешного оформления заказа."""
    return render_template('success.html', order_id=order_id)


@orders_bp.route('/api/orders/create', methods=['POST'])
def create_order():
    """
    API эндпоинт для создания заказа.
    Принимает JSON с данными: items (список товаров), customer (данные клиента), comment.
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Нет данных заказа'}), 400
    
    items = data.get('items', [])
    if not items:
        return jsonify({'error': 'Корзина пуста'}), 400
    
    # Валидация и подсчет итоговой суммы на основе актуального каталога
    catalog = {item['id']: item for item in get_catalog()}
    total_price = 0
    validated_items = []
    
    for item in items:
        product_id = item.get('id')
        quantity = item.get('quantity', 1)
        
        if product_id not in catalog:
            return jsonify({'error': f'Товар с ID {product_id} не найден'}), 404
        
        product = catalog[product_id]
        item_total = product['price'] * quantity
        total_price += item_total
        
        validated_items.append({
            'id': product_id,
            'name': product['name'],
            'price': product['price'],
            'quantity': quantity,
            'total': item_total
        })
    
    customer_data = {
        'name': data.get('name', ''),
        'phone': data.get('phone', ''),
        'address': data.get('address', ''),
        'payment_method': data.get('payment_method', 'card')
    }
    
    # Простая валидация контактов
    if not customer_data['name'] or not customer_data['phone']:
        return jsonify({'error': 'Укажите имя и телефон'}), 400
    
    order_payload = {
        'items': validated_items,
        'customer': customer_data,
        'total_price': total_price,
        'comment': data.get('comment', '')
    }
    
    order_id = save_order(order_payload)
    
    if order_id:
        return jsonify({'success': True, 'order_id': order_id})
    else:
        return jsonify({'error': 'Ошибка при сохранении заказа'}), 500
