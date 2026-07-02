import { NextRequest, NextResponse } from 'next/server';
import { connectDB, getLocalDB, saveLocalDB, Order, OrderItem } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// Coordinates for simulation
const RESTAURANT_COORD = { lat: 12.9716, lng: 77.6412 }; // Indiranagar, Bengaluru
const CUSTOMER_COORDS: { [key: string]: { lat: number; lng: number } } = {
  '560034': { lat: 12.9352, lng: 77.6244 }, // Koramangala
  '560103': { lat: 12.9279, lng: 77.6801 }, // Bellandur
  '560038': { lat: 12.9784, lng: 77.6408 }, // Indiranagar local
};
const DEFAULT_COORD = { lat: 12.9562, lng: 77.6521 }; // Domlur

// Function to simulate and update order state based on time elapsed
function updateSimulatedOrder(order: Order): Order {
  if (order.status === 'Cancelled' || order.status === 'Delivered') {
    if (order.status === 'Delivered' && !order.driverLocation) {
      const dest = CUSTOMER_COORDS[order.deliveryAddress.postalCode] || DEFAULT_COORD;
      order.driverLocation = {
        lat: dest.lat,
        lng: dest.lng,
        bearing: 0,
        statusText: 'Delivered!'
      };
    }
    return order;
  }

  const elapsedMs = Date.now() - new Date(order.createdAt).getTime();
  const elapsedSec = elapsedMs / 1000;

  // Timings in seconds for simulation:
  // 0 - 20s: Placed
  // 20s - 50s: Preparing
  // 50s - 110s: Out for Delivery (Interpolating coordinates)
  // > 110s: Delivered
  
  const dest = CUSTOMER_COORDS[order.deliveryAddress.postalCode] || DEFAULT_COORD;
  
  if (elapsedSec < 20) {
    order.status = 'Placed';
    order.driverLocation = {
      lat: RESTAURANT_COORD.lat,
      lng: RESTAURANT_COORD.lng,
      bearing: 45,
      statusText: 'Restaurant accepting order'
    };
  } else if (elapsedSec < 50) {
    order.status = 'Preparing';
    order.driverLocation = {
      lat: RESTAURANT_COORD.lat,
      lng: RESTAURANT_COORD.lng,
      bearing: 90,
      statusText: 'Chef is roasting the dosas'
    };
  } else if (elapsedSec < 110) {
    order.status = 'Out for Delivery';
    // Interpolate driver position
    const deliveryDuration = 60; // 110 - 50
    const deliveryElapsed = elapsedSec - 50;
    const ratio = Math.min(deliveryElapsed / deliveryDuration, 1);
    
    const lat = RESTAURANT_COORD.lat + (dest.lat - RESTAURANT_COORD.lat) * ratio;
    const lng = RESTAURANT_COORD.lng + (dest.lng - RESTAURANT_COORD.lng) * ratio;
    
    // Bearing calculation (rough)
    const bearing = Math.atan2(dest.lng - RESTAURANT_COORD.lng, dest.lat - RESTAURANT_COORD.lat) * (180 / Math.PI);

    order.driverLocation = {
      lat,
      lng,
      bearing,
      statusText: `Rider is on the way (${Math.round((1 - ratio) * 10)} mins away)`
    };
  } else {
    order.status = 'Delivered';
    order.paymentStatus = order.paymentMethod === 'CoD' ? 'Paid' : order.paymentStatus;
    order.driverLocation = {
      lat: dest.lat,
      lng: dest.lng,
      bearing: 0,
      statusText: 'Delivered! Enjoy your meal.'
    };
  }

  return order;
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items, subtotal, tax, deliveryCharge, discount, total, couponCode, deliveryAddress, paymentMethod } = body;

    if (!items || items.length === 0 || !deliveryAddress || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required order details' }, { status: 400 });
    }

    const db = getLocalDB();

    const newOrder: Order = {
      id: 'ord' + Math.floor(100000 + Math.random() * 900000), // Random 6 digit order ID
      userId: authUser.userId,
      userEmail: authUser.email,
      userName: authUser.name,
      items,
      subtotal: Number(subtotal),
      tax: Number(tax),
      deliveryCharge: Number(deliveryCharge),
      discount: Number(discount),
      total: Number(total),
      couponCode,
      status: 'Placed',
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'CoD' ? 'Pending' : 'Paid',
      createdAt: new Date().toISOString()
    };

    // Calculate initial driver position
    newOrder.driverLocation = {
      lat: RESTAURANT_COORD.lat,
      lng: RESTAURANT_COORD.lng,
      bearing: 0,
      statusText: 'Waiting for restaurant confirmation'
    };

    db.orders.unshift(newOrder); // Add to beginning of array
    saveLocalDB(db);

    return NextResponse.json({
      message: 'Order placed successfully',
      order: newOrder
    });
  } catch (error: any) {
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

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    const db = getLocalDB();

    if (orderId) {
      // Get single order with dynamic simulation update
      const orderIndex = db.orders.findIndex((o: any) => o.id === orderId);
      if (orderIndex === -1) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Check permissions: either the order owner or an admin can view
      const order = db.orders[orderIndex];
      if (order.userId !== authUser.userId && authUser.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized access to order' }, { status: 403 });
      }

      // Update simulation before returning and saving
      const updatedOrder = updateSimulatedOrder({ ...order });
      db.orders[orderIndex] = updatedOrder;
      saveLocalDB(db);

      return NextResponse.json({ order: updatedOrder });
    }

    // List orders: if admin, can list all, otherwise list only user's orders
    let orders = [...db.orders];
    if (authUser.role !== 'admin') {
      orders = orders.filter((o: any) => o.userId === authUser.userId);
    }

    // Sync all active orders in list
    orders = orders.map(order => {
      const updated = updateSimulatedOrder({ ...order });
      return updated;
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, paymentStatus } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const db = getLocalDB();
    const orderIndex = db.orders.findIndex((o: any) => o.id === id);
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (status !== undefined) {
      db.orders[orderIndex].status = status;
    }
    if (paymentStatus !== undefined) {
      db.orders[orderIndex].paymentStatus = paymentStatus;
    }

    saveLocalDB(db);

    return NextResponse.json({
      message: 'Order updated successfully',
      order: db.orders[orderIndex]
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
