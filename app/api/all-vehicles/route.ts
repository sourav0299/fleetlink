import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';

export async function GET(request: NextRequest) {

  try {

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const city = searchParams.get('city'); 
    const vehicleType = searchParams.get('vehicleType'); 
    const status = searchParams.get('status'); 
    const sortBy = searchParams.get('sortBy') || 'registrationDate'; 
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const { db } = await connectToDatabase();
    const vehiclesCollection = db.collection("vehicle_registrations");

    const filter: Record<string, unknown> = {};
    
    if (city) {
      filter.City = { $regex: city, $options: 'i' };
    }
    
    if (vehicleType) {
      filter.VehicalType = { $regex: vehicleType, $options: 'i' };
    }

    if (status) {
      filter.status = status;
    }

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const totalVehicles = await vehiclesCollection.countDocuments(filter);

    const vehicles = await vehiclesCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const bookingsCollection = db.collection("bookings");
    const vehiclesWithBookings = await Promise.all(
      vehicles.map(async (vehicle) => {
        const upcomingBookings = await bookingsCollection
          .find({
            vehicleId: vehicle._id.toString(),
            status: { $in: ['confirmed', 'pending'] },
            startDate: { $gte: new Date().toISOString() }
          })
          .sort({ startDate: 1 })
          .limit(1)
          .toArray();

        return {
          ...vehicle,
          upcomingBooking: upcomingBookings.length > 0 ? upcomingBookings[0] : null
        };
      })
    );

    const vehicleTypeStats = await vehiclesCollection.aggregate([
      {
        $group: {
          _id: "$VehicalType",
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const cityStats = await vehiclesCollection.aggregate([
      {
        $group: {
          _id: "$City",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();

    const statusStats = await vehiclesCollection.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const totalPages = Math.ceil(totalVehicles / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        vehicles: vehiclesWithBookings,
        pagination: {
          currentPage: page,
          totalPages,
          totalVehicles,
          limit,
          hasNextPage,
          hasPrevPage
        },
        summary: {
          total: totalVehicles,
          byType: vehicleTypeStats,
          byCities: cityStats,
          byStatus: statusStats
        }
      }
    });

  } catch (error) {
    console.error('Error fetching all vehicles:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch vehicles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, vehicleIds, updateData } = body;

    if (!action || !vehicleIds || !Array.isArray(vehicleIds)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request. Action and vehicleIds array required.' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const vehiclesCollection = db.collection("vehicle_registrations");

    let result;
    let affectedCount = 0;

    switch (action) {
      case 'updateStatus':
        if (!updateData?.status) {
          return NextResponse.json(
            { success: false, error: 'Status is required for updateStatus action' },
            { status: 400 }
          );
        }
        
        result = await vehiclesCollection.updateMany(
          { _id: { $in: vehicleIds.map(id => id) } },
          { 
            $set: { 
              status: updateData.status,
              updatedAt: new Date().toISOString()
            }
          }
        );
        affectedCount = result.modifiedCount;
        break;

      case 'updateCity':
        if (!updateData?.city) {
          return NextResponse.json(
            { success: false, error: 'City is required for updateCity action' },
            { status: 400 }
          );
        }
        
        result = await vehiclesCollection.updateMany(
          { _id: { $in: vehicleIds.map(id => id) } },
          { 
            $set: { 
              City: updateData.city,
              updatedAt: new Date().toISOString()
            }
          }
        );
        affectedCount = result.modifiedCount;
        break;

      case 'delete':
        result = await vehiclesCollection.deleteMany(
          { _id: { $in: vehicleIds.map(id => id) } }
        );
        affectedCount = result.deletedCount;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Supported actions: updateStatus, updateCity, delete' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully performed ${action} on ${affectedCount} vehicles`,
      affectedCount
    });

  } catch (error) {
    console.error('Error in bulk vehicle operation:', error);
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