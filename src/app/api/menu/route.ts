import { NextRequest, NextResponse } from 'next/server';
import { connectDB, getLocalDB, saveLocalDB } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const db = getLocalDB();
    
    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isVeg = searchParams.get('isVeg');
    const minRating = searchParams.get('minRating');

    let items = [...db.menu];

    if (category && category !== 'All') {
      items = items.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }

    if (isVeg === 'true') {
      items = items.filter(item => item.isVeg === true);
    }

    if (minRating) {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        items = items.filter(item => item.rating >= rating);
      }
    }

    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const authUser = getAuthUser(request);
    
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, price, category, image, isVeg, spiceLevel, customizations } = body;

    if (!name || !description || price === undefined || !category || !image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getLocalDB();
    const newItem = {
      id: 'm' + (db.menu.length + 1),
      name,
      description,
      price: Number(price),
      category,
      image,
      rating: 5.0,
      reviewsCount: 0,
      prepTime: Number(body.prepTime) || 15,
      isVeg: Boolean(isVeg),
      spiceLevel: Number(spiceLevel) as 1 | 2 | 3,
      customizations: customizations || { extras: [], toppings: [], combos: [] }
    };

    db.menu.push(newItem);
    saveLocalDB(db);

    return NextResponse.json({ message: 'Menu item created successfully', item: newItem });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const authUser = getAuthUser(request);
    
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, description, price, category, image, isVeg, spiceLevel, prepTime, customizations } = body;

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const db = getLocalDB();
    const itemIndex = db.menu.findIndex((item: any) => item.id === id);
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    db.menu[itemIndex] = {
      ...db.menu[itemIndex],
      name: name !== undefined ? name : db.menu[itemIndex].name,
      description: description !== undefined ? description : db.menu[itemIndex].description,
      price: price !== undefined ? Number(price) : db.menu[itemIndex].price,
      category: category !== undefined ? category : db.menu[itemIndex].category,
      image: image !== undefined ? image : db.menu[itemIndex].image,
      isVeg: isVeg !== undefined ? Boolean(isVeg) : db.menu[itemIndex].isVeg,
      spiceLevel: spiceLevel !== undefined ? Number(spiceLevel) as 1 | 2 | 3 : db.menu[itemIndex].spiceLevel,
      prepTime: prepTime !== undefined ? Number(prepTime) : db.menu[itemIndex].prepTime,
      customizations: customizations !== undefined ? customizations : db.menu[itemIndex].customizations
    };

    saveLocalDB(db);
    return NextResponse.json({ message: 'Menu item updated successfully', item: db.menu[itemIndex] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const authUser = getAuthUser(request);
    
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const db = getLocalDB();
    const itemIndex = db.menu.findIndex((item: any) => item.id === id);
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    db.menu.splice(itemIndex, 1);
    saveLocalDB(db);

    return NextResponse.json({ message: 'Menu item deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
