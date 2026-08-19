"""
Точка входа приложения blackRoll.
Инициализирует Flask, подключает Blueprints и статические файлы.
"""
import os
from flask import Flask

# Импорт модулей данных и blueprint'ов
from data import get_catalog  # Проверка загрузки данных при старте
from blueprints.catalog import catalog_bp
from blueprints.cart_api import cart_api_bp
from blueprints.orders import orders_bp


def create_app():
    """Фабрика приложения Flask."""
    app = Flask(__name__)
    
    # Настройки приложения
    app.config['SECRET_KEY'] = 'blackroll-secret-key-change-in-production'
    app.config['JSON_AS_ASCII'] = False  # Чтобы русские символы в JSON не экранировались
    
    # Регистрация Blueprint'ов
    app.register_blueprint(catalog_bp)
    app.register_blueprint(cart_api_bp)
    app.register_blueprint(orders_bp)
    
    # Дополнительная проверка данных при старте (опционально)
    with app.app_context():
        catalog = get_catalog()
        if not catalog:
            print("ВНИМАНИЕ: Каталог товаров пуст или не загружен!")
        else:
            print(f"Загружено товаров в каталог: {len(catalog)}")
    
    return app


if __name__ == '__main__':
    application = create_app()
    # Запуск сервера на всех интерфейсах для удобства тестирования
    application.run(host='0.0.0.0', port=5000, debug=True)
