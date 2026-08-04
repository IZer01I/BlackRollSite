export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-orange-500 mb-4">🍣 РоллДоставка</h3>
            <p className="text-gray-400">
              Свежие роллы и суши с доставкой на дом. Готовим с любовью, доставляем быстро!
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <ul className="space-y-2 text-gray-400">
              <li>📞 +7 (999) 123-45-67</li>
              <li>📧 info@rolldostavka.ru</li>
              <li>📍 Москва, ул. Примерная, 10</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Время работы</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Пн-Чт: 10:00 — 23:00</li>
              <li>Пт-Сб: 10:00 — 00:00</li>
              <li>Вс: 11:00 — 23:00</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 РоллДоставка. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};
