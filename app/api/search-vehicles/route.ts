import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!city || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: city, startDate, endDate' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return NextResponse.json(
        { error: 'Start date cannot be in the past' },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const vehiclesCollection = db.collection('vehicle_registrations');
    const bookingsCollection = db.collection('bookings');

    console.log('Searching for vehicles in city:', city);

    const vehicles = await vehiclesCollection
      .find({ 
        City: { $regex: new RegExp(city, 'i') },
        status: 'paid'
      })
      .toArray();

    console.log(`Found ${vehicles.length} vehicles in city matching "${city}"`);
    
    if (vehicles.length === 0) {
      const exactVehicles = await vehiclesCollection
        .find({ 
          City: city,
          status: 'paid'
        })
        .toArray();
      
      console.log(`Exact match found ${exactVehicles.length} vehicles`);
      
      if (exactVehicles.length === 0) {
        const allCities = await vehiclesCollection.distinct('City', { status: 'paid' });
        console.log('Available cities in database:', allCities);
        
        return NextResponse.json({
          vehicles: [],
          message: `No vehicles found in ${city}`,
          availableCities: allCities
        });
      }
    }

    if (vehicles.length === 0) {
      return NextResponse.json({
        vehicles: [],
        message: `No vehicles found in ${city}`
      });
    }

    const availableVehicles = [];
    const requestStartDate = new Date(startDate);
    const requestEndDate = new Date(endDate);

    console.log('Search criteria:', {
      startDate: requestStartDate.toISOString(),
      endDate: requestEndDate.toISOString()
    });

    for (const vehicle of vehicles) {
      console.log(`\nChecking availability for vehicle: ${vehicle.vehicleNumber} (ID: ${vehicle._id})`);
      
      const existingBookings = await bookingsCollection.find({
        vehicleId: vehicle._id.toString(),
        status: { $in: ['pending', 'confirmed', 'in-progress'] }
      }).toArray();

      console.log(`Found ${existingBookings.length} existing bookings for this vehicle`);

      let isAvailable = true;
      let conflictingBooking = null;

      // Check each existing booking for time overlap
      for (const booking of existingBookings) {
        let bookingStartDate, bookingEndDate;

        try {
          // Handle different date formats in the database
          if (booking.startDate) {
            bookingStartDate = new Date(booking.startDate);
          } else if (booking.pickupTime) {
            bookingStartDate = new Date(booking.pickupTime);
          } else {
            console.log('Warning: Booking has no valid start date:', booking._id);
            continue;
          }

          if (booking.endDate) {
            bookingEndDate = new Date(booking.endDate);
          } else {
            bookingEndDate = new Date(bookingStartDate.getTime() + 6 * 60 * 60 * 1000);
            console.log('Warning: Booking has no end date, using fallback:', booking._id);
          }

          const hasOverlap = (requestStartDate < bookingEndDate) && (requestEndDate > bookingStartDate);

          console.log(`  Booking ${booking._id.toString().slice(-6)}:`);
          console.log(`    Booking period: ${bookingStartDate.toISOString()} - ${bookingEndDate.toISOString()}`);
          console.log(`    Request period: ${requestStartDate.toISOString()} - ${requestEndDate.toISOString()}`);
          console.log(`    Has overlap: ${hasOverlap}`);

          if (hasOverlap) {
            isAvailable = false;
            conflictingBooking = {
              id: booking._id.toString().slice(-6),
              startDate: bookingStartDate.toISOString(),
              endDate: bookingEndDate.toISOString(),
              status: booking.status
            };
            console.log(`    ❌ CONFLICT DETECTED with booking ${conflictingBooking.id}`);
          }
        } catch (dateError) {
          console.error('Error parsing dates for booking:', booking._id, dateError);
          continue;
        }
      }

      if (isAvailable) {
        console.log(`  ✅ Vehicle ${vehicle.vehicleNumber} is AVAILABLE`);
        availableVehicles.push({
          _id: vehicle._id.toString(),
          vehicleNumber: vehicle.vehicleNumber,
          VehicalType: vehicle.VehicalType,
          loadCapacity: vehicle.loadCapacity,
          City: vehicle.City,
          DriverName: vehicle.DriverName,
          status: vehicle.status,
          isAvailable: true
        });
      } else {
        console.log(`  ❌ Vehicle ${vehicle.vehicleNumber} is NOT AVAILABLE (conflicts with booking ${conflictingBooking?.id})`);
      }
    }

    return NextResponse.json({
      vehicles: availableVehicles,
      searchCriteria: {
        city,
        startDate,
        endDate
      },
      totalFound: vehicles.length,
      totalAvailable: availableVehicles.length
    });

  } catch (error) {
    console.error('Error searching vehicles:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search vehicles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}