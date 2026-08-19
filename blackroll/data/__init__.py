"""
Модуль для работы с данными (Data Layer).
Отвечает за чтение каталога и запись заказов в JSON файлы.
"""
import json
import os
from datetime import datetime
from threading import Lock

# Используем абсолютные пути относительно этого файла
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CATALOG_PATH = os.path.join(BASE_DIR, 'catalog.json')
ORDERS_PATH = os.path.join(BASE_DIR, 'orders.json')

# Блокировка для потокобезопасной записи заказов
orders_lock = Lock()


def get_catalog():
    """
    Читает и возвращает весь каталог товаров из JSON файла.
    Возвращает список словарей.
    """
    try:
        with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Ошибка: Файл каталога не найден по пути {CATALOG_PATH}")
        return []
    except json.JSONDecodeError:
        print(f"Ошибка: Неверный формат JSON в файле {CATALOG_PATH}")
        return []


def get_product_by_id(product_id):
    """
    Ищет товар по ID в каталоге.
    Возвращает словарь товара или None, если не найдено.
    """
    catalog = get_catalog()
    for product in catalog:
        if product.get('id') == product_id:
            return product
    return None


def save_order(order_data):
    """
    Сохраняет новый заказ в файл orders.json.
    Добавляет метаданные: дату создания и статус.
    Возвращает ID созданного заказа или None при ошибке.
    """
    try:
        with orders_lock:  # Гарантируем, что два заказа не запишутся одновременно
            # Читаем текущие заказы
            existing_orders = []
            if os.path.exists(ORDERS_PATH):
                with open(ORDERS_PATH, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                    if content:
                        existing_orders = json.loads(content)
            
            # Формируем новый заказ
            new_order = {
                "id": len(existing_orders) + 1,
                "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "status": "new",  # new, processing, delivered, cancelled
                "items": order_data.get('items', []),
                "customer": order_data.get('customer', {}),
                "total_price": order_data.get('total_price', 0),
                "comment": order_data.get('comment', '')
            }
            
            # Дозаписываем в файл
            existing_orders.append(new_order)
            
            with open(ORDERS_PATH, 'w', encoding='utf-8') as f:
                json.dump(existing_orders, f, ensure_ascii=False, indent=2)
            
            return new_order['id']
            
    except Exception as e:
        print(f"Ошибка при сохранении заказа: {e}")
        return None


def get_all_orders():
    """
    Возвращает список всех заказов (для админки или отладки).
    """
    try:
        with open(ORDERS_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return []
    except json.JSONDecodeError:
        return []
