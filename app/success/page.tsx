'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SuccessData {
  type: 'vehicle' | 'booking';
  id: string;
  paymentId?: string;
  amount?: number;
  vehicleNumber?: string;
  vehicleType?: string;
  driverName?: string;
  customerName?: string;
  customerMobile?: string;
  pickupLocation?: string;
  dropLocation?: string;
  bookingDate?: string;
  estimatedTime?: string;
  distance?: number;
}

function SuccessPageContent() {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  useEffect(() => {
    const type = searchParams.get('type') as 'vehicle' | 'booking';
    const id = searchParams.get('id');
    const paymentId = searchParams.get('paymentId');
    const amount = searchParams.get('amount');
    const vehicleNumber = searchParams.get('vehicleNumber');
    const vehicleType = searchParams.get('vehicleType');
    const driverName = searchParams.get('driverName');
    const customerName = searchParams.get('customerName');
    const customerMobile = searchParams.get('customerMobile');
    const pickupLocation = searchParams.get('pickupLocation');
    const dropLocation = searchParams.get('dropLocation');
    const bookingDate = searchParams.get('bookingDate');
    const estimatedTime = searchParams.get('estimatedTime');
    const distance = searchParams.get('distance');

    if (type && id) {
      setSuccessData({
        type,
        id,
        paymentId: paymentId || undefined,
        amount: amount ? parseFloat(amount) : undefined,
        vehicleNumber: vehicleNumber || undefined,
        vehicleType: vehicleType || undefined,
        driverName: driverName || undefined,
        customerName: customerName || undefined,
        customerMobile: customerMobile || undefined,
        pickupLocation: pickupLocation || undefined,
        dropLocation: dropLocation || undefined,
        bookingDate: bookingDate || undefined,
        estimatedTime: estimatedTime || undefined,
        distance: distance ? parseFloat(distance) : undefined,
      });
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleGoHome = () => {
    router.push('/');
  };

  if (!successData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Success Page</h1>
          <p className="text-gray-600 mb-6">No success data found.</p>
          <Link 
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              FleetLink
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-2xl w-full">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {successData.type === 'vehicle' ? 'Vehicle Added Successfully!' : 'Booking Confirmed Successfully!'}
            </h1>
            <p className="text-lg text-gray-600">
              {successData.type === 'vehicle' 
                ? 'Your vehicle has been registered in our fleet system.' 
                : 'Your booking has been confirmed and payment processed.'}
            </p>
          </div>

          {/* Success Details Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    {successData.type === 'vehicle' ? 'Vehicle Details' : 'Booking Details'}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {successData.type === 'vehicle' ? 'Vehicle ID:' : 'Booking ID:'}
                      </span>
                      <span className="font-semibold text-gray-900">{successData.id}</span>
                    </div>
                    
                    {successData.vehicleNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vehicle Number:</span>
                        <span className="font-semibold text-gray-900">{successData.vehicleNumber}</span>
                      </div>
                    )}
                    
                    {successData.vehicleType && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vehicle Type:</span>
                        <span className="font-semibold text-gray-900">{successData.vehicleType}</span>
                      </div>
                    )}
                    
                    {successData.driverName && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Driver Name:</span>
                        <span className="font-semibold text-gray-900">{successData.driverName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Info for Bookings */}
                {successData.type === 'booking' && (successData.customerName || successData.customerMobile) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Customer Information
                    </h3>
                    <div className="space-y-2">
                      {successData.customerName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-semibold text-gray-900">{successData.customerName}</span>
                        </div>
                      )}
                      {successData.customerMobile && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mobile:</span>
                          <span className="font-semibold text-gray-900">{successData.customerMobile}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Additional Info */}
              <div className="space-y-4">
                {/* Payment Info */}
                {successData.paymentId && successData.amount && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Payment Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment ID:</span>
                        <span className="font-mono text-xs text-gray-900">{successData.paymentId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="font-bold text-green-600">₹{successData.amount}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Trip Info for Bookings */}
                {successData.type === 'booking' && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Trip Information
                    </h3>
                    <div className="space-y-2">
                      {successData.pickupLocation && (
                        <div>
                          <span className="text-gray-600">📍 Pickup:</span>
                          <div className="text-sm text-gray-900 mt-1 pl-4">
                            {successData.pickupLocation.length > 50 
                              ? successData.pickupLocation.substring(0, 50) + '...'
                              : successData.pickupLocation}
                          </div>
                        </div>
                      )}
                      {successData.dropLocation && (
                        <div>
                          <span className="text-gray-600">🏁 Drop:</span>
                          <div className="text-sm text-gray-900 mt-1 pl-4">
                            {successData.dropLocation.length > 50 
                              ? successData.dropLocation.substring(0, 50) + '...'
                              : successData.dropLocation}
                          </div>
                        </div>
                      )}
                      {successData.distance && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Distance:</span>
                          <span className="font-semibold text-gray-900">{successData.distance} km</span>
                        </div>
                      )}
                      {successData.estimatedTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Est. Time:</span>
                          <span className="font-semibold text-gray-900">{successData.estimatedTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">What happens next?</h3>
            <div className="space-y-2 text-blue-800">
              {successData.type === 'vehicle' ? (
                <>
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2">📱</span>
                    <span>You will receive SMS confirmations on your registered mobile number</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2">🔍</span>
                    <span>Our team will verify your vehicle documents within 24 hours</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2">✅</span>
                    <span>Once approved, your vehicle will be available for booking</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2">📱</span>
                    <span>You will receive SMS updates on your mobile number</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2">👨‍✈️</span>
                    <span>The driver will contact you before pickup time</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2">🚛</span>
                    <span>Vehicle will arrive at your pickup location on time</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Auto-redirect Timer */}
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-600">
                Redirecting to home page in <span className="font-bold text-blue-600">{countdown}</span> seconds
              </span>
            </div>
            
            <button
              onClick={handleGoHome}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Go to Home Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function SuccessPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading success page...</p>
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessPageLoading />}>
      <SuccessPageContent />
    </Suspense>
  );
}