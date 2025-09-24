import { Loader } from '@googlemaps/js-api-loader';
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export const googleMapsLoader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places', 'geometry'],
});

export interface MapLocation {
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
}

export interface DistanceMatrixResult {
  distance: {
    text: string;
    value: number; 
  };
  duration: {
    text: string;
    value: number;
  };
  status: string;
}

export class GoogleMapsService {
  private static instance: GoogleMapsService;
  private mapsLoaded = false;

  static getInstance(): GoogleMapsService {
    if (!GoogleMapsService.instance) {
      GoogleMapsService.instance = new GoogleMapsService();
    }
    return GoogleMapsService.instance;
  }

  async loadMaps(): Promise<typeof google.maps> {
    if (this.mapsLoaded) {
      return google.maps;
    }

    try {
      const google = await googleMapsLoader.load();
      this.mapsLoaded = true;
      return google.maps;
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      throw error;
    }
  }

  async calculateDistanceAndDuration(
    origin: MapLocation,
    destination: MapLocation
  ): Promise<DistanceMatrixResult | null> {
    try {
      await this.loadMaps();
      
      const service = new google.maps.DistanceMatrixService();
      
      return new Promise((resolve, reject) => {
        service.getDistanceMatrix({
          origins: [{ lat: origin.lat, lng: origin.lng }],
          destinations: [{ lat: destination.lat, lng: destination.lng }],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
        }, (response, status) => {
          if (status === google.maps.DistanceMatrixStatus.OK && response) {
            const element = response.rows[0]?.elements[0];
            if (element && element.status === 'OK') {
              resolve({
                distance: element.distance!,
                duration: element.duration!,
                status: element.status,
              });
            } else {
              reject(new Error('No route found'));
            }
          } else {
            reject(new Error(`Distance Matrix request failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Error calculating distance:', error);
      return null;
    }
  }

  async geocodeAddress(address: string): Promise<MapLocation | null> {
    try {
      await this.loadMaps();
      
      const geocoder = new google.maps.Geocoder();
      
      return new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            const result = results[0];
            const location = result.geometry.location;
            
            resolve({
              address: result.formatted_address,
              lat: location.lat(),
              lng: location.lng(),
              placeId: result.place_id,
            });
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      await this.loadMaps();
      
      const geocoder = new google.maps.Geocoder();
      
      return new Promise((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject(new Error(`Reverse geocoding failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }
}

export const googleMapsService = GoogleMapsService.getInstance();