import { NextRequest, NextResponse } from 'next/server';
import { connectDB, getLocalDB, saveLocalDB } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await connectDB();
    const db = getLocalDB();
    const activeCoupons = db.coupons.filter((c: any) => c.active === true);
    return NextResponse.json({ coupons: activeCoupons });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code || subtotal === undefined) {
      return NextResponse.json({ error: 'Missing code or subtotal' }, { status: 400 });
    }

    const db = getLocalDB();
    const coupon = db.coupons.find(
      (c: any) => c.code.toLowerCase() === code.toLowerCase() && c.active === true
    );

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 404 });
    }

    // Check expiry
    const expiry = new Date(coupon.expiryDate);
    if (expiry.getTime() < Date.now()) {
      return NextResponse.json({ error: 'Coupon code has expired' }, { status: 400 });
    }

    // Check minimum spend
    if (subtotal < coupon.minOrderAmount) {
      return NextResponse.json({ 
        error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon.` 
      }, { status: 400 });
    }

    const discountAmount = Math.round((subtotal * coupon.discountPercent) / 100);

    return NextResponse.json({
      message: 'Coupon applied successfully!',
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount,
      description: coupon.description
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
