import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

export const Header: React.FC = () => {
  const getTotalItems = useCartStore((state) => state.getTotalItems());

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-orange-600">🍣 РоллДоставка</h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#menu" className="text-gray-700 hover:text-orange-600 transition-colors">
              Меню
            </a>
            <a href="#about" className="text-gray-700 hover:text-orange-600 transition-colors">
              О нас
            </a>
            <a href="#delivery" className="text-gray-700 hover:text-orange-600 transition-colors">
              Доставка
            </a>
          </nav>

          <button className="relative p-2 text-gray-700 hover:text-orange-600 transition-colors">
            <ShoppingCart className="w-6 h-6" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
