import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

interface PaymentRequest {
  amount: number;
  bookingId: string;
  customerName: string;
  customerMobile: string;
  vehicleNumber?: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json();
    
    if (!body.amount || !body.bookingId || !body.customerName || !body.customerMobile) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, bookingId, customerName, customerMobile' },
        { status: 400 }
      );
    }

    if (typeof body.amount !== 'number' || isNaN(body.amount) || body.amount < 1) {
      return NextResponse.json(
        { error: `Invalid amount: ₹${body.amount}. Amount must be a number ≥ ₹1` },
        { status: 400 }
      );
    }

    const orderOptions = {
      amount: Math.round(body.amount * 100),
      currency: 'INR',
      receipt: `booking_${body.bookingId}_${Date.now()}`,
      notes: {
        bookingId: body.bookingId,
        customerName: body.customerName,
        customerMobile: body.customerMobile,
        vehicleNumber: body.vehicleNumber || '',
        description: body.description || 'FleetLink Booking Payment',
      },
    };

    let order;
    try {
      order = await razorpay.orders.create(orderOptions);
      console.log('Razorpay order created:', order.id);
    } catch (razorpayError) {
      console.error('Razorpay API error:', razorpayError);
      return NextResponse.json(
        { 
          error: 'Razorpay API error',
          details: razorpayError instanceof Error ? razorpayError.message : 'Razorpay service error'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        created_at: order.created_at,
      },
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    }, { status: 200 });

  } catch (error) {
    console.error('General error in create-payment:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}