import { Product } from './types';

const CATEGORIES = ['Technology', 'Clothing', 'Gaming', 'Home', 'Audio', 'Accessories'];

const PRODUCT_NAMES = [
  ['Quantum Headset', 'Cyberpunk Hoodie', 'Neon Keyboard', 'Smart Plant Pot', 'Bass Pro X', 'Holo Watch'],
  ['Pixel Phone 9', 'Retro Jacket', 'Pro Mouse G', 'Ambient Lamp', 'Studio Monitor', 'Titanium Ring'],
  ['Drone Air', 'Urban Sneakers', 'VR Headset', 'Coffee Bot', 'Pod Cast Mic', 'Leather Bag'],
  ['Tablet Ultra', 'Cargo Pants', 'Gaming Chair', 'Air Purifier', 'Soundbar 500', 'Sun Glasses'],
  ['Laptop Pro', 'Silk Scarf', 'Console X', 'Smart Lock', 'Vinyl Player', 'Wallet Slim'],
  ['Smart Lens', 'Denim Vest', 'Controller Elite', 'Robo Vacuum', 'Noise Cancel 2', 'Belt Classic'],
  ['E-Reader', 'Beanie Wool', 'Mousepad RGB', 'Thermostat AI', 'Speaker Mini', 'Cap Vintage'],
  ['Power Bank', 'Gloves Tac', 'Webcam 4K', 'Blender Pro', 'Mixer Audio', 'Backpack Tech']
];

export const generateProducts = (): Product[] => {
  const products: Product[] = [];
  let idCounter = 1;

  CATEGORIES.forEach((category, catIndex) => {
    // Generate 8-10 products per category
    const names = PRODUCT_NAMES[catIndex] || PRODUCT_NAMES[0];
    
    names.forEach((baseName, index) => {
      const price = Math.floor(Math.random() * 300) + 20;
      const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 5 : 0;
      const rating = parseFloat((Math.random() * 2 + 3).toFixed(1)); // 3.0 to 5.0
      
      products.push({
        id: `prod-${idCounter++}`,
        name: `${baseName} ${['Pro', 'Max', 'Lite', 'V2', 'Edition'][index % 5]}`,
        category: category,
        price: price,
        discount: discount,
        rating: rating,
        stock: Math.floor(Math.random() * 50) + 2,
        description: `Experience the future with the ${baseName}. Featuring state-of-the-art technology, premium materials, and designed for the modern lifestyle. Perfect for ${category.toLowerCase()} enthusiasts.`,
        image: `https://picsum.photos/seed/${idCounter * 123}/400/400`,
        isNew: Math.random() > 0.8
      });
    });
  });

  return products;
};

export const MOCK_PRODUCTS = generateProducts();
export { CATEGORIES };