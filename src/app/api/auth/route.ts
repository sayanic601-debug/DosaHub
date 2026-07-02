import { NextRequest, NextResponse } from 'next/server';
import { connectDB, getLocalDB, saveLocalDB } from '@/lib/db';
import { signToken, getAuthUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { action } = body;

    const db = getLocalDB();

    if (action === 'register') {
      const { email, password, name } = body;
      
      if (!email || !password || !name) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Check if user already exists
      const existingUser = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 });
      }

      const newUser = {
        id: 'u' + (db.users.length + 1),
        email: email.toLowerCase(),
        passwordHash: password, // For mock simplicity
        name,
        role: 'user',
        addresses: [],
        wishlist: [],
        createdAt: new Date().toISOString()
      };

      db.users.push(newUser);
      saveLocalDB(db);

      const token = signToken({
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role as 'user' | 'admin'
      });

      return NextResponse.json({
        message: 'Registration successful',
        token,
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, addresses: newUser.addresses, wishlist: newUser.wishlist }
      });
    }

    if (action === 'login') {
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
      }

      const user = db.users.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password
      );

      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const token = signToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'user' | 'admin'
      });

      return NextResponse.json({
        message: 'Login successful',
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, addresses: user.addresses, wishlist: user.wishlist }
      });
    }

    // Authenticated Actions
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action === 'updateProfile') {
      const { name, email } = body;
      const userIndex = db.users.findIndex((u: any) => u.id === authUser.userId);
      if (userIndex === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      db.users[userIndex].name = name || db.users[userIndex].name;
      db.users[userIndex].email = email ? email.toLowerCase() : db.users[userIndex].email;
      saveLocalDB(db);

      const updatedUser = db.users[userIndex];
      return NextResponse.json({
        message: 'Profile updated successfully',
        user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, addresses: updatedUser.addresses, wishlist: updatedUser.wishlist }
      });
    }

    if (action === 'saveAddress') {
      const { label, addressLine, city, postalCode, addressId } = body;
      
      if (!label || !addressLine || !city || !postalCode) {
        return NextResponse.json({ error: 'Missing address fields' }, { status: 400 });
      }

      const userIndex = db.users.findIndex((u: any) => u.id === authUser.userId);
      if (userIndex === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const addresses = db.users[userIndex].addresses || [];

      if (addressId) {
        // Edit existing address
        const addrIndex = addresses.findIndex((a: any) => a.id === addressId);
        if (addrIndex !== -1) {
          addresses[addrIndex] = { id: addressId, label, addressLine, city, postalCode };
        }
      } else {
        // Add new address
        addresses.push({
          id: 'addr' + Date.now(),
          label,
          addressLine,
          city,
          postalCode
        });
      }

      db.users[userIndex].addresses = addresses;
      saveLocalDB(db);

      return NextResponse.json({
        message: 'Address saved successfully',
        addresses: db.users[userIndex].addresses
      });
    }

    if (action === 'deleteAddress') {
      const { addressId } = body;
      const userIndex = db.users.findIndex((u: any) => u.id === authUser.userId);
      if (userIndex === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      db.users[userIndex].addresses = db.users[userIndex].addresses.filter((a: any) => a.id !== addressId);
      saveLocalDB(db);

      return NextResponse.json({
        message: 'Address deleted successfully',
        addresses: db.users[userIndex].addresses
      });
    }

    if (action === 'toggleWishlist') {
      const { itemId } = body;
      const userIndex = db.users.findIndex((u: any) => u.id === authUser.userId);
      if (userIndex === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const wishlist = db.users[userIndex].wishlist || [];
      const itemIndex = wishlist.indexOf(itemId);
      if (itemIndex !== -1) {
        // Remove
        wishlist.splice(itemIndex, 1);
      } else {
        // Add
        wishlist.push(itemId);
      }

      db.users[userIndex].wishlist = wishlist;
      saveLocalDB(db);

      return NextResponse.json({
        message: 'Wishlist updated successfully',
        wishlist: db.users[userIndex].wishlist
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Auth API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getLocalDB();
    const user = db.users.find((u: any) => u.id === authUser.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses || [],
        wishlist: user.wishlist || []
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
