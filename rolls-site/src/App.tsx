import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { FeaturesSection } from './components/layout/FeaturesSection';
import { MenuSection } from './components/menu/MenuSection';
import { Cart } from './components/cart/Cart';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from './store/cartStore';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const getTotalItems = useCartStore((state) => state.getTotalItems());

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero секция */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Свежие роллы с доставкой на дом
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Готовим с любовью, доставляем быстро!
          </p>
          <a
            href="#menu"
            className="inline-block bg-white text-orange-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Смотреть меню
          </a>
        </div>
      </section>

      <FeaturesSection />
      <MenuSection />

      {/* Секция доставки */}
      <section id="delivery" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Доставка и оплата</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">🚚 Условия доставки</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Бесплатная доставка от 1500 ₽</li>
                <li>• Доставка по Москве — 300 ₽</li>
                <li>• Доставка по области — от 500 ₽</li>
                <li>• Самовывоз — бесплатно</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">💳 Способы оплаты</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Банковской картой онлайн</li>
                <li>• Картой курьеру при получении</li>
                <li>• Наличными курьеру</li>
                <li>• СБП (Система быстрых платежей)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Плавающая кнопка корзины */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition-colors z-40"
      >
        <ShoppingCart className="w-6 h-6" />
        {getTotalItems() > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {getTotalItems()}
          </span>
        )}
      </button>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

export default App;
