// Vape Products Data
import { Product } from './products';

export const vapeProducts: Product[] = [
  {
    id: 'vape-breeze-pro',
    name: 'Breeze Pro Disposable Vape',
    brand: 'Breeze',
    price: 17.99,
    category: 'vapes',
    image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663313071830/VhEZVFHzfWqNMxjz.webp',
    badge: 'POPULAR',
    inStock: true,
    featured: true,
    trending: true,
    description: "The Breeze Pro isn't just powerful, it's a statement. Premium materials are encompassed by a beautifully designed shell, making this disposable vape truly stand out. It feels as good as it looks.",
    specs: [
      'Up to 2,000 puffs per device',
      '5% Salt Nicotine (50mg/mL)',
      '6mL E-Juice Capacity',
      '1,000mAh Internal Battery',
      'Advanced Mesh Coil Technology',
      'Draw-Activated Firing',
      'Fully Disposable',
      'Non-Refillable'
    ],
    variants: [
      { id: 'citrus', name: 'Citrus', description: 'Zesty citrus blend with refreshing notes' },
      { id: 'banana-mint', name: 'Banana Mint', description: 'Creamy banana with cool mint finish' },
      { id: 'blueberry-banana', name: 'Blueberry Banana', description: 'Sweet blueberries mixed with ripe banana' },
      { id: 'blueberry-mint', name: 'Blueberry Mint', description: 'Juicy blueberries with icy menthol' },
      { id: 'blueberry-watermelon', name: 'Blueberry Watermelon', description: 'Blueberry and watermelon fusion' },
      { id: 'blue-raspberry', name: 'Blue Raspberry', description: 'Classic blue raspberry candy flavor' },
      { id: 'cherry-cola', name: 'Cherry Cola', description: 'Sweet cherry with fizzy cola notes' },
      { id: 'cherry-lemon', name: 'Cherry Lemon', description: 'Tart cherry balanced with citrus lemon' },
      { id: 'grape', name: 'Grape', description: 'Bold purple grape flavor' },
      { id: 'spearmint', name: 'Spearmint', description: 'Fresh spearmint with cooling sensation' },
      { id: 'lemon-mint', name: 'Lemon Mint', description: 'Tangy lemon with refreshing mint' },
      { id: 'watermelon-mint', name: 'Watermelon Mint', description: 'Sweet watermelon with icy mint' },
      { id: 'menthol', name: 'Menthol', description: 'Pure menthol for maximum cooling' },
      { id: 'mint', name: 'Mint', description: 'Classic peppermint flavor' },
      { id: 'orange-mango-watermelon', name: 'Orange Mango Watermelon', description: 'Tropical trio of orange, mango, and watermelon' },
      { id: 'pineapple-coconut', name: 'Pineapple Coconut', description: 'Tropical pineapple with creamy coconut' },
      { id: 'pineapple-passion', name: 'Pineapple Passion', description: 'Pineapple and passion fruit blend' },
      { id: 'pom-berry-mint', name: 'Pom Berry Mint', description: 'Pomegranate and berries with mint' },
      { id: 'raspberry-lemon', name: 'Raspberry Lemon', description: 'Tart raspberry with citrus lemon' },
      { id: 'strawberry-banana', name: 'Strawberry Banana', description: 'Classic strawberry banana smoothie' },
      { id: 'strawberry-cream', name: 'Strawberry Cream', description: 'Sweet strawberries with smooth cream' },
      { id: 'strawberry-lime', name: 'Strawberry Lime', description: 'Strawberry with zesty lime twist' },
      { id: 'strawberry-peach-mint', name: 'Strawberry Peach Mint', description: 'Strawberry and peach with cooling mint' },
      { id: 'strawberry-kiwi', name: 'Strawberry Kiwi', description: 'Sweet strawberry and tangy kiwi' },
      { id: 'strawmelon', name: 'StrawMelon', description: 'Strawberry and watermelon fusion' },
      { id: 'tobacco', name: 'Tobacco', description: 'Classic tobacco flavor' },
      { id: 'vanilla-tobacco', name: 'Vanilla Tobacco', description: 'Smooth vanilla blended with tobacco' },
      { id: 'peach-mango', name: 'Peach Mango', description: 'Juicy peach and tropical mango' }
    ]
  }
];
