'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRazorpay } from '../../hooks/useRazorpay';
import toast from 'react-hot-toast';

interface Vehicle {
  _id: string;
  vehicleNumber: string;
  VehicalType: string;
  DriverName: string;
  loadCapacity: string;
  status: string;
  DriverLicenceNumber?: string;
  mobileNumber?: string;
  VehicalTyerCondition?: string;
}

interface BookingData {
  pickup: {
    manualAddress?: string;
    mapLocation?: { address: string };
    name: string;
    mobile: string;
    pickupTime?: string;
  };
  drop: {
    manualAddress?: string;
    mapLocation?: { address: string };
    name: string;
    mobile: string;
  };
  package: {
    type: string;
    weight: number;
    weightUnit: string;
    description?: string;
  };
  estimation: {
    distance: number;
    estimatedTime: string;
    shippingCharges: number;
    gst: number;
    totalAmount: number;
  };
}

function VehicleSelectionPageContent() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { initiatePayment } = useRazorpay();
  
  const city = searchParams.get('city') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  useEffect(() => {
    const savedBookingData = sessionStorage.getItem('bookingData');
    
    if (savedBookingData) {
      try {
        const parsedData = JSON.parse(savedBookingData);
        setBookingData(parsedData);
      } catch (error) {
        console.error('Failed to parse booking data:', error);
        toast.error('Invalid booking data found. Please restart the booking process.');
      }
    } else {
      console.warn('No booking data found in sessionStorage');
    }
    
    // Fetch available vehicles
    const fetchAvailableVehicles = async () => {
      if (!city || !startDate || !endDate) {
        setError('Missing required parameters');
        setLoading(false);
        return;
      }

      try {
        const searchParams = new URLSearchParams({
          city: city,
          startDate: startDate,
          endDate: endDate
        });

        const response = await fetch(`/api/search-vehicles?${searchParams}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch vehicles');
        }

        setVehicles(result.vehicles || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
        console.error('Error fetching vehicles:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailableVehicles();
  }, [city, startDate, endDate]);

  const calculateEstimatedCost = (vehicle: Vehicle) => {
    if (!bookingData) {
      console.warn('No booking data available for cost calculation');
      return 100;
    }
    
    const baseRate = 50;
    const distance = bookingData.estimation?.distance || 10;
    const weight = bookingData.package?.weight || 1;
    
    console.log('Cost calculation inputs:', {
      distance,
      weight,
      vehicleType: vehicle.VehicalType,
      baseRate
    });

    let rateMultiplier = 1;
    switch (vehicle.VehicalType?.toLowerCase()) {
      case 'truck':
        rateMultiplier = 1.5;
        break;
      case 'tempo':
        rateMultiplier = 1.2;
        break;
      case 'auto':
        rateMultiplier = 0.8;
        break;
      default:
        rateMultiplier = 1;
    }
    
    const distanceRate = distance * 8 * rateMultiplier;
    const weightRate = weight * 3;
    const shippingCharges = Math.round(baseRate + distanceRate + weightRate);
    const gst = Math.round(shippingCharges * 0.18);
    
    const totalAmount = shippingCharges + gst;
    
    console.log('Cost calculation result:', {
      shippingCharges,
      gst,
      totalAmount,
      finalAmount: Math.max(totalAmount, 1)
    });
    
    return Math.max(totalAmount, 1);
  };

  const getVehicleIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'truck': return '🚛';
      case 'tempo': return '🚐';
      case 'auto': return '🛺';
      case 'bike': return '🏍️';
      default: return '🚗';
    }
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handlePaymentAndBooking = async () => {
    if (!selectedVehicle) {
      toast.error('Please select a vehicle first');
      return;
    }
    
    if (!bookingData) {
      toast.error('Booking data not found. Please go back and complete the booking form.');
      return;
    }
    
    if (!bookingData.pickup?.name || !bookingData.pickup?.mobile) {
      toast.error('Customer information is missing. Please go back and complete the booking form.');
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      const estimatedCost = calculateEstimatedCost(selectedVehicle);
      
      const tempBookingId = `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const paymentConfig = {
        amount: estimatedCost,
        bookingId: tempBookingId,
        customerName: bookingData.pickup.name,
        customerMobile: bookingData.pickup.mobile,
        vehicleNumber: selectedVehicle.vehicleNumber,
        description: `FleetLink Booking Payment - ${selectedVehicle.vehicleNumber}`,
      };

      console.log('Payment config:', paymentConfig);

      if (!paymentConfig.amount || paymentConfig.amount <= 0) {
        throw new Error(`Invalid amount: ₹${paymentConfig.amount}. Please refresh and try again.`);
      }
      
      if (!paymentConfig.customerName || paymentConfig.customerName.trim().length === 0) {
        throw new Error('Customer name is required');
      }
      
      if (!paymentConfig.customerMobile || paymentConfig.customerMobile.trim().length === 0) {
        throw new Error('Customer mobile number is required');
      }

      await initiatePayment(
        paymentConfig,
        async (paymentResponse) => {
          console.log('Payment successful:', paymentResponse);
          toast.success("Payment Success")
          await createBookingAfterPayment(paymentResponse, estimatedCost);
        },
        (error) => {
          console.error('Payment failed with error:', error);
          setIsProcessingPayment(false);
          
          let errorMessage = 'Payment failed. Please try again.';
          if (error.code === 'PAYMENT_CANCELLED') {
            errorMessage = 'Payment was cancelled. Please try again when ready.';
          } else if (error.code === 'INIT_ERROR') {
            errorMessage = `Payment initialization failed: ${error.description}`;
          } else if (error.description) {
            errorMessage = error.description;
          }
          
          toast.error(`❌ Payment Failed\n\nError Code: ${error.code}\n${errorMessage}\n\nPlease check the browser console for more details.`);
        }
      );
    } catch (error) {
      console.error('Error initiating payment:', error);
      setIsProcessingPayment(false);
      toast.error('Failed to initialize payment. Please try again.');
    }
  };

  const createBookingAfterPayment = async (
    paymentResponse: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }, 
    estimatedCost: number
  ) => {
    if (!selectedVehicle || !bookingData) return;
    
    setIsBooking(true);
    
    try {
      const response = await fetch('/api/package-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          assignedVehicle: {
            vehicleId: selectedVehicle._id,
            vehicleNumber: selectedVehicle.vehicleNumber,
            vehicleType: selectedVehicle.VehicalType,
            driverName: selectedVehicle.DriverName,
            loadCapacity: selectedVehicle.loadCapacity
          },
          estimation: {
            ...bookingData.estimation,
            totalAmount: estimatedCost
          },
          paymentDetails: {
            paymentId: paymentResponse.razorpay_payment_id,
            orderId: paymentResponse.razorpay_order_id,
            signature: paymentResponse.razorpay_signature,
            amount: estimatedCost,
            status: 'completed',
            paidAt: new Date().toISOString(),
          },
          deliveryType: 'package',
          bookingDate: new Date().toISOString(),
          estimatedStartTime: startDate,
          estimatedEndTime: endDate,
          status: 'confirmed',
          paymentStatus: 'paid',
          requiredVehicleType: selectedVehicle.VehicalType
        }),
      });

      const result = await response.json();

      if (response.ok) {
        sessionStorage.removeItem('bookingData');
        
        toast.success(`🎉 Booking Confirmed Successfully!

📋 Booking ID: ${result.packageBookingId}
� Payment ID: ${paymentResponse.razorpay_payment_id}
�🚛 Vehicle: ${selectedVehicle.vehicleNumber} (${selectedVehicle.VehicalType})
👨‍✈️ Driver: ${selectedVehicle.DriverName}
⚖️ Capacity: ${selectedVehicle.loadCapacity}
💰 Amount Paid: ₹${estimatedCost}

📱 You will receive SMS updates on your mobile number.
🕐 Driver will contact you before pickup time.`);
        
        router.push('/');
      } else {
        throw new Error(result.error || 'Booking creation failed after payment');
      }
    } catch (error) {
      console.error('Booking creation failed after payment:', error);
      toast.error(`❌ Critical Error: Payment was successful but booking creation failed. 
      
Payment ID: ${paymentResponse.razorpay_payment_id}
Please contact support with this Payment ID.

Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsBooking(false);
      setIsProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Finding available vehicles...</p>
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
              <button
                onClick={() => router.back()}
                className="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Choose Your Vehicle
          </h1>
          <p className="text-slate-600">
            Available vehicles in <span className="font-semibold text-blue-600">{city}</span> for your delivery
          </p>
          {bookingData && (
            <div className="mt-4 bg-blue-50 rounded-lg p-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <span className="text-gray-600">📍 Pickup:</span>
                  <div className="font-medium">{bookingData.pickup?.manualAddress?.substring(0, 30)}...</div>
                </div>
                <div>
                  <span className="text-gray-600">📦 Package:</span>
                  <div className="font-medium">{bookingData.package?.weight} {bookingData.package?.weightUnit}</div>
                </div>
                <div>
                  <span className="text-gray-600">📊 Distance:</span>
                  <div className="font-medium">{bookingData.estimation?.distance} km</div>
                </div>
              </div>
            </div>
          )}
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

        {/* No Vehicles Found */}
        {vehicles.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🚛</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles available</h3>
            <p className="text-gray-500 mb-6">
              No vehicles found in {city} for the selected time slot.
            </p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Different Time/Location
            </button>
          </div>
        )}

        {/* Vehicle List */}
        {vehicles.length > 0 && (
          <div className="space-y-4 mb-8">
            {vehicles.map((vehicle) => {
              const estimatedCost = calculateEstimatedCost(vehicle);
              const isSelected = selectedVehicle?._id === vehicle._id;
              
              return (
                <div
                  key={vehicle._id}
                  onClick={() => handleVehicleSelect(vehicle)}
                  className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all hover:shadow-md ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Vehicle Icon */}
                      <div className="text-4xl">
                        {getVehicleIcon(vehicle.VehicalType)}
                      </div>
                      
                      {/* Vehicle Details */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {vehicle.vehicleNumber}
                          </h3>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                            {vehicle.VehicalType}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <div>👨‍✈️ {vehicle.DriverName}</div>
                          {vehicle.DriverLicenceNumber && (
                            <div>🪪 {vehicle.DriverLicenceNumber}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Features */}
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2">Load Capacity</div>
                      <div className="font-semibold text-gray-900">⚖️ {vehicle.loadCapacity}</div>
                      {vehicle.VehicalTyerCondition && (
                        <div className="text-xs text-gray-500 mt-1">
                          Tire: {vehicle.VehicalTyerCondition}
                        </div>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">₹{estimatedCost}</div>
                      <div className="text-sm text-gray-500">Estimated Cost</div>
                      {isSelected && (
                        <div className="mt-2">
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            ✓ Selected
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Info for Selected Vehicle */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-blue-200 bg-blue-25">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <span className="ml-2 font-medium text-green-600">Available</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Load Capacity:</span>
                          <span className="ml-2 font-medium">{vehicle.loadCapacity}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Vehicle Type:</span>
                          <span className="ml-2 font-medium">{vehicle.VehicalType}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Confirm Booking Button */}
        {selectedVehicle && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">
                  {selectedVehicle.vehicleNumber} - ₹{calculateEstimatedCost(selectedVehicle)}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedVehicle.VehicalType} • {selectedVehicle.DriverName}
                </div>
              </div>
              <button
                onClick={handlePaymentAndBooking}
                disabled={isBooking || isProcessingPayment}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition font-semibold shadow-lg disabled:opacity-50"
              >
                {isProcessingPayment 
                  ? 'Processing Payment...' 
                  : isBooking 
                    ? 'Confirming Booking...' 
                    : '💳 Pay & Confirm Booking'
                }
              </button>
            </div>
          </div>
        )}

        {/* Spacing for fixed button */}
        {selectedVehicle && <div className="h-24"></div>}
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function VehicleSelectionLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading vehicle selection...</p>
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function VehicleSelectionPage() {
  return (
    <Suspense fallback={<VehicleSelectionLoading />}>
      <VehicleSelectionPageContent />
    </Suspense>
  );
}