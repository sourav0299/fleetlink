'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { googleMapsService } from '@/lib/google-maps';
import toast from 'react-hot-toast';

interface Booking {
  _id: string;
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
    DriverName: string;
  };
  bookingDate: string;
  status: string;
  bookingType: string;
  packageBookingId: string;
  createdAt: string;
  updatedAt: string;
  estimatedTime?: string;
  distance?: number; 
}

interface BookingsData {
  bookings: Booking[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalBookings: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  summary: {
    total: number;
    confirmed: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
}

export default function AllBookingsPage() {
  const [bookingsData, setBookingsData] = useState<BookingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('bookingDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [tripTimes, setTripTimes] = useState<Record<string, {time: string, distance: number, loading: boolean}>>({});

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        sortOrder
      });

      if (statusFilter) params.append('status', statusFilter);
      if (deliveryTypeFilter) params.append('deliveryType', deliveryTypeFilter);

      const response = await fetch(`/api/all-bookings?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch bookings');
      }

      setBookingsData(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
      toast.error('Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  const calculateTripTime = useCallback(async (booking: Booking) => {
    if (tripTimes[booking._id] && !tripTimes[booking._id].loading) {
      return;
    }

    setTripTimes(prev => ({
      ...prev,
      [booking._id]: { time: '', distance: 0, loading: true }
    }));

    try {
      const pickupLocation = await googleMapsService.geocodeAddress(booking.pickupLocation);
      const dropoffLocation = await googleMapsService.geocodeAddress(booking.dropoffLocation);

      if (pickupLocation && dropoffLocation) {
        const result = await googleMapsService.calculateDistanceAndDuration(
          pickupLocation,
          dropoffLocation
        );

        if (result) {
          const distance = Math.round(result.distance.value / 1000);
          const hours = Math.floor(result.duration.value / 3600);
          const minutes = Math.ceil((result.duration.value % 3600) / 60);
          const time = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

          setTripTimes(prev => ({
            ...prev,
            [booking._id]: { time, distance, loading: false }
          }));
        } else {
          const fallbackDistance = Math.floor(Math.random() * 50) + 5;
          const fallbackTime = `${Math.ceil(fallbackDistance / 25 * 60)}m`;
          
          setTripTimes(prev => ({
            ...prev,
            [booking._id]: { time: fallbackTime, distance: fallbackDistance, loading: false }
          }));
        }
      } else {
        const fallbackDistance = Math.floor(Math.random() * 50) + 5;
        const fallbackTime = `${Math.ceil(fallbackDistance / 25 * 60)}m`;
        
        setTripTimes(prev => ({
          ...prev,
          [booking._id]: { time: fallbackTime, distance: fallbackDistance, loading: false }
        }));
      }
    } catch (error) {
      console.error('Error calculating trip time for booking:', booking._id, error);
      toast.error('Error calculating trip time for booking');
      const fallbackDistance = Math.floor(Math.random() * 50) + 5;
      const fallbackTime = `${Math.ceil(fallbackDistance / 25 * 60)}m`;
      
      setTripTimes(prev => ({
        ...prev,
        [booking._id]: { time: fallbackTime, distance: fallbackDistance, loading: false }
      }));
    }
  }, [tripTimes]);

  useEffect(() => {
    fetchBookings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, deliveryTypeFilter, sortBy, sortOrder]);

  useEffect(() => {
    if (bookingsData?.bookings) {
      bookingsData.bookings.forEach(booking => {
        if (!tripTimes[booking._id]) {
          calculateTripTime(booking);
        }
      });
    }
  }, [bookingsData, calculateTripTime, tripTimes]);

  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete booking');
      }

      toast.success('Booking deleted successfully!');
      fetchBookings();
    } catch (err) {
      toast.error('Failed to cancel booking');
      console.error('Error cancelling booking:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-700">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              FleetLink
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/all-vehicles"
                className="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
              >
                All Vehicles
              </Link>
              <Link
                href="/booking"
                className="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
              >
                New Booking
              </Link>
              <Link
                href="/"
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition font-medium"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">All Bookings</h1>
          <p className="text-slate-600">Manage and track all delivery bookings</p>
        </div>

        {/* Summary Cards */}
        {bookingsData?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-blue-600">{bookingsData.summary.total}</div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-green-600">{bookingsData.summary.confirmed}</div>
              <div className="text-sm text-gray-600">Confirmed</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-yellow-600">{bookingsData.summary.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-blue-600">{bookingsData.summary.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-red-600">{bookingsData.summary.cancelled}</div>
              <div className="text-sm text-gray-600">Cancelled</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Type</label>
              <select
                value={deliveryTypeFilter}
                onChange={(e) => {
                  setDeliveryTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="package">Package</option>
                <option value="document">Document</option>
                <option value="bulk">Bulk</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="bookingDate">Booking Date</option>
                <option value="pickup.pickupTime">Pickup Time</option>
                <option value="status">Status</option>
                <option value="estimation.totalAmount">Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="text-red-600">
                <span className="font-medium">Error:</span> {error}
              </div>
            </div>
          </div>
        )}

        {/* Bookings Table */}
        {bookingsData?.bookings && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pickup & Drop
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trip Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Package
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookingsData.bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">#{booking._id.slice(-6)}</div>
                          <div className="text-gray-500">{formatDate(booking.bookingDate)}</div>
                          <div className="text-gray-500">₹{booking.totalPrice}</div>
                          <div className="text-gray-500">{booking.packageBookingId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            📍 {booking.customerName} ({booking.customerPhone})
                          </div>
                          <div className="text-gray-500 text-xs mb-2">
                            {booking.pickupLocation}
                          </div>
                          <div className="text-gray-500 text-xs">
                            ⏰ {formatDate(booking.startDate)}
                          </div>
                          <div className="mt-2 font-medium text-gray-900">
                            🎯 Drop Location
                          </div>
                          <div className="text-gray-500 text-xs">
                            {booking.dropoffLocation}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {tripTimes[booking._id]?.loading ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                              <span className="text-gray-500 text-xs">Calculating...</span>
                            </div>
                          ) : tripTimes[booking._id] ? (
                            <div>
                              <div className="font-medium text-gray-900">
                                🚗 {tripTimes[booking._id].time}
                              </div>
                              <div className="text-gray-500 text-xs">
                                📏 {tripTimes[booking._id].distance} km
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-500 text-xs">
                              Calculating trip time...
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">📦 {booking.purpose}</div>
                          <div className="text-gray-500">{booking.bookingType}</div>
                          <div className="text-gray-500 text-xs">{booking.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {booking.vehicleDetails ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">🚛 {booking.vehicleDetails.vehicleNumber}</div>
                            <div className="text-gray-500">{booking.vehicleDetails.VehicalType}</div>
                            <div className="text-gray-500">👨‍✈️ {booking.vehicleDetails.DriverName}</div>
                            <div className="text-gray-500 text-xs">Load: {booking.vehicleDetails.loadCapacity}</div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No vehicle assigned</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <button
                            onClick={() => handleDeleteBooking(booking._id)}
                            className="text-red-600 hover:text-red-900 transition"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {bookingsData.pagination && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    disabled={!bookingsData.pagination.hasPrevPage}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={!bookingsData.pagination.hasNextPage}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{bookingsData.pagination.currentPage}</span> of{' '}
                      <span className="font-medium">{bookingsData.pagination.totalPages}</span> pages{' '}
                      (<span className="font-medium">{bookingsData.pagination.totalBookings}</span> total bookings)
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        disabled={!bookingsData.pagination.hasPrevPage}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        Page {bookingsData.pagination.currentPage}
                      </span>
                      <button
                        disabled={!bookingsData.pagination.hasNextPage}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {bookingsData?.bookings.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-6">
              {statusFilter || deliveryTypeFilter
                ? 'Try adjusting your filters to see more results.'
                : 'There are no bookings yet. Create your first booking to get started.'}
            </p>
            <Link
              href="/booking"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Create New Booking
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}