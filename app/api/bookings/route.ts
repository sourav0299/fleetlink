import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

interface BookingData {
  vehicleId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  purpose: string;
  pickupLocation: string;
  dropoffLocation: string;
  totalPrice: number;
  vehicleDetails: {
    _id: string;
    vehicleNumber: string;
    VehicalType: string;
    loadCapacity: string;
    City: string;
    DriverName: string;
  };
  bookingDate: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export async function POST(request: NextRequest) {
  try {
    const data: BookingData = await request.json();

    if (!data.vehicleId || !data.customerName || !data.customerEmail || 
        !data.customerPhone || !data.startDate || !data.endDate || 
        !data.pickupLocation || !data.dropoffLocation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return NextResponse.json(
        { error: 'Start date cannot be in the past' },
        { status: 400 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const bookingsCollection = db.collection('bookings');
    const vehiclesCollection = db.collection('vehicle_registrations');

    const vehicle = await vehiclesCollection.findOne({ _id: new ObjectId(data.vehicleId) });
    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    const overlappingBooking = await bookingsCollection.findOne({
      vehicleId: data.vehicleId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startDate: { $lte: data.endDate },
          endDate: { $gte: data.startDate }
        }
      ]
    });

    if (overlappingBooking) {
      return NextResponse.json(
        { error: 'Vehicle is not available for the selected dates' },
        { status: 409 }
      );
    }

    const bookingId = `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const bookingDocument = {
      ...data,
      bookingId,
      bookingDate: new Date().toISOString(),
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await bookingsCollection.insertOne(bookingDocument);

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      bookingId,
      booking: {
        _id: result.insertedId,
        bookingId,
        vehicleNumber: data.vehicleDetails.vehicleNumber,
        customerName: data.customerName,
        startDate: data.startDate,
        endDate: data.endDate,
        totalPrice: data.totalPrice,
        status: 'confirmed'
      }
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create booking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerEmail = searchParams.get('customerEmail');
    const vehicleId = searchParams.get('vehicleId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    const { db } = await connectToDatabase();
    const collection = db.collection('bookings');

    const query: Record<string, string> = {};
    
    if (customerEmail) {
      query.customerEmail = customerEmail;
    }
    
    if (vehicleId) {
      query.vehicleId = vehicleId;
    }
    
    if (status) {
      query.status = status;
    }

    const bookings = await collection
      .find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .toArray();

    const total = await collection.countDocuments(query);

    return NextResponse.json({
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    
    const { db } = await connectToDatabase();
    const collection = db.collection('bookings');

    const result = await collection.updateOne(
      { bookingId },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully'
    });

  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}