import { Truck, Clock, Award } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Truck,
      title: 'Быстрая доставка',
      description: 'Доставим заказ в течение 60 минут или вернём деньги',
    },
    {
      icon: Clock,
      title: 'Свежие продукты',
      description: 'Готовим только из свежих ингредиентов каждый день',
    },
    {
      icon: Award,
      title: 'Высокое качество',
      description: 'Контролируем качество на каждом этапе приготовления',
    },
  ];

  return (
    <section id="about" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Почему выбирают нас</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-orange-50 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <feature.icon className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
