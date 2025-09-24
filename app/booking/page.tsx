"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import MapLocationPicker from "@/components/MapLocationPicker";
import { googleMapsService, MapLocation } from "@/lib/google-maps";
import toast from "react-hot-toast";

interface LocationData {
  manualAddress: string;
  mapLocation: MapLocation | null;
  name: string;
  mobile: string;
  pickupTime?: string;
}

interface PackageData {
  type: string;
  weight: number;
  weightUnit: "kg" | "grams";
  description: string;
}

interface EstimationData {
  distance: number;
  estimatedTime: string;
  shippingCharges: number;
  gst: number;
  totalAmount: number;
}

interface BookingFormData {
  pickup: LocationData;
  drop: LocationData;
  package: PackageData;
  estimation: EstimationData;
}

const INITIAL_LOCATION_DATA: LocationData = {
  manualAddress: "",
  mapLocation: null,
  name: "",
  mobile: "",
  pickupTime: "",
};

const INITIAL_PACKAGE_DATA: PackageData = {
  type: "",
  weight: 0,
  weightUnit: "kg",
  description: "",
};

const INITIAL_ESTIMATION_DATA: EstimationData = {
  distance: 0,
  estimatedTime: "",
  shippingCharges: 0,
  gst: 0,
  totalAmount: 0,
};

const INITIAL_BOOKING_DATA: BookingFormData = {
  pickup: INITIAL_LOCATION_DATA,
  drop: INITIAL_LOCATION_DATA,
  package: INITIAL_PACKAGE_DATA,
  estimation: INITIAL_ESTIMATION_DATA,
};

export default function BookingPage() {
  const [bookingData, setBookingData] =
    useState<BookingFormData>(INITIAL_BOOKING_DATA);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculatingTrip, setIsCalculatingTrip] = useState(false);
  const [tripEstimation, setTripEstimation] = useState<{
    distance: number;
    duration: string;
  } | null>(null);

  const packageTypes = [
    { value: "documents", label: "Documents", icon: "📄" },
    { value: "food", label: "Food Items", icon: "🍔" },
    { value: "electronics", label: "Electronics", icon: "📱" },
    { value: "clothing", label: "Clothing", icon: "👕" },
    { value: "furniture", label: "Furniture", icon: "🪑" },
    { value: "medicines", label: "Medicines", icon: "💊" },
    { value: "groceries", label: "Groceries", icon: "🛒" },
    { value: "other", label: "Other", icon: "📦" },
  ];

  const updatePickupData = (field: keyof LocationData, value: string) => {
    setBookingData((prev) => ({
      ...prev,
      pickup: { ...prev.pickup, [field]: value },
    }));
  };

  const updateDropData = (field: keyof LocationData, value: string) => {
    setBookingData((prev) => ({
      ...prev,
      drop: { ...prev.drop, [field]: value },
    }));
  };

  const handlePickupLocationSelect = useCallback((location: MapLocation) => {
    setBookingData((prev) => ({
      ...prev,
      pickup: {
        ...prev.pickup,
        mapLocation: location,
      },
    }));
  }, []);

  const handlePickupAddressChange = useCallback((address: string) => {
    setBookingData((prev) => ({
      ...prev,
      pickup: {
        ...prev.pickup,
        manualAddress: address,
      },
    }));
  }, []);

  const handleDropLocationSelect = useCallback((location: MapLocation) => {
    setBookingData((prev) => ({
      ...prev,
      drop: {
        ...prev.drop,
        mapLocation: location,
      },
    }));
  }, []);

  const handleDropAddressChange = useCallback((address: string) => {
    setBookingData((prev) => ({
      ...prev,
      drop: {
        ...prev.drop,
        manualAddress: address,
      },
    }));
  }, []);

  const updatePackageData = (
    field: keyof PackageData,
    value: string | number
  ) => {
    setBookingData((prev) => ({
      ...prev,
      package: { ...prev.package, [field]: value },
    }));
  };

  const getSafeWeight = () => {
    return isNaN(bookingData.package.weight) ? 0 : bookingData.package.weight;
  };

  const calculateTripEstimation = useCallback(async () => {
    if (!bookingData.pickup.mapLocation || !bookingData.drop.mapLocation) {
      return;
    }

    setIsCalculatingTrip(true);
    try {
      let distance = 0;
      let duration = "";

      const result = await googleMapsService.calculateDistanceAndDuration(
        bookingData.pickup.mapLocation,
        bookingData.drop.mapLocation
      );

      if (result) {
        distance = Math.round(result.distance.value / 1000);
        const hours = Math.floor(result.duration.value / 3600);
        const minutes = Math.ceil((result.duration.value % 3600) / 60);
        duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      } else {
        distance = Math.floor(Math.random() * 50) + 5;
        duration = `${Math.ceil((distance / 25) * 60)}m`;
      }

      setTripEstimation({ distance, duration });
    } catch (error) {
      console.error("Error calculating trip estimation:", error);
      toast.error("Error calculating trip estimation");
      const distance = Math.floor(Math.random() * 50) + 5;
      const duration = `${Math.ceil((distance / 25) * 60)}m`;
      setTripEstimation({ distance, duration });
    } finally {
      setIsCalculatingTrip(false);
    }
  }, [bookingData.pickup.mapLocation, bookingData.drop.mapLocation]);

  useEffect(() => {
    if (
      bookingData.pickup.mapLocation &&
      bookingData.drop.mapLocation &&
      !isCalculatingTrip
    ) {
      calculateTripEstimation();
    }
  }, [
    bookingData.pickup.mapLocation,
    bookingData.drop.mapLocation,
    calculateTripEstimation,
    isCalculatingTrip,
  ]);

  const calculateEstimation = async () => {
    setIsLoading(true);
    try {
      let distance = 0;
      let duration = "";

      if (bookingData.pickup.mapLocation && bookingData.drop.mapLocation) {
        const result = await googleMapsService.calculateDistanceAndDuration(
          bookingData.pickup.mapLocation,
          bookingData.drop.mapLocation
        );

        if (result) {
          distance = Math.round(result.distance.value / 1000);
          const hours = Math.floor(result.duration.value / 3600);
          const minutes = Math.ceil((result.duration.value % 3600) / 60);
          duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        } else {
          distance = Math.floor(Math.random() * 50) + 5;
          duration = `${Math.ceil((distance / 25) * 60)}m`;
        }
      } else {
        distance = Math.floor(Math.random() * 50) + 5;
        duration = `${Math.ceil((distance / 25) * 60)}m`;
      }

      const baseRate = 50;
      const distanceRate = distance * 8;
      const weight = getSafeWeight();
      const weightRate = weight * 3;

      const shippingCharges = Math.round(baseRate + distanceRate + weightRate);
      const gst = Math.round(shippingCharges * 0.18);
      const totalAmount = shippingCharges + gst;

      const estimation: EstimationData = {
        distance,
        estimatedTime: duration,
        shippingCharges,
        gst,
        totalAmount,
      };

      setBookingData((prev) => ({ ...prev, estimation }));
      setCurrentStep(4);
    } catch (error) {
      console.error("Error calculating estimation:", error);
      toast.error("Failed to calculate estimation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    switch (currentStep) {
      case 1:
        if (
          !bookingData.pickup.name ||
          !bookingData.pickup.mobile ||
          !bookingData.pickup.pickupTime ||
          (!bookingData.pickup.manualAddress && !bookingData.pickup.mapLocation)
        ) {
          toast.error(
            "Please fill all pickup details including at least one address (manual or map location) and pickup time"
          );
          return;
        }
        setCurrentStep(2);
        break;
      case 2:
        if (
          !bookingData.drop.name ||
          !bookingData.drop.mobile ||
          (!bookingData.drop.manualAddress && !bookingData.drop.mapLocation)
        ) {
          toast.error(
            "Please fill all drop details including at least one address (manual or map location)"
          );
          return;
        }
        setCurrentStep(3);
        break;
      case 3:
        if (!bookingData.package.type || bookingData.package.weight <= 0) {
          toast.error("Please select package type and enter weight");
          return;
        }
        await calculateEstimation();
        break;
      case 4:
        setCurrentStep(5);
        break;
      case 5:
        await handleBookingSubmit();
        break;
    }
  };

  const handleBookingSubmit = async () => {
    setIsLoading(true);
    try {
      const deliveryDate =
        bookingData.pickup.pickupTime || new Date().toISOString();
      const estimatedEndTime = new Date(deliveryDate);
      estimatedEndTime.setHours(estimatedEndTime.getHours() + 6);
      let city = "Delhi";

      if (bookingData.pickup.mapLocation?.address) {
        const address = bookingData.pickup.mapLocation.address;
        console.log("Full pickup address:", address);

        const addressParts = address.split(",").map((part) => part.trim());
        console.log("Address parts:", addressParts);

        if (addressParts.length >= 3) {
          const thirdFromEnd = addressParts[addressParts.length - 3];
          if (
            thirdFromEnd &&
            thirdFromEnd.length >= 2 &&
            !/^\d+$/.test(thirdFromEnd)
          ) {
            city = thirdFromEnd;
            console.log("City from 3rd position from end:", city);
          } else if (addressParts.length >= 2) {
            const secondFromEnd = addressParts[addressParts.length - 2];
            if (
              secondFromEnd &&
              secondFromEnd.length >= 2 &&
              !/^\d+$/.test(secondFromEnd)
            ) {
              city = secondFromEnd;
              console.log("City from 2nd position from end:", city);
            }
          }
        } else if (addressParts.length === 2) {
          const firstPart = addressParts[0];
          if (firstPart && firstPart.length >= 2) {
            city = firstPart;
            console.log("City from first part (2 parts total):", city);
          }
        }

        console.log("Extracted city from map location:", city);
      }

      if (
        (city === "Delhi" || !bookingData.pickup.mapLocation) &&
        bookingData.pickup.manualAddress
      ) {
        const manualAddress = bookingData.pickup.manualAddress.trim();
        console.log("Trying manual address:", manualAddress);

        if (manualAddress) {
          const manualParts = manualAddress
            .split(",")
            .map((part) => part.trim());
          console.log("Manual address parts:", manualParts);

          if (manualParts.length >= 3) {
            const thirdFromEnd = manualParts[manualParts.length - 3];
            if (
              thirdFromEnd &&
              thirdFromEnd.length >= 2 &&
              !/^\d+$/.test(thirdFromEnd)
            ) {
              city = thirdFromEnd;
              console.log("City from manual address (3rd from end):", city);
            } else if (manualParts.length >= 2) {
              const secondFromEnd = manualParts[manualParts.length - 2];
              if (
                secondFromEnd &&
                secondFromEnd.length >= 2 &&
                !/^\d+$/.test(secondFromEnd)
              ) {
                city = secondFromEnd;
                console.log("City from manual address (2nd from end):", city);
              }
            }
          } else if (manualParts.length === 2) {
            const firstPart = manualParts[0];
            if (firstPart && firstPart.length >= 2) {
              city = firstPart;
              console.log("City from manual address (first part):", city);
            }
          } else if (manualParts.length === 1) {
            const singlePart = manualParts[0];
            if (singlePart.length >= 2) {
              city = singlePart;
              console.log("City from single manual address:", city);
            }
          }
        }
      }

      console.log("Final extracted city:", city);

      sessionStorage.setItem("bookingData", JSON.stringify(bookingData));

      const searchParams = new URLSearchParams({
        city: city,
        startDate: deliveryDate,
        endDate: estimatedEndTime.toISOString(),
      });

      window.location.href = `/select-vehicle?${searchParams.toString()}`;
    } catch (error) {
      console.error("Error preparing vehicle selection:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to proceed to vehicle selection. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3 | 4 | 5);
    }
  };

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Book Delivery
          </h1>
          <p className="text-xl text-slate-700">
            Fast, reliable delivery service at your fingertips
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {index < 4 && (
                  <div
                    className={`w-16 h-1 ${
                      step < currentStep ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Labels */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-5 gap-4 text-center text-sm">
            <div
              className={
                currentStep === 1
                  ? "text-blue-600 font-semibold"
                  : "text-gray-600"
              }
            >
              Pickup
            </div>
            <div
              className={
                currentStep === 2
                  ? "text-blue-600 font-semibold"
                  : "text-gray-600"
              }
            >
              Drop
            </div>
            <div
              className={
                currentStep === 3
                  ? "text-blue-600 font-semibold"
                  : "text-gray-600"
              }
            >
              Package
            </div>
            <div
              className={
                currentStep === 4
                  ? "text-blue-600 font-semibold"
                  : "text-gray-600"
              }
            >
              Estimation
            </div>
            <div
              className={
                currentStep === 5
                  ? "text-blue-600 font-semibold"
                  : "text-gray-600"
              }
            >
              Review
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Step 1: Pickup Location */}
          {currentStep === 1 && (
            <div>
              <div className="flex items-center mb-6">
                <div className="text-3xl mr-4">📍</div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Pickup Location
                </h2>
              </div>

              <div className="space-y-6">
                <MapLocationPicker
                  label="Pickup Location"
                  placeholder="Enter pickup address manually..."
                  onLocationSelect={handlePickupLocationSelect}
                  onAddressChange={handlePickupAddressChange}
                  initialLocation={bookingData.pickup.mapLocation || undefined}
                  initialAddress={bookingData.pickup.manualAddress}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Contact Person Name *
                    </label>
                    <input
                      type="text"
                      value={bookingData.pickup.name}
                      onChange={(e) => updatePickupData("name", e.target.value)}
                      className="w-full px-4 py-3 border text-slate-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter contact person name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={bookingData.pickup.mobile}
                      onChange={(e) =>
                        updatePickupData("mobile", e.target.value)
                      }
                      className="w-full px-4 py-3 border text-slate-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter 10-digit mobile number"
                      pattern="[0-9]{10}"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Preferred Pickup Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={bookingData.pickup.pickupTime}
                    onChange={(e) =>
                      updatePickupData("pickupTime", e.target.value)
                    }
                    className="w-full px-4 py-3 border text-slate-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    ⏰ Select your preferred pickup date and time
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Drop Location */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center mb-6">
                <div className="text-3xl mr-4">🎯</div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Drop Location
                </h2>
              </div>

              <div className="space-y-6">
                <MapLocationPicker
                  label="Drop Location"
                  placeholder="Enter drop address manually..."
                  onLocationSelect={handleDropLocationSelect}
                  onAddressChange={handleDropAddressChange}
                  initialLocation={bookingData.drop.mapLocation || undefined}
                  initialAddress={bookingData.drop.manualAddress}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Receiver Name *
                    </label>
                    <input
                      type="text"
                      value={bookingData.drop.name}
                      onChange={(e) => updateDropData("name", e.target.value)}
                      className="w-full px-4 py-3 border text-slate-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter receiver name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Receiver Mobile *
                    </label>
                    <input
                      type="tel"
                      value={bookingData.drop.mobile}
                      onChange={(e) => updateDropData("mobile", e.target.value)}
                      className="w-full px-4 py-3 border text-slate-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter 10-digit mobile number"
                      pattern="[0-9]{10}"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Package Details */}
          {currentStep === 3 && (
            <div>
              <div className="flex items-center mb-6">
                <div className="text-3xl mr-4">📦</div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Package Details
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-4">
                    Package Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {packageTypes.map((pkg) => (
                      <div
                        key={pkg.value}
                        onClick={() => updatePackageData("type", pkg.value)}
                        className={`border-2 rounded-lg p-4 cursor-pointer text-center transition-all ${
                          bookingData.package.type === pkg.value
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <div className="text-2xl mb-2">{pkg.icon}</div>
                        <div className="text-sm font-medium">{pkg.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Package Weight *
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        value={bookingData.package.weight || ""}
                        onChange={(e) =>
                          updatePackageData(
                            "weight",
                            e.target.value === ""
                              ? 0
                              : parseFloat(e.target.value) || 0
                          )
                        }
                        className="flex-1 px-4 py-3 border text-slate-700 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Enter weight"
                        min="0.1"
                        step="0.1"
                        required
                      />
                      <select
                        value={bookingData.package.weightUnit}
                        onChange={(e) =>
                          updatePackageData(
                            "weightUnit",
                            e.target.value as "kg" | "grams"
                          )
                        }
                        className="px-4 py-3 border border-l-0 text-slate-700 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      >
                        <option value="kg">KG</option>
                        <option value="grams">Grams</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Package Description
                    </label>
                    <input
                      type="text"
                      value={bookingData.package.description}
                      onChange={(e) =>
                        updatePackageData("description", e.target.value)
                      }
                      className="w-full px-4 py-3 border text-slate-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Brief description of items"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Estimation */}
          {currentStep === 4 && (
            <div>
              <div className="flex items-center mb-6">
                <div className="text-3xl mr-4">📊</div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Delivery Estimation
                </h2>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl text-blue-600 font-bold">
                      {bookingData.estimation.distance} km
                    </div>
                    <div className="text-slate-600">Distance</div>
                  </div>
                  <div>
                    <div className="text-3xl text-green-600 font-bold">
                      {bookingData.estimation.estimatedTime}
                    </div>
                    <div className="text-slate-600">Estimated Time</div>
                  </div>
                  <div>
                    <div className="text-3xl text-purple-600 font-bold">
                      ₹{bookingData.estimation.totalAmount}
                    </div>
                    <div className="text-slate-600">Total Amount</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Price Breakdown
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Base Rate</span>
                      <span className="font-medium">₹50</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">
                        Distance Rate ({bookingData.estimation.distance} km ×
                        ₹8)
                      </span>
                      <span className="font-medium">
                        ₹{bookingData.estimation.distance * 8}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">
                        Weight Rate ({getSafeWeight()}{" "}
                        {bookingData.package.weightUnit} × ₹3)
                      </span>
                      <span className="font-medium">
                        ₹{getSafeWeight() * 3}
                      </span>
                    </div>
                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="text-slate-700 font-medium">
                        Shipping Charges
                      </span>
                      <span className="font-semibold">
                        ₹{bookingData.estimation.shippingCharges}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">GST (18%)</span>
                      <span className="font-medium">
                        ₹{bookingData.estimation.gst}
                      </span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg font-bold">
                      <span>Total Amount to be Paid</span>
                      <span className="text-blue-600">
                        ₹{bookingData.estimation.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div>
              <div className="flex items-center mb-6">
                <div className="text-3xl mr-4">✅</div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Review & Confirm
                </h2>
              </div>

              <div className="space-y-6">
                {/* Pickup Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3">
                    📍 Pickup Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Manual Address:</strong>{" "}
                      {bookingData.pickup.manualAddress || "Not provided"}
                    </div>
                    <div>
                      <strong>Map Location:</strong>{" "}
                      {bookingData.pickup.mapLocation?.address ||
                        "Not selected"}
                    </div>
                    <div>
                      <strong>Contact:</strong> {bookingData.pickup.name} (
                      {bookingData.pickup.mobile})
                    </div>
                    <div>
                      <strong>Pickup Time:</strong>{" "}
                      {bookingData.pickup.pickupTime
                        ? new Date(
                            bookingData.pickup.pickupTime
                          ).toLocaleString()
                        : "Not specified"}
                    </div>
                  </div>
                </div>

                {/* Drop Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3">
                    🎯 Drop Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Manual Address:</strong>{" "}
                      {bookingData.drop.manualAddress || "Not provided"}
                    </div>
                    <div>
                      <strong>Map Location:</strong>{" "}
                      {bookingData.drop.mapLocation?.address || "Not selected"}
                    </div>
                    <div>
                      <strong>Receiver:</strong> {bookingData.drop.name} (
                      {bookingData.drop.mobile})
                    </div>
                  </div>
                </div>

                {/* Package Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3">
                    📦 Package Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Type:</strong>{" "}
                      {
                        packageTypes.find(
                          (p) => p.value === bookingData.package.type
                        )?.label
                      }
                    </div>
                    <div>
                      <strong>Weight:</strong> {bookingData.package.weight}{" "}
                      {bookingData.package.weightUnit}
                    </div>
                    {bookingData.package.description && (
                      <div>
                        <strong>Description:</strong>{" "}
                        {bookingData.package.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Estimation */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3">
                    📊 Delivery Estimation
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Distance:</strong>{" "}
                      {bookingData.estimation.distance} km
                    </div>
                    <div>
                      <strong>Estimated Time:</strong>{" "}
                      {bookingData.estimation.estimatedTime}
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3">
                    💰 Payment Summary
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-white rounded p-3 space-y-2">
                      <h4 className="font-medium text-slate-800 mb-2">
                        Calculation Breakdown:
                      </h4>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Base Rate</span>
                        <span>₹50</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">
                          Distance ({bookingData.estimation.distance} km × ₹8)
                        </span>
                        <span>₹{bookingData.estimation.distance * 8}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">
                          Weight ({getSafeWeight()}{" "}
                          {bookingData.package.weightUnit} × ₹3)
                        </span>
                        <span>₹{getSafeWeight() * 3}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>Shipping Charges</span>
                        <span>₹{bookingData.estimation.shippingCharges}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18%)</span>
                      <span>₹{bookingData.estimation.gst}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total Amount to be Paid</span>
                      <span className="text-green-600">
                        ₹{bookingData.estimation.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Back
              </button>
            )}

            <div className="ml-auto">
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-semibold shadow-lg disabled:opacity-50"
              >
                {isLoading
                  ? "Processing..."
                  : currentStep === 5
                  ? "Confirm Booking"
                  : currentStep === 3
                  ? "Calculate Estimation"
                  : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
