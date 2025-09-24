import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';

interface PackageBookingData {
  pickup: {
    manualAddress: string;
    mapLocation: {
      address: string;
      lat: number;
      lng: number;
      placeId?: string;
    } | null;
    name: string;
    mobile: string;
    pickupTime: string;
  };
  drop: {
    manualAddress: string;
    mapLocation: {
      address: string;
      lat: number;
      lng: number;
      placeId?: string;
    } | null;
    name: string;
    mobile: string;
  };
  package: {
    type: string;
    weight: number;
    weightUnit: string;
    description: string;
  };
  estimation: {
    distance: number;
    estimatedTime: string;
    shippingCharges: number;
    gst: number;
    totalAmount: number;
  };
  assignedVehicle: {
    vehicleId: string;
    vehicleNumber: string;
    vehicleType: string;
    driverName: string;
    loadCapacity: string;
  };
  paymentDetails?: {
    paymentId: string;
    orderId: string;
    signature: string;
    amount: number;
    status: string;
    paidAt: string;
  };
  deliveryType: string;
  bookingDate: string;
  estimatedStartTime: string;
  estimatedEndTime: string;
  status: string;
  paymentStatus?: string;
  requiredVehicleType: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: PackageBookingData = await request.json();

    if (!data.pickup?.name || !data.pickup?.mobile || !data.drop?.name || 
        !data.drop?.mobile || !data.package?.type || !data.package?.weight ||
        !data.assignedVehicle?.vehicleId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (data.paymentStatus === 'paid' && (!data.paymentDetails?.paymentId || 
        !data.paymentDetails?.orderId || !data.paymentDetails?.signature)) {
      return NextResponse.json(
        { error: 'Payment details required for paid bookings' },
        { status: 400 }
      );
    }

    if (!data.pickup.manualAddress && !data.pickup.mapLocation) {
      return NextResponse.json(
        { error: 'Pickup location is required (manual address or map location)' },
        { status: 400 }
      );
    }

    if (!data.drop.manualAddress && !data.drop.mapLocation) {
      return NextResponse.json(
        { error: 'Drop location is required (manual address or map location)' },
        { status: 400 }
      );
    }

    const pickupTime = new Date(data.estimatedStartTime);
    const today = new Date();
    
    if (pickupTime < today) {
      return NextResponse.json(
        { error: 'Pickup time cannot be in the past' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const packageBookingsCollection = db.collection('package_bookings');
    const vehicleBookingsCollection = db.collection('bookings');

    const vehicleConflict = await vehicleBookingsCollection.findOne({
      vehicleId: data.assignedVehicle.vehicleId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startDate: { $lte: data.estimatedEndTime },
          endDate: { $gte: data.estimatedStartTime }
        }
      ]
    });

    if (vehicleConflict) {
      return NextResponse.json(
        { error: 'Selected vehicle is no longer available. Please try booking again.' },
        { status: 409 }
      );
    }

    const packageBookingId = `PKG${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const packageBookingDocument = {
      ...data,
      packageBookingId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const vehicleBookingDocument = {
      vehicleId: data.assignedVehicle.vehicleId,
      customerName: data.pickup.name,
      customerEmail: `${data.pickup.mobile}@package.delivery`,
      customerPhone: data.pickup.mobile,
      startDate: data.estimatedStartTime,
      endDate: data.estimatedEndTime,
      purpose: `Package Delivery - ${data.package.type}`,
      pickupLocation: data.pickup.mapLocation?.address || data.pickup.manualAddress,
      dropoffLocation: data.drop.mapLocation?.address || data.drop.manualAddress,
      totalPrice: data.estimation.totalAmount,
      vehicleDetails: {
        _id: data.assignedVehicle.vehicleId,
        vehicleNumber: data.assignedVehicle.vehicleNumber,
        VehicalType: data.assignedVehicle.vehicleType,
        loadCapacity: data.assignedVehicle.loadCapacity,
        DriverName: data.assignedVehicle.driverName
      },
      paymentDetails: data.paymentDetails || null,
      paymentStatus: data.paymentStatus || 'pending',
      bookingDate: data.bookingDate,
      status: 'confirmed',
      bookingType: 'package_delivery',
      packageBookingId: packageBookingId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const packageResult = await packageBookingsCollection.insertOne(packageBookingDocument);
    const vehicleResult = await vehicleBookingsCollection.insertOne(vehicleBookingDocument);

    return NextResponse.json({
      success: true,
      message: data.paymentStatus === 'paid' 
        ? 'Package delivery booking confirmed successfully with payment' 
        : 'Package delivery booking confirmed successfully',
      packageBookingId,
      booking: {
        _id: packageResult.insertedId,
        packageBookingId,
        vehicleBookingId: vehicleResult.insertedId,
        assignedVehicle: data.assignedVehicle,
        pickup: {
          address: data.pickup.mapLocation?.address || data.pickup.manualAddress,
          contactPerson: data.pickup.name,
          mobile: data.pickup.mobile,
          time: data.estimatedStartTime
        },
        drop: {
          address: data.drop.mapLocation?.address || data.drop.manualAddress,
          contactPerson: data.drop.name,
          mobile: data.drop.mobile
        },
        package: data.package,
        estimation: data.estimation,
        paymentStatus: data.paymentStatus || 'pending',
        paymentDetails: data.paymentDetails || null,
        status: 'confirmed'
      }
    });

  } catch (error) {
    console.error('Error creating package booking:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create package booking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerMobile = searchParams.get('customerMobile');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    const { db } = await connectToDatabase();
    const collection = db.collection('package_bookings');

    interface QueryFilter {
      $or?: Array<{ 'pickup.mobile': string } | { 'drop.mobile': string }>;
      status?: string;
    }
    
    const query: QueryFilter = {};
    
    if (customerMobile) {
      query.$or = [
        { 'pickup.mobile': customerMobile },
        { 'drop.mobile': customerMobile }
      ];
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
    console.error('Error fetching package bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch package bookings' },
      { status: 500 }
    );
  }
}