import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const bookingId = (await params).id;

    if (!bookingId || !ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking ID format' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const bookingsCollection = db.collection("bookings");

    const existingBooking = await bookingsCollection.findOne({
      _id: new ObjectId(bookingId)
    });

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (existingBooking.status === 'completed') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete completed bookings' 
        },
        { status: 400 }
      );
    }

    const deleteResult = await bookingsCollection.deleteOne({
      _id: new ObjectId(bookingId)
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
      deletedBookingId: bookingId
    });

  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete booking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const bookingId = (await params).id;

    if (!bookingId || !ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking ID format' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const bookingsCollection = db.collection("bookings");

    const booking = await bookingsCollection.findOne({
      _id: new ObjectId(bookingId)
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch booking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const bookingId =  (await params).id;
    const updateData = await request.json();

    if (!bookingId || !ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking ID format' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const bookingsCollection = db.collection("bookings");

    const existingBooking = await bookingsCollection.findOne({
      _id: new ObjectId(bookingId)
    });

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    const updatedData = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    delete updatedData._id;

    const updateResult = await bookingsCollection.updateOne(
      { _id: new ObjectId(bookingId) },
      { $set: updatedData }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'No changes made to booking' },
        { status: 400 }
      );
    }

    const updatedBooking = await bookingsCollection.findOne({
      _id: new ObjectId(bookingId)
    });

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking
    });

  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update booking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}