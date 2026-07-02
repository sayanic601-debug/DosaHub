import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Types and Interfaces
export interface CustomizationOption {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  reviewsCount: number;
  prepTime: number; // in minutes
  isVeg: boolean;
  spiceLevel: 1 | 2 | 3; // 1: Mild, 2: Medium, 3: Hot
  customizations: {
    extras: CustomizationOption[];
    toppings: CustomizationOption[];
    combos: { name: string; price: number; description: string }[];
  };
}

export interface Coupon {
  code: string;
  discountPercent: number;
  minOrderAmount: number;
  expiryDate: string;
  active: boolean;
  description: string;
}

export interface UserAddress {
  id: string;
  label: string; // e.g. Home, Work
  addressLine: string;
  city: string;
  postalCode: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'user' | 'admin';
  addresses: UserAddress[];
  wishlist: string[]; // MenuItem IDs
  createdAt: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  selectedExtras: string[];
  selectedToppings: string[];
  selectedCombo?: string;
  customizationPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  couponCode?: string;
  status: 'Placed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  deliveryAddress: UserAddress;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Wallet' | 'CoD';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  createdAt: string;
  driverLocation?: {
    lat: number;
    lng: number;
    bearing: number;
    statusText: string;
  };
}

// In-Memory/JSON File Database Fallback
const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db.json');

// Helper to ensure data folder and db file exist
function ensureDBFile() {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE_PATH)) {
    const initialData = {
      users: [
        {
          id: 'u1',
          email: 'admin@dosahub.com',
          passwordHash: 'admin123', // Clean plain/hashed fallback
          name: 'DosaHub Admin',
          role: 'admin',
          addresses: [
            { id: 'a1', label: 'DosaHub HQ', addressLine: '12 Park Street', city: 'Kolkata, West Bengal', postalCode: '700016' }
          ],
          wishlist: [],
          createdAt: new Date().toISOString()
        },
        {
          id: 'u2',
          email: 'sayani@example.com',
          passwordHash: 'user123',
          name: 'Sayani Sen',
          role: 'user',
          addresses: [
            { id: 'a2', label: 'Home', addressLine: '45 Lake View Apparts, Salt Lake', city: 'Kolkata, West Bengal', postalCode: '700091' },
            { id: 'a3', label: 'Office', addressLine: 'Sector V, Salt Lake', city: 'Kolkata, West Bengal', postalCode: '700091' }
          ],
          wishlist: ['m1', 'm3'],
          createdAt: new Date().toISOString()
        }
      ],
      menu: [
        {
          id: 'm1',
          name: 'Ghee Roast Masala Dosa',
          description: 'Crispy golden crepe roasted in pure cow ghee, stuffed with seasoned potato mash, served with coconut, tomato chutneys and piping hot sambar.',
          price: 140,
          category: 'Dosa',
          image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop',
          rating: 4.8,
          reviewsCount: 342,
          prepTime: 12,
          isVeg: true,
          spiceLevel: 2,
          customizations: {
            extras: [{ name: 'Extra Ghee', price: 20 }, { name: 'Amul Cheese', price: 30 }, { name: 'Gunpowder (Podi)', price: 15 }],
            toppings: [{ name: 'Chopped Onions', price: 10 }, { name: 'Cashew Pieces', price: 25 }],
            combos: [
              { name: 'With Filter Coffee', price: 40, description: 'Add hot traditional South Indian filter coffee' },
              { name: 'With Mini Idli (4 pcs)', price: 60, description: 'Add 4 bite-sized button idlis in sambar' }
            ]
          }
        },
        {
          id: 'm2',
          name: 'Mysore Masala Dosa',
          description: 'Spicy and tangy garlic-chili paste (Mysore chutney) smeared inside a crispy dosa, loaded with potato masala and butter.',
          price: 160,
          category: 'Dosa',
          image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop',
          rating: 4.7,
          reviewsCount: 289,
          prepTime: 15,
          isVeg: true,
          spiceLevel: 3,
          customizations: {
            extras: [{ name: 'Extra Butter', price: 20 }, { name: 'Cheese Burst', price: 35 }, { name: 'Gunpowder (Podi)', price: 15 }],
            toppings: [{ name: 'Paneer Cubes', price: 30 }],
            combos: [
              { name: 'With Filter Coffee', price: 40, description: 'Add hot traditional South Indian filter coffee' }
            ]
          }
        },
        {
          id: 'm3',
          name: 'Steamed Rava Idli (2 Pcs)',
          description: 'Soft semolina cakes steamed with yogurt, cashew nuts, mustard seeds, and curry leaves. Served with coconut chutney and potato sagu.',
          price: 90,
          category: 'Idli',
          image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop',
          rating: 4.6,
          reviewsCount: 198,
          prepTime: 8,
          isVeg: true,
          spiceLevel: 1,
          customizations: {
            extras: [{ name: 'Extra Ghee', price: 15 }, { name: 'Podi topping', price: 10 }],
            toppings: [],
            combos: [
              { name: 'With Medu Vada (1 Pc)', price: 35, description: 'Add one crispy medu vada' },
              { name: 'With Filter Coffee', price: 40, description: 'Add hot traditional South Indian filter coffee' }
            ]
          }
        },
        {
          id: 'm4',
          name: 'Crispy Medu Vada (3 Pcs)',
          description: 'Deep-fried black gram doughnuts, crispy on the outside and fluffy inside, mixed with peppercorns, ginger, and green chilies.',
          price: 95,
          category: 'Vada',
          image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=600&auto=format&fit=crop', // fallback to idli/vada category
          rating: 4.5,
          reviewsCount: 156,
          prepTime: 10,
          isVeg: true,
          spiceLevel: 2,
          customizations: {
            extras: [{ name: 'Extra Sambar', price: 10 }, { name: 'Dipped in Sambar', price: 15 }],
            toppings: [],
            combos: [
              { name: 'With Filter Coffee', price: 40, description: 'Add traditional filter coffee' }
            ]
          }
        },
        {
          id: 'm5',
          name: 'Onion Tomato Uttapam',
          description: 'Thick savory pancake topped with finely chopped onions, juicy tomatoes, fresh coriander, and green chilies, roasted with sesame oil.',
          price: 120,
          category: 'Uttapam',
          image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop',
          rating: 4.6,
          reviewsCount: 142,
          prepTime: 12,
          isVeg: true,
          spiceLevel: 2,
          customizations: {
            extras: [{ name: 'Extra Ghee', price: 20 }, { name: 'Cheese topping', price: 30 }],
            toppings: [{ name: 'Cashew Nuts', price: 25 }, { name: 'Green Chilies', price: 5 }],
            combos: []
          }
        },
        {
          id: 'm6',
          name: 'Classic Royal South Indian Meals',
          description: 'A grand banana leaf feast featuring rice, sambar, rasam, kootu, poriyal, special kara kuzhambu, curd, papadum, pickle, and sweet payasam.',
          price: 220,
          category: 'Meals',
          image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=600&auto=format&fit=crop',
          rating: 4.9,
          reviewsCount: 521,
          prepTime: 18,
          isVeg: true,
          spiceLevel: 2,
          customizations: {
            extras: [{ name: 'Extra Rice', price: 30 }, { name: 'Extra Ghee', price: 20 }, { name: 'Special Fryums', price: 15 }],
            toppings: [],
            combos: [
              { name: 'With Sweet Lassi', price: 50, description: 'Add a thick sweet yogurt drink' },
              { name: 'With Butter Milk', price: 30, description: 'Add refreshing spiced buttermilk' }
            ]
          }
        },
        {
          id: 'm7',
          name: 'Thalassery Veg Biryani',
          description: 'Fragrant Kaima rice cooked with mixed seasonal vegetables, aromatic spices, topped with fried onions, cashews, and raisins. Served with raita.',
          price: 180,
          category: 'Biryani',
          image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop',
          rating: 4.5,
          reviewsCount: 187,
          prepTime: 15,
          isVeg: true,
          spiceLevel: 3,
          customizations: {
            extras: [{ name: 'Extra Raita', price: 15 }, { name: 'Double Masala', price: 20 }],
            toppings: [],
            combos: [
              { name: 'With Badam Milk', price: 50, description: 'Add cold rich badam milk' }
            ]
          }
        },
        {
          id: 'm8',
          name: 'Traditional Filter Coffee',
          description: 'Aromatic, chicory-blended coffee brewed in a traditional metal filter, frothed with boiling hot milk, served in a brass dabarah and tumbler.',
          price: 50,
          category: 'Beverages',
          image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop',
          rating: 4.9,
          reviewsCount: 654,
          prepTime: 5,
          isVeg: true,
          spiceLevel: 1,
          customizations: {
            extras: [{ name: 'Extra Strong Decoction', price: 5 }, { name: 'Sugar Free', price: 0 }],
            toppings: [],
            combos: []
          }
        },
        {
          id: 'm9',
          name: 'Elaneer Payasam (Tender Coconut)',
          description: 'A heavenly chilled dessert made with sweet tender coconut pulp, coconut milk, condensed milk, flavored with a dash of cardamom.',
          price: 110,
          category: 'Desserts',
          image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop',
          rating: 4.8,
          reviewsCount: 223,
          prepTime: 6,
          isVeg: true,
          spiceLevel: 1,
          customizations: {
            extras: [{ name: 'Extra Cashews', price: 15 }],
            toppings: [{ name: 'Vanilla Ice Cream Scoop', price: 30 }],
            combos: []
          }
        }
      ],
      coupons: [
        { code: 'DOSAHUB50', discountPercent: 50, minOrderAmount: 200, expiryDate: '2028-12-31', active: true, description: 'Get 50% OFF on your order. Min order ₹200.' },
        { code: 'SOUTHFEAST', discountPercent: 20, minOrderAmount: 150, expiryDate: '2028-12-31', active: true, description: 'Save 20% on authentic meals and dosas. Min order ₹150.' },
        { code: 'FREEKAPPI', discountPercent: 10, minOrderAmount: 100, expiryDate: '2028-12-31', active: true, description: '10% discount on coffee combos and desserts.' }
      ],
      orders: []
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

// LowDb-style local JSON operations helper
export const getLocalDB = () => {
  ensureDBFile();
  const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
  return JSON.parse(raw);
};

export const saveLocalDB = (data: any) => {
  ensureDBFile();
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

// Database connectivity
let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // Gracefully use local file fallback
    console.log('MONGODB_URI is not set. Falling back to local file JSON database.');
    ensureDBFile();
    isConnected = true;
    return;
  }

  try {
    const db = await mongoose.connect(uri);
    isConnected = db.connections[0].readyState === 1;
    console.log('Successfully connected to MongoDB Atlas.');
  } catch (error) {
    console.error('Error connecting to MongoDB. Falling back to local file JSON database:', error);
    ensureDBFile();
    isConnected = true;
  }
}
