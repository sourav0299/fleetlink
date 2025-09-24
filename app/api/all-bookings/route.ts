import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status'); 
    const deliveryType = searchParams.get('deliveryType'); 
    const sortBy = searchParams.get('sortBy') || 'bookingDate'; 
    const sortOrder = searchParams.get('sortOrder') || 'desc'; 

    const { db } = await connectToDatabase();
    const bookingsCollection = db.collection("bookings");

    const filter: Record<string, unknown> = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (deliveryType) {
      filter.deliveryType = deliveryType;
    }

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const totalBookings = await bookingsCollection.countDocuments(filter);

    const bookings = await bookingsCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalConfirmed = await bookingsCollection.countDocuments({ status: 'confirmed' });
    const totalPending = await bookingsCollection.countDocuments({ status: 'pending' });
    const totalCompleted = await bookingsCollection.countDocuments({ status: 'completed' });
    const totalCancelled = await bookingsCollection.countDocuments({ status: 'cancelled' });

    const totalPages = Math.ceil(totalBookings / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: page,
          totalPages,
          totalBookings,
          limit,
          hasNextPage,
          hasPrevPage
        },
        summary: {
          total: totalBookings,
          confirmed: totalConfirmed,
          pending: totalPending,
          completed: totalCompleted,
          cancelled: totalCancelled
        }
      }
    });

  } catch (error) {
    console.error('Error fetching all bookings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch bookings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, bookingIds, updateData } = body;

    if (!action || !bookingIds || !Array.isArray(bookingIds)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request. Action and bookingIds array required.' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const bookingsCollection = db.collection("bookings");

    let affectedCount = 0;

    switch (action) {
      case 'updateStatus':
        if (!updateData?.status) {
          return NextResponse.json(
            { success: false, error: 'Status is required for updateStatus action' },
            { status: 400 }
          );
        }
        
        const updateResult = await bookingsCollection.updateMany(
          { _id: { $in: bookingIds.map(id => id) } },
          { 
            $set: { 
              status: updateData.status,
              updatedAt: new Date().toISOString()
            }
          }
        );
        affectedCount = updateResult.modifiedCount;
        break;

      case 'delete':
        const deleteResult = await bookingsCollection.deleteMany(
          { _id: { $in: bookingIds.map(id => id) } }
        );
        affectedCount = deleteResult.deletedCount;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Supported actions: updateStatus, delete' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully performed ${action} on ${affectedCount} bookings`,
      affectedCount
    });

  } catch (error) {
    console.error('Error in bulk booking operation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform bulk operation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}