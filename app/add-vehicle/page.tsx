'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: {
      new (options: {
        key: string;
        amount: number;
        currency: string;
        name: string;
        description: string;
        order_id: string;
        handler: (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => void;
        prefill: {
          name: string;
          email?: string;
          contact?: string;
        };
        theme: {
          color: string;
        };
      }): {
        open: () => void;
      };
    };
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: {
              types?: string[];
              componentRestrictions?: { country: string };
            }
          ) => {
            addListener: (event: string, callback: () => void) => void;
            getPlace: () => {
              formatted_address?: string;
              address_components?: Array<{
                long_name: string;
                short_name: string;
                types: string[];
              }>;
              geometry?: {
                location: {
                  lat: () => number;
                  lng: () => number;
                };
              };
            };
          };
        };
      };
    };
  }
}

interface FormData {
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
}

type UpdateFormDataFunction = <K extends keyof FormData>(
  field: K, 
  value: FormData[K]
) => void;

const INITIAL_FORM_DATA: FormData = {
  vehicleNumber: '',
  VehicleRC: '',
  City: '',
  VehicalType: '',
  VehicalTyerCondition: '',
  loadCapacity: '',
  DriverName: '',
  DriverLicenceNumber: '',
  DriverLicence: '',
  OneTimeRegistration: false
};

export default function OnboardingPage() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [googleMapsLoading, setGoogleMapsLoading] = useState(true);
  const cityInputRef = useRef<HTMLInputElement>(null);

  const updateFormData: UpdateFormDataFunction = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (file: File, field: 'VehicleRC' | 'DriverLicence') => {
    setIsUploading(true);
    setUploadingField(field);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('upload_preset', 'sourav0299');
      
      const response = await fetch('https://api.cloudinary.com/v1_1/dzxx6craw/image/upload', {
        method: 'POST',
        body: uploadFormData
      });
      
      const data = await response.json();
      
      if (data.secure_url) {
        updateFormData(field, data.secure_url);
        console.log(`${field} uploaded successfully:`, data.secure_url);
        toast.success(`${field} uploaded successfully:`)
      } else {
        throw new Error('Upload failed: No secure URL returned');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(`${field} upload Failed`)
    } finally {
      setIsUploading(false);
      setUploadingField('');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        setRazorpayLoaded(true);
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const initializeAutocomplete = useCallback(() => {
    if (!cityInputRef.current || !window.google) {
      console.log('Autocomplete initialization failed: missing reference or Google Maps API');
      return;
    }

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(
        cityInputRef.current,
        {
          types: ['(cities)'],
          componentRestrictions: { country: 'IN' }
        }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        console.log('Place selected:', place);
        
        if (place.address_components) {
          const cityComponent = place.address_components.find(
            component => component.types.includes('locality') || 
                        component.types.includes('administrative_area_level_2')
          );
          
          if (cityComponent) {
            console.log('Setting city from component:', cityComponent.long_name);
            updateFormData('City', cityComponent.long_name);
          } else if (place.formatted_address) {
            const cityName = place.formatted_address.split(',')[0].trim();
            console.log('Setting city from formatted address:', cityName);
            updateFormData('City', cityName);
          }
        }
      });

    } catch (error) {
      console.error('Error initializing autocomplete:', error);
      toast.error('Error initializing autocomplete');

    }
  }, []);

  const loadGoogleMapsScript = useCallback(() => {
    return new Promise((resolve) => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey === '') {
        toast.error('Google Maps API key not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local');
        console.error('Google Maps API key not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local');
        setGoogleMapsLoading(false);
        resolve(false);
        return;
      }

      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('Google Maps API already loaded');
        setGoogleMapsLoading(false);
        initializeAutocomplete();
        resolve(true);
        return;
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('Google Maps script already exists, waiting for load...');
        if (existingScript.getAttribute('data-loaded') === 'true') {
          setGoogleMapsLoading(false);
          initializeAutocomplete();
          resolve(true);
        } else {
          existingScript.addEventListener('load', () => {
            console.log('Existing Google Maps API script loaded');
            setGoogleMapsLoading(false);
            setTimeout(() => {
              initializeAutocomplete();
            }, 100);
            resolve(true);
          });
        }
        return;
      }

      console.log('Loading Google Maps API...');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.setAttribute('data-loaded', 'false');
      
      script.onload = () => {
        console.log('Google Maps API loaded successfully');
        script.setAttribute('data-loaded', 'true');
        setGoogleMapsLoading(false);
        setTimeout(() => {
          initializeAutocomplete();
        }, 100);
        resolve(true);
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Maps API - check your API key and internet connection');
        console.error('API Key used:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not provided');
        setGoogleMapsLoading(false);
        resolve(false);
      };
      
      document.head.appendChild(script);
    });
  }, []);

  const createRazorpayOrder = async () => {
    try {
      const response = await fetch('/api/create-payment-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 9900,
          currency: 'INR',
        }),
      });
      
      const data = await response.json();
      return data.orderId;
    } catch (error) {
      console.error('Failed to create Razorpay order:', error);
      toast.error(`Failed to create Razorpay order`)
      throw error;
    }
  };

  const processPayment = async () => {
    setIsProcessingPayment(true);
    
    try {
      if (!razorpayLoaded) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error(`Payment failed to Load, Please try again`)
          return;
        }
      }

      const orderId = await createRazorpayOrder();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_1234567890',
        amount: 9900,
        currency: 'INR',
        name: 'FleetLink',
        description: 'Vehicle Registration Fee',
        order_id: orderId as string,
        handler: (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          saveToMongoDB(response);
        },
        prefill: {
          name: formData.DriverName,
          contact: '',
        },
        theme: {
          color: '#2563eb',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment process failed:', error);
      toast.error(`Payment Failed`)
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const saveToMongoDB = async (paymentResponse?: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => {
    try {
      const payload = {
        ...formData,
        paymentDetails: formData.OneTimeRegistration ? paymentResponse : null,
        registrationDate: new Date().toISOString(),
        status: formData.OneTimeRegistration ? 'paid' : 'free',
      };

      const response = await fetch('/api/vehicle-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        const successParams = new URLSearchParams({
          type: 'vehicle',
          id: result.vehicleId || 'N/A',
          vehicleNumber: formData.vehicleNumber,
          vehicleType: formData.VehicalType,
          driverName: formData.DriverName,
        });

        if (formData.OneTimeRegistration && paymentResponse) {
          successParams.append('paymentId', paymentResponse.razorpay_payment_id);
          successParams.append('amount', '99');
        }

        window.location.href = `/success?${successParams.toString()}`;
      } else {
        const error = await response.json();
        toast.error(`Registration failed ${error}`)
      }
    } catch (error) {
      console.error('Failed to save to MongoDB:', error);
      toast.error(`Failed to save to MongoDB:`)
    }
  };

  const handleSubmit = async () => {
    if (!formData.vehicleNumber || !formData.VehicalType || !formData.loadCapacity || !formData.City || 
        !formData.VehicalTyerCondition || !formData.DriverName || 
        !formData.DriverLicenceNumber || !formData.VehicleRC || !formData.DriverLicence) {
      toast.error('Please fill all required fields and upload documents.');
      return;
    }

    if (formData.OneTimeRegistration) {
      await processPayment();
    } else {
      await saveToMongoDB();
    }
  };

  useEffect(() => {
    loadRazorpayScript();
    loadGoogleMapsScript();
  }, [loadGoogleMapsScript]);

  useEffect(() => {
    if (cityInputRef.current && window.google && window.google.maps && window.google.maps.places) {
      console.log('Re-initializing autocomplete with available input ref');
      initializeAutocomplete();
    }
  }, [initializeAutocomplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/" className="text-2xl font-bold text-blue-600">FleetLink</Link>
              </div>
            </div>
            <div className="text-sm text-slate-600">
              Vehicle Registration
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-xl p-5">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 py-2">Vehicle Registration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Vehicle Number *
                </label>
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={(e) => updateFormData('vehicleNumber', e.target.value)}
                  className="w-full px-4 py-3 border text-slate-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter vehicle number (e.g., MH12AB1234)"
                  required
                />
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Vehicle Type *
                </label>
                <select
                  value={formData.VehicalType}
                  onChange={(e) => updateFormData('VehicalType', e.target.value)}
                  className="w-full px-4 py-3 border text-slate-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                >
                  <option value="">Select vehicle type</option>
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Car">Car</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Tempo">Tempo</option>
                  <option value="Mini Truck">Mini Truck</option>
                </select>
              </div>

              {/* Load Capacity */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Load Capacity *
                </label>
                <input
                  type="text"
                  value={formData.loadCapacity}
                  onChange={(e) => updateFormData('loadCapacity', e.target.value)}
                  className="w-full px-4 py-3 border text-slate-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter load capacity (e.g., 5 tons, 1000 kg)"
                  required
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  City *
                </label>
                <div className="relative">
                  <input
                    ref={cityInputRef}
                    type="text"
                    value={formData.City}
                    onChange={(e) => updateFormData('City', e.target.value)}
                    className="w-full text-slate-700 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder={googleMapsLoading ? "Loading Google Maps..." : "Search for a city..."}
                    disabled={googleMapsLoading}
                    required
                  />
                  {googleMapsLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {googleMapsLoading 
                    ? "Initializing Google Maps autocomplete..."
                    : "Start typing to search for cities using Google Maps"
                  }
                </div>
              </div>

              {/* Vehicle Tyre Condition */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Vehicle Tyre Condition *
                </label>
                <select
                  value={formData.VehicalTyerCondition}
                  onChange={(e) => updateFormData('VehicalTyerCondition', e.target.value)}
                  className="w-full text-slate-700 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                >
                  <option value="">Select tyre condition</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                  <option value="Needs Replacement">Needs Replacement</option>
                </select>
              </div>

              {/* Driver Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Driver Name *
                </label>
                <input
                  type="text"
                  value={formData.DriverName}
                  onChange={(e) => updateFormData('DriverName', e.target.value)}
                  className="w-full text-slate-700 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter driver's full name"
                  required
                />
              </div>

              {/* Driver Licence Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Driver Licence Number *
                </label>
                <input
                  type="text"
                  value={formData.DriverLicenceNumber}
                  onChange={(e) => updateFormData('DriverLicenceNumber', e.target.value)}
                  className="w-full px-4 text-slate-700 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter licence number"
                  required
                />
              </div>

                {/* Driver Licence Number */}
              <div>

              </div>

              {/* Vehicle RC Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Vehicle RC Document *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('RC file selected:', file.name, file.type, file.size);
                        handleFileUpload(file, 'VehicleRC');
                      }
                    }}
                    className="hidden"
                    id="vehicle-rc-upload"
                  />
                  <label
                    htmlFor="vehicle-rc-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-800 block"
                  >
                    {uploadingField === 'VehicleRC' ? (
                      <div className="text-blue-600">
                        <div className="text-2xl mb-2">⏳</div>
                        <div>Uploading RC Document...</div>
                      </div>
                    ) : formData.VehicleRC ? (
                      <div className="text-green-600">
                        <div className="text-3xl mb-2">✅</div>
                        <div>RC Document Uploaded</div>
                        <div className="text-xs text-gray-500 mt-1">Click to change</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-4xl mb-2">📁</div>
                        <div>Click to upload RC document</div>
                        <div className="text-sm text-gray-500">PNG, JPG or PDF (Max 10MB)</div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Driver Licence Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Driver Licence Document *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('Licence file selected:', file.name, file.type, file.size);
                        handleFileUpload(file, 'DriverLicence');
                      }
                    }}
                    className="hidden"
                    id="driver-licence-upload"
                  />
                  <label
                    htmlFor="driver-licence-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-800 block"
                  >
                    {uploadingField === 'DriverLicence' ? (
                      <div className="text-blue-600">
                        <div className="text-2xl mb-2">⏳</div>
                        <div>Uploading Licence Document...</div>
                      </div>
                    ) : formData.DriverLicence ? (
                      <div className="text-green-600">
                        <div className="text-3xl mb-2">✅</div>
                        <div>Licence Document Uploaded</div>
                        <div className="text-xs text-gray-500 mt-1">Click to change</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-4xl mb-2">📁</div>
                        <div>Click to upload licence document</div>
                        <div className="text-sm text-gray-500">PNG, JPG or PDF (Max 10MB)</div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* One Time Registration Checkbox */}
              <div className="md:col-span-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.OneTimeRegistration}
                      onChange={(e) => updateFormData('OneTimeRegistration', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-900">
                        One-Time Registration (₹99 fee applies)
                      </span>
                      <p className="text-xs text-slate-600 mt-1">
                        By checking this box, you agree to pay a one-time registration fee of ₹99. 
                        This will permanently add your vehicle to the FleetLink platform with full access to all features.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-8 pt-6 border-t">
              <button
                onClick={handleSubmit}
                disabled={isUploading || isProcessingPayment}
                className={`px-8 py-3 rounded-lg font-semibold shadow-lg transition ${
                  isUploading || isProcessingPayment
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                }`}
              >
                {isUploading 
                  ? 'Uploading...' 
                  : isProcessingPayment 
                    ? 'Processing Payment...'
                    : formData.OneTimeRegistration 
                      ? 'Pay ₹99 & Register'
                      : 'Register Vehicle'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}