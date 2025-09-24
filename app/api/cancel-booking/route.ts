import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const bookingsCollection = db.collection("package-bookings");

    const existingBooking = await bookingsCollection.findOne({ 
      _id: new ObjectId(bookingId) 
    });

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking can be cancelled
    if (existingBooking.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Booking is already cancelled' },
        { status: 400 }
      );
    }

    if (existingBooking.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel a completed booking' },
        { status: 400 }
      );
    }

    const deleteResult = await bookingsCollection.deleteOne({ 
      _id: new ObjectId(bookingId) 
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to cancel booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled and deleted successfully',
      bookingId,
      deletedBooking: {
        id: existingBooking._id,
        status: existingBooking.status,
        pickupTime: existingBooking.pickup?.pickupTime,
        assignedVehicle: existingBooking.assignedVehicle
      }
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cancel booking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const bookingsCollection = db.collection("package-bookings");

    const booking = await bookingsCollection.findOne({ 
      _id: new ObjectId(bookingId) 
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    const canCancel = booking.status !== 'cancelled' && booking.status !== 'completed';
    
    let timeUntilPickup = null;
    if (booking.pickup?.pickupTime) {
      const pickupTime = new Date(booking.pickup.pickupTime);
      const now = new Date();
      const diffMs = pickupTime.getTime() - now.getTime();
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));
      timeUntilPickup = diffHours;
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking._id,
        status: booking.status,
        canCancel,
        timeUntilPickup,
        reason: canCancel 
          ? 'Booking can be cancelled' 
          : `Cannot cancel ${booking.status} booking`,
        booking: {
          pickup: booking.pickup,
          drop: booking.drop,
          package: booking.package,
          assignedVehicle: booking.assignedVehicle,
          estimation: booking.estimation
        }
      }
    });

  } catch (error) {
    console.error('Error checking booking cancellation status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check booking status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}