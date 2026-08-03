# Sushi Delivery — Сайт доставки роллов

## Структура проекта

```
/workspace
├── client/                 # Клиентская часть (SPA)
│   ├── index.html          # Главная страница
│   ├── admin.html          # Админ-панель
│   ├── css/
│   │   ├── variables.css   # Дизайн-система (цвета, шрифты)
│   │   ├── base.css        # Базовые стили
│   │   ├── components.css  # Компоненты UI
│   │   └── main.css        # Основные стили страниц
│   └── js/
│       ├── api.js          # REST API клиент
│       ├── app.js          # Основное приложение
│       ├── cart.js         # Логика корзины
│       ├── checkout.js     # Чекаут
│       └── admin.js        # Админ-панель
│
├── server/                 # Серверная часть (Node.js + Express)
│   ├── index.js            # Точка входа
│   ├── db.js               # Подключение к SQLite
│   ├── schema.sql          # Схема базы данных
│   ├── routes/
│   │   ├── menu.js         # API меню
│   │   ├── orders.js       # API заказов
│   │   ├── promo.js        # API промокодов
│   │   └── auth.js         # API авторизации
│   └── middleware/
│       └── auth.js         # Middleware авторизации
│
├── database/
│   └── sushi.db            # SQLite база данных
│
├── package.json            # Зависимости проекта
└── README.md               # Документация
```

## Схема базы данных (SQLite)

### Таблицы

#### categories
- id INTEGER PRIMARY KEY
- name TEXT NOT NULL
- description TEXT
- sort_order INTEGER DEFAULT 0
- created_at DATETIME DEFAULT CURRENT_TIMESTAMP

#### subcategories
- id INTEGER PRIMARY KEY
- category_id INTEGER REFERENCES categories(id)
- name TEXT NOT NULL
- description TEXT
- sort_order INTEGER DEFAULT 0

#### products
- id INTEGER PRIMARY KEY
- subcategory_id INTEGER REFERENCES subcategories(id)
- name TEXT NOT NULL
- description TEXT
- price REAL NOT NULL
- old_price REAL
- image_url TEXT
- weight INTEGER
- ingredients TEXT
- is_active BOOLEAN DEFAULT 1
- sort_order INTEGER DEFAULT 0
- created_at DATETIME DEFAULT CURRENT_TIMESTAMP

#### customers
- id INTEGER PRIMARY KEY
- phone TEXT UNIQUE NOT NULL
- name TEXT
- email TEXT
- address TEXT
- created_at DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

#### orders
- id INTEGER PRIMARY KEY
- customer_id INTEGER REFERENCES customers(id)
- status TEXT DEFAULT 'new'
- total_amount REAL NOT NULL
- discount_amount REAL DEFAULT 0
- promo_code TEXT
- delivery_address TEXT
- delivery_time DATETIME
- customer_phone TEXT
- customer_name TEXT
- customer_comment TEXT
- created_at DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

#### order_items
- id INTEGER PRIMARY KEY
- order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE
- product_id INTEGER REFERENCES products(id)
- product_name TEXT NOT NULL
- quantity INTEGER NOT NULL
- price REAL NOT NULL
- subtotal REAL NOT NULL

#### promo_codes
- id INTEGER PRIMARY KEY
- code TEXT UNIQUE NOT NULL
- description TEXT
- discount_type TEXT CHECK(discount_type IN ('percent', 'fixed'))
- discount_value REAL NOT NULL
- min_order_amount REAL DEFAULT 0
- max_uses INTEGER
- current_uses INTEGER DEFAULT 0
- valid_from DATETIME
- valid_until DATETIME
- is_active BOOLEAN DEFAULT 1

#### employees
- id INTEGER PRIMARY KEY
- username TEXT UNIQUE NOT NULL
- password_hash TEXT NOT NULL
- role TEXT CHECK(role IN ('admin', 'manager', 'courier'))
- is_active BOOLEAN DEFAULT 1
- created_at DATETIME DEFAULT CURRENT_TIMESTAMP

#### analytics_events
- id INTEGER PRIMARY KEY
- event_type TEXT NOT NULL
- event_data TEXT
- customer_id INTEGER
- order_id INTEGER
- product_id INTEGER
- created_at DATETIME DEFAULT CURRENT_TIMESTAMP

## Дизайн-система

### Цветовая палитра

```css
:root {
  /* Основные цвета */
  --color-nori-dark: #0D120E;      /* Фон - цвет нори */
  --color-nori-light: #1A231F;     /* Светлый нори для карточек */
  --color-salmon: #FF6A3D;         /* Акцент - лосось */
  --color-salmon-hover: #E55A2E;   /* Лосось при наведении */
  --color-wasabi: #B9D45A;         /* Акцент - васаби */
  --color-wasabi-hover: #A4C045;   /* Васаби при наведении */
  
  /* Нейтральные цвета */
  --color-white: #FFFFFF;
  --color-off-white: #F5F5F5;
  --color-gray-light: #8B8B8B;
  --color-gray-dark: #3D3D3D;
  --color-black: #000000;
  
  /* Семантические цвета */
  --color-success: #B9D45A;        /* Васаби */
  --color-warning: #FFA726;
  --color-error: #FF5252;
  --color-info: #42A5F5;
  
  /* Градиенты */
  --gradient-primary: linear-gradient(135deg, var(--color-salmon), var(--color-wasabi));
  --gradient-dark: linear-gradient(180deg, var(--color-nori-dark), var(--color-nori-light));
}
```

### Типографика

```css
:root {
  /* Шрифты */
  --font-primary: 'Montserrat', sans-serif;
  --font-display: 'Playfair Display', serif;
  --font-mono: 'Courier New', monospace;
  
  /* Размеры шрифтов */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
  --text-6xl: 3.75rem;   /* 60px */
  
  /* Межстрочные интервалы */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  
  /* Межбуквенные интервалы */
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
}
```

### Отступы и сетка

```css
:root {
  /* Базовая единица отступа */
  --spacing-unit: 8px;
  
  /* Отступы */
  --space-1: calc(var(--spacing-unit) * 1);   /* 8px */
  --space-2: calc(var(--spacing-unit) * 2);   /* 16px */
  --space-3: calc(var(--spacing-unit) * 3);   /* 24px */
  --space-4: calc(var(--spacing-unit) * 4);   /* 32px */
  --space-5: calc(var(--spacing-unit) * 5);   /* 40px */
  --space-6: calc(var(--spacing-unit) * 6);   /* 48px */
  --space-8: calc(var(--spacing-unit) * 8);   /* 64px */
  --space-10: calc(var(--spacing-unit) * 10); /* 80px */
  --space-12: calc(var(--spacing-unit) * 12); /* 96px */
  
  /* Контейнер */
  --container-max: 1440px;
  --container-padding: var(--space-4);
  
  /* Сетка */
  --grid-columns: 12;
  --grid-gap: var(--space-4);
}
```

### Компоненты UI

#### Кнопки
- Primary: фон salmon, текст белый
- Secondary: фон прозрачный,边框 wasabi, текст wasabi
- Ghost: фон прозрачный, текст белый

#### Карточка товара
- Фон: color-nori-light
- Border radius: 16px
- Тень: мягкая тень с цветом salmon

#### Анимации
- Hover эффекты: transform scale 1.02-1.05
- Micro-interactions: 200-300ms ease-out
- Page transitions: 400ms ease-in-out

### Адаптивность

```css
/* Breakpoints */
--breakpoint-xs: 360px;   /* Малые телефоны */
--breakpoint-sm: 576px;   /* Телефоны */
--breakpoint-md: 768px;   /* Планшеты */
--breakpoint-lg: 1024px;  /* Ноутбуки */
--breakpoint-xl: 1440px;  /* Десктопы */
--breakpoint-xxl: 1920px; /* Большие экраны */
```

### Доступность

- prefers-reduced-motion поддержка
- Контрастность текста не менее 4.5:1
- Фокус-индикаторы для навигации с клавиатуры
- ARIA-атрибуты для скринридеров

## API Endpoints

### Menu
- GET /api/menu/categories - Список категорий
- GET /api/menu/products - Список товаров
- GET /api/menu/products/:id - Детали товара

### Orders
- GET /api/orders - Список заказов (admin)
- POST /api/orders - Создать заказ
- PUT /api/orders/:id/status - Обновить статус заказа
- GET /api/orders/:id - Детали заказа

### Promo Codes
- POST /api/promo/validate - Проверка промокода
- GET /api/promo/active - Активные промокоды

### Auth
- POST /api/auth/login - Вход сотрудника
- POST /api/auth/logout - Выход
- GET /api/auth/me - Текущий пользователь

### Analytics
- GET /api/analytics/sales - Продажи за период
- GET /api/analytics/popular - Популярные товары

## Статусы заказов

1. `new` - Новый заказ
2. `confirmed` - Подтверждён
3. `cooking` - Готовится
4. `ready` - Готов к выдаче
5. `delivering` - В доставке
6. `completed` - Завершён
7. `cancelled` - Отменён

## Промокоды

Типы скидок:
- `percent` - Процент от суммы заказа
- `fixed` - Фиксированная сумма

## Установка и запуск

```bash
# Установка зависимостей
npm install

# Инициализация базы данных
node server/db.js

# Запуск сервера
npm start

# Клиентская часть доступна на http://localhost:3000
# Админ-панель на http://localhost:3000/admin.html
```
