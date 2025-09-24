import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import crypto from 'crypto';

interface VehicleRegistrationData {
  vehicleNumber: string;
  VehicleRC: string;
  City: string;
  VehicalType: string;
  VehicalTyerCondition: string;
  loadCapacity: string;
  DriverName: string;
  DriverLicenceNumber: string;
  DriverLicence: string;
  OneTimeRegistration: boolean;
  paymentDetails?: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  };
  registrationDate: string;
  status: 'paid' | 'free';
}

function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');
  
  return expectedSignature === signature;
}

export async function POST(request: NextRequest) {
  try {
    const data: VehicleRegistrationData = await request.json();

    if (!data.vehicleNumber || !data.VehicalType || !data.City || 
        !data.VehicalTyerCondition || !data.loadCapacity || !data.DriverName || 
        !data.DriverLicenceNumber || !data.VehicleRC || !data.DriverLicence) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (data.OneTimeRegistration && data.paymentDetails) {
      const isValidPayment = verifyPaymentSignature(
        data.paymentDetails.razorpay_order_id,
        data.paymentDetails.razorpay_payment_id,
        data.paymentDetails.razorpay_signature
      );

      if (!isValidPayment) {
        return NextResponse.json(
          { error: 'Invalid payment signature' },
          { status: 400 }
        );
      }
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('vehicle_registrations');

    const existingVehicle = await collection.findOne({ 
      vehicleNumber: data.vehicleNumber 
    });

    if (existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle number already registered' },
        { status: 409 }
      );
    }

    const vehicleDocument = {
      ...data,
      registrationDate: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    const result = await collection.insertOne(vehicleDocument);

    return NextResponse.json({
      success: true,
      message: 'Vehicle registered successfully',
      vehicleId: result.insertedId,
      registrationNumber: data.vehicleNumber,
      status: data.status,
    });

  } catch (error) {
    console.error('Error registering vehicle:', error);
    return NextResponse.json(
      { 
        error: 'Failed to register vehicle',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleNumber = searchParams.get('vehicleNumber');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    const { db } = await connectToDatabase();
    const collection = db.collection('vehicle_registrations');

    let query = {};
    if (vehicleNumber) {
      query = { vehicleNumber: { $regex: vehicleNumber, $options: 'i' } };
    }

    const vehicles = await collection
      .find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .toArray();

    const total = await collection.countDocuments(query);

    return NextResponse.json({
      vehicles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}