'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Vehicle {
  _id: string;
  vehicleNumber: string;
  VehicalType: string;
  DriverName: string;
  loadCapacity: string;
  City: string;
  status?: string;
  DriverLicenceNumber?: string;
  createdAt?: string;
  upcomingBooking?: {
    _id: string;
    customerName: string;
    startDate: string;
    endDate: string;
    status: string;
    packageBookingId: string;
    pickupLocation: string;
    dropoffLocation: string;
  } | null;
}

interface VehiclesData {
  vehicles: Vehicle[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalVehicles: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  summary: {
    total: number;
    byType: Array<{ _id: string; count: number }>;
    byCities: Array<{ _id: string; count: number }>;
    byStatus: Array<{ _id: string; count: number }>;
  };
}

export default function AllVehiclesPage() {
  const [vehiclesData, setVehiclesData] = useState<VehiclesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cityFilter, setCityFilter] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        sortOrder
      });

      if (cityFilter) params.append('city', cityFilter);
      if (vehicleTypeFilter) params.append('vehicleType', vehicleTypeFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/all-vehicles?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch vehicles');
      }

      setVehiclesData(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, cityFilter, vehicleTypeFilter, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);


  const formatDate = (dateString?: string) => {
    return dateString ? new Date(dateString).toLocaleString('en-IN') : 'N/A';
  };

  const getDaysUntilBooking = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return 'Started';
    return `${diffDays} days`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicles...</p>
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
                href="/all-bookings"
                className="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
              >
                All Bookings
              </Link>
              <Link
                href="/add-vehicle"
                className="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
              >
                Add Vehicle
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">All Vehicles</h1>
          <p className="text-slate-600">Manage your fleet of vehicles</p>
        </div>

        {/* Summary Cards */}
        {vehiclesData?.summary && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Total Vehicles */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="text-3xl font-bold text-blue-600 mb-2">{vehiclesData.summary.total}</div>
                <div className="text-gray-600">Total Vehicles</div>
              </div>

              {/* By Vehicle Type */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">By Vehicle Type</h3>
                <div className="space-y-2">
                  {vehiclesData.summary.byType.slice(0, 3).map((type) => (
                    <div key={type._id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{type._id || 'Unknown'}</span>
                      <span className="font-medium">{type.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Cities */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Cities</h3>
                <div className="space-y-2">
                  {vehiclesData.summary.byCities.slice(0, 3).map((city) => (
                    <div key={city._id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{city._id || 'Unknown'}</span>
                      <span className="font-medium">{city.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => {
                  setCityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by city..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
              <input
                type="text"
                value={vehicleTypeFilter}
                onChange={(e) => {
                  setVehicleTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by type..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
                <option value="available">Available</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Date Added</option>
                <option value="vehicleNumber">Vehicle Number</option>
                <option value="VehicalType">Vehicle Type</option>
                <option value="city">City</option>
                <option value="DriverName">Driver Name</option>
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

        {/* Vehicles Table */}
        {vehiclesData?.vehicles && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver & Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location & Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status & Upcoming Bookings
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vehiclesData.vehicles.map((vehicle) => (
                    <tr key={vehicle._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">🚛 {vehicle.vehicleNumber}</div>
                          <div className="text-gray-500">{vehicle.VehicalType}</div>
                          <div className="text-gray-500 text-xs">{formatDate(vehicle.createdAt)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">👨‍✈️ {vehicle.DriverName}</div>
                          {vehicle.DriverLicenceNumber && (
                            <div className="text-gray-500">🪪 {vehicle.DriverLicenceNumber}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">📍 {vehicle.City}</div>
                          <div className="text-gray-500">⚖️ {vehicle.loadCapacity}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {vehicle.upcomingBooking ? (
                            <div className="mt-2 p-2 bg-blue-50 rounded-md border-l-2 border-blue-200">
                              <div className="font-semibold text-blue-900 text-xs mb-1">
                                📋 {vehicle.upcomingBooking.packageBookingId}
                              </div>
                              <div className="text-blue-700 text-xs font-medium">
                                🚀 Starts in {getDaysUntilBooking(vehicle.upcomingBooking.startDate)}
                              </div>
                              <div className="text-gray-600 text-xs">
                                👤 {vehicle.upcomingBooking.customerName}
                              </div>
                              <div className="text-gray-500 text-xs">
                                📍 {vehicle.upcomingBooking.pickupLocation?.substring(0, 35)}...
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-500 text-xs mt-1">
                              No upcoming bookings
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {vehiclesData.pagination && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    disabled={!vehiclesData.pagination.hasPrevPage}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={!vehiclesData.pagination.hasNextPage}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{vehiclesData.pagination.currentPage}</span> of{' '}
                      <span className="font-medium">{vehiclesData.pagination.totalPages}</span> pages{' '}
                      (<span className="font-medium">{vehiclesData.pagination.totalVehicles}</span> total vehicles)
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        disabled={!vehiclesData.pagination.hasPrevPage}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        Page {vehiclesData.pagination.currentPage}
                      </span>
                      <button
                        disabled={!vehiclesData.pagination.hasNextPage}
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
        {vehiclesData?.vehicles.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🚛</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-500 mb-6">
              {cityFilter || vehicleTypeFilter || statusFilter
                ? 'Try adjusting your filters to see more results.'
                : 'There are no vehicles yet. Add your first vehicle to get started.'}
            </p>
            <Link
              href="/add-vehicle"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Add New Vehicle
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}