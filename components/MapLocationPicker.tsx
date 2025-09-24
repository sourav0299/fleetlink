'use client';

import { useEffect, useRef, useState } from 'react';
import { googleMapsService, MapLocation } from '@/lib/google-maps';

interface MapLocationPickerProps {
  onLocationSelect: (location: MapLocation) => void;
  onAddressChange: (address: string) => void;
  initialLocation?: MapLocation;
  initialAddress?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export default function MapLocationPicker({
  onLocationSelect,
  onAddressChange,
  initialLocation,
  initialAddress = '',
  placeholder = "Enter address manually...",
  label = "Location",
  required = false
}: MapLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLTextAreaElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerInstanceRef = useRef<google.maps.Marker | null>(null);
  const initialLocationRef = useRef(initialLocation);
  
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(initialLocation || null);
  const [addressText, setAddressText] = useState<string>(initialAddress);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    initialLocationRef.current = initialLocation;
  }, [initialLocation]);
  const handleAddressTextChange = (address: string) => {
    setAddressText(address);
    onAddressChange(address);
  };
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoading(true);
        await googleMapsService.loadMaps();

        if (!mapRef.current || !autocompleteRef.current) return;
        const defaultCenter = initialLocationRef.current 
          ? { lat: initialLocationRef.current.lat, lng: initialLocationRef.current.lng }
          : { lat: 28.6139, lng: 77.2090 };
        const mapInstance = new google.maps.Map(mapRef.current, {
          zoom: 15,
          center: defaultCenter,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        const markerInstance = new google.maps.Marker({
          position: defaultCenter,
          map: mapInstance,
          draggable: true,
          title: 'Drag to select exact location',
        });
        const autocompleteInstance = new google.maps.places.Autocomplete(
          autocompleteRef.current!,
          {
            types: ['establishment', 'geocode'],
            componentRestrictions: { country: 'IN' },
          }
        );
        const updateMapLocation = (location: MapLocation) => {
          const position = { lat: location.lat, lng: location.lng };
          mapInstance.setCenter(position);
          markerInstance.setPosition(position);
          setSelectedLocation(location);
          onLocationSelect(location);
        };
        autocompleteInstance.addListener('place_changed', () => {
          const place = autocompleteInstance.getPlace();
          if (place.geometry?.location) {
            const location: MapLocation = {
              address: place.formatted_address || place.name || '',
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              placeId: place.place_id,
            };
            updateMapLocation(location);
          }
        });
        markerInstance.addListener('dragend', async () => {
          const position = markerInstance.getPosition();
          if (position) {
            const lat = position.lat();
            const lng = position.lng();
            const address = await googleMapsService.reverseGeocode(lat, lng);
            if (address) {
              const location: MapLocation = { address, lat, lng };
              updateMapLocation(location);
            }
          }
        });
        mapInstance.addListener('click', async (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            const address = await googleMapsService.reverseGeocode(lat, lng);
            if (address) {
              const location: MapLocation = { address, lat, lng };
              updateMapLocation(location);
            }
          }
        });

        mapInstanceRef.current = mapInstance;
        markerInstanceRef.current = markerInstance;
        if (initialLocationRef.current) {
          updateMapLocation(initialLocationRef.current);
        }

      } catch (error) {
        console.error('Error initializing map:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label} - Manual Address {required && '*'}
        </label>
        <textarea
          ref={addressInputRef}
          value={addressText}
          onChange={(e) => handleAddressTextChange(e.target.value)}
          className="w-full px-4 py-3 border text-slate-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          placeholder={placeholder}
          rows={3}
        />
        <p className="text-sm text-gray-500 mt-1">
          ✏️ Type your address manually here
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Map Location Selection {required && '*'}
        </label>
        
        <div className="mb-4">
          <input
            ref={autocompleteRef}
            type="text"
            className="w-full px-4 py-3 border text-slate-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Search for a location on map..."
          />
          <p className="text-sm text-gray-500 mt-1">
            🔍 Search to find and pin location on map
          </p>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2">
            <span className="text-sm font-medium text-gray-700">Interactive Map - Click, Search, or Drag Pin</span>
          </div>
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading map...</p>
                </div>
              </div>
            )}
            <div
              ref={mapRef}
              className="w-full h-80"
              style={{ minHeight: '320px' }}
            />
          </div>
          {selectedLocation && (
            <div className="bg-blue-50 px-4 py-3 border-t">
              <p className="text-sm text-blue-800">
                <strong>📍 Map Pin Location:</strong> {selectedLocation.address}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Location Summary:</h4>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Manual Address:</strong> {addressText || 'Not entered'}
          </div>
          <div>
            <strong>Map Pin Location:</strong> {selectedLocation ? selectedLocation.address : 'Not selected'}
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          💡 Both addresses are saved independently. Use manual address for detailed instructions and map pin for exact coordinates.
        </p>
      </div>
    </div>
  );
}