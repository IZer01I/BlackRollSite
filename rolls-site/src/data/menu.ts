export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  weight: number;
  image: string;
  category: 'rolls' | 'sushi' | 'sets' | 'drinks';
  spicy?: boolean;
}

export const menuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Филадельфия',
    description: 'Лосось, сливочный сыр, огурец, рис, нори',
    price: 590,
    weight: 280,
    image: 'https://picsum.photos/seed/filadelfiya/640/480',
    category: 'rolls',
  },
  {
    id: 2,
    name: 'Калифорния',
    description: 'Краб, авокадо, огурец, икра масаго, рис, нори',
    price: 490,
    weight: 260,
    image: 'https://picsum.photos/seed/kaliforniya/640/480',
    category: 'rolls',
  },
  {
    id: 3,
    name: 'Дракон',
    description: 'Угорь, сливочный сыр, огурец, кунжут, рис, нори',
    price: 690,
    weight: 300,
    image: 'https://picsum.photos/seed/drakon/640/480',
    category: 'rolls',
  },
  {
    id: 4,
    name: 'Острый тунец',
    description: 'Тунец, острый соус, огурец, рис, нори',
    price: 520,
    weight: 240,
    image: 'https://picsum.photos/seed/ostryj-tunec/640/480',
    category: 'rolls',
    spicy: true,
  },
  {
    id: 5,
    name: 'Сет «Премиум»',
    description: 'Филадельфия, Калифорния, Дракон — 24 шт.',
    price: 1490,
    weight: 720,
    image: 'https://picsum.photos/seed/set-premium/640/480',
    category: 'sets',
  },
  {
    id: 6,
    name: 'Сет «Вечеринка»',
    description: 'Ассорти роллов на компанию — 32 шт.',
    price: 1990,
    weight: 960,
    image: 'https://picsum.photos/seed/set-vecherinka/640/480',
    category: 'sets',
  },
  {
    id: 7,
    name: 'Нигири с лососем',
    description: 'Лосось, рис — 2 шт.',
    price: 290,
    weight: 60,
    image: 'https://picsum.photos/seed/nigiri-s-losem/640/480',
    category: 'sushi',
  },
  {
    id: 8,
    name: 'Нигири с угрем',
    description: 'Угорь, рис, кунжут — 2 шт.',
    price: 350,
    weight: 60,
    image: 'https://picsum.photos/seed/nigiri-s-ugrem/640/480',
    category: 'sushi',
  },
  {
    id: 9,
    name: 'Кока-кола',
    description: 'Газированный напиток, 0.5 л',
    price: 120,
    weight: 500,
    image: 'https://picsum.photos/seed/coca-cola/640/480',
    category: 'drinks',
  },
  {
    id: 10,
    name: 'Зелёный чай',
    description: 'Традиционный японский чай, 0.5 л',
    price: 90,
    weight: 500,
    image: 'https://picsum.photos/seed/zelenyj-chaj/640/480',
    category: 'drinks',
  },
];

export const categories = [
  { id: 'all', name: 'Все' },
  { id: 'rolls', name: 'Роллы' },
  { id: 'sushi', name: 'Суши' },
  { id: 'sets', name: 'Сеты' },
  { id: 'drinks', name: 'Напитки' },
] as const;
