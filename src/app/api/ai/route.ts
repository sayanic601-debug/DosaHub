import { NextRequest, NextResponse } from 'next/server';
import { connectDB, getLocalDB, MenuItem } from '@/lib/db';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { action, message, userId } = body;

    const db = getLocalDB();
    const menu: MenuItem[] = db.menu;

    if (action === 'chatbot') {
      if (!message) {
        return NextResponse.json({ error: 'Message is required' }, { status: 400 });
      }

      const q = message.toLowerCase();
      let responseText = '';
      let suggestedItems: any[] = [];

      // Keyword based routing
      if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('vanakkam')) {
        responseText = "Vanakkam! Welcome to DosaHub. I am your South Indian food assistant. How can I help you satisfy your cravings today? You can ask me to recommend dishes, check combos, or ask about our speed!";
      } else if (q.includes('dosa') || q.includes('crispy')) {
        suggestedItems = menu.filter(item => item.category === 'Dosa');
        responseText = `Ah, Dosa! The pride of South India. We have ${suggestedItems.length} delicious dosas for you. I highly recommend the **Ghee Roast Masala Dosa** for pure butter goodness, or the spicy **Mysore Masala Dosa** if you like a bit of heat.`;
      } else if (q.includes('spicy') || q.includes('spice') || q.includes('hot')) {
        suggestedItems = menu.filter(item => item.spiceLevel === 3);
        responseText = "Looking for a fiery feast? Try our Mysore Masala Dosa or Thalassery Veg Biryani. They are cooked with authentic spices that will surely tingle your tastebuds. Would you like to add some refreshing buttermilk to go with them?";
      } else if (q.includes('sweet') || q.includes('dessert') || q.includes('payasam')) {
        suggestedItems = menu.filter(item => item.category === 'Desserts');
        responseText = "End your meal on a sweet note! Our **Elaneer Payasam** is a heavenly blend of tender coconut pulp and sweet coconut milk. It is absolutely delicious and refreshing!";
      } else if (q.includes('coffee') || q.includes('beverage') || q.includes('drink')) {
        suggestedItems = menu.filter(item => item.category === 'Beverages');
        responseText = "Nothing beats the aroma of a traditional **Filter Coffee** brewed in a brass dabarah! We also recommend our cold Badam Milk or Spiced Butter Milk for a cooling treat.";
      } else if (q.includes('combo') || q.includes('suggest combo') || q.includes('deal')) {
        responseText = "Here are our AI-recommended **Smart Combos**:\n\n1. **The Classic Breakfast Combo**: Steamed Rava Idli + Crispy Medu Vada + Filter Coffee (Save ₹15!)\n2. **The Spicy Feast**: Mysore Masala Dosa + Badam Milk (Balances the spice beautifully!)\n3. **Grand South Feast**: Royal South Indian Meals + Elaneer Payasam (A complete royal treatment!).";
        // Return matching items
        suggestedItems = menu.filter(item => ['m1', 'm3', 'm4', 'm8'].includes(item.id));
      } else if (q.includes('delivery') || q.includes('time') || q.includes('fast') || q.includes('speed')) {
        responseText = "Our average preparation and delivery time is between 20 to 30 minutes. We cook each dosa fresh to order so you get them piping hot and crispy!";
      } else if (q.includes('coupon') || q.includes('offer') || q.includes('discount')) {
        responseText = "You can use the coupon code **DOSAHUB50** to get an amazing 50% discount on your order (minimum order ₹200)! We also have **SOUTHFEAST** for 20% off.";
      } else if (q.includes('recommend') || q.includes('suggest') || q.includes('hungry') || q.includes('what should i eat')) {
        // Pick a random main dish and beverage
        const main = menu.find(item => item.category === 'Dosa' || item.category === 'Meals');
        const drink = menu.find(item => item.category === 'Beverages');
        suggestedItems = [main, drink].filter(Boolean);
        responseText = `If you want a satisfying meal, I recommend pairing our **${main?.name}** with a hot cup of **${drink?.name}**. It's the ultimate comfort meal!`;
      } else {
        responseText = "I'm not sure I understood that fully, but I can tell you about our soft Idlis, crispy Vadas, ghee-soaked Masala Dosas, or our special Elaneer Payasam! Ask me: 'Recommend something spicy', 'Show me dessert options', or 'What coupons are active?'.";
      }

      return NextResponse.json({
        response: responseText,
        suggestedItems
      });
    }

    if (action === 'recommendations') {
      // Return 3 trending or recommended items
      // We can grab them based on highest ratings or randomly for variety
      const sorted = [...menu].sort((a, b) => b.rating - a.rating);
      const recommendations = sorted.slice(0, 3);
      
      return NextResponse.json({ recommendations });
    }

    if (action === 'combos') {
      // Return 2 curated combo options
      const combos = [
        {
          id: 'combo1',
          name: 'Traditional Kappi & Dosa Combo',
          items: ['m1', 'm8'], // Ghee Roast + Filter Coffee
          originalPrice: 190,
          comboPrice: 165,
          description: 'A crispy Ghee Roast Masala Dosa served alongside our legendary Filter Coffee.',
          image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop'
        },
        {
          id: 'combo2',
          name: 'Soft Idli & Crispy Vada Platter',
          items: ['m3', 'm4', 'm8'], // Idli + Vada + Coffee
          originalPrice: 235,
          comboPrice: 195,
          description: 'Steamed Rava Idlis, Crispy Medu Vadas, and a steaming hot traditional Filter Coffee.',
          image: 'https://images.unsplash.com/photo-1589302168068-9a4960d57d8e?q=80&w=600&auto=format&fit=crop'
        }
      ];

      // Attach full item details to combos
      const fullCombos = combos.map(c => ({
        ...c,
        menuItems: c.items.map(itemId => menu.find(item => item.id === itemId)).filter(Boolean)
      }));

      return NextResponse.json({ combos: fullCombos });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
