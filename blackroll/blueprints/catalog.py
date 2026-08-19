"""
Blueprint для отображения каталога товаров.
Маршруты: главная страница, категория, карточка товара, API каталога.
"""
from flask import Blueprint, render_template, abort, jsonify

from data import get_catalog, get_product_by_id

catalog_bp = Blueprint('catalog', __name__)


@catalog_bp.route('/api/catalog', methods=['GET'])
def api_get_catalog():
    """API эндпоинт для получения всего каталога (используется JS)."""
    return jsonify(get_catalog())


@catalog_bp.route('/')
def index():
    """Главная страница с витриной всех роллов."""
    # Данные передаются в шаблон, фильтрация будет на JS или через аргументы
    return render_template('index.html')


@catalog_bp.route('/category/<category_name>')
def category(category_name):
    """Страница категории (classic, premium, spicy, baked)."""
    # Валидация категории (опционально можно проверить список допустимых)
    allowed_categories = ['classic', 'premium', 'spicy', 'baked']
    if category_name not in allowed_categories:
        abort(404)
    
    return render_template('category.html', category_name=category_name)


@catalog_bp.route('/product/<int:product_id>')
def product_detail(product_id):
    """Детальная страница конкретного ролла."""
    # Логика получения данных вынесена в data слой, 
    # но здесь мы просто рендерим шаблон, а данные подгрузит JS или передадим их сразу
    # Для простоты без ORM передадим ID, а фронтенд сам запросит детали или бекенд найдет
    from data import get_product_by_id
    
    product = get_product_by_id(product_id)
    if not product:
        abort(404)
        
    return render_template('product.html', product=product)
