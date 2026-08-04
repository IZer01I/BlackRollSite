import { motion } from 'framer-motion';
import type { MenuItem } from '../../data/menu';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useCartStore } from '../../store/cartStore';
import { Flame } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <div className="relative overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {item.spicy && (
          <span className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full">
            <Flame className="w-4 h-4" />
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-orange-600">{item.price} ₽</span>
            <span className="text-gray-500 text-sm ml-2">{item.weight} г</span>
          </div>
          
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => addItem(item)}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700"
            >
              В корзину
            </Button>
          </motion.div>
        </div>
      </div>
    </Card>
  );
};
