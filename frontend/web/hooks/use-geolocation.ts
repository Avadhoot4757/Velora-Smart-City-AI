import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  address: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    address: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Geolocation is not supported by this browser.',
      }));
      return;
    }

    const successHandler = async (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      
      try {
        // Get address from coordinates using reverse geocoding
        const address = await getAddressFromCoordinates(latitude, longitude);
        
        setState({
          latitude,
          longitude,
          accuracy,
          address,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error getting address:', error);
        setState({
          latitude,
          longitude,
          accuracy,
          address: null,
          isLoading: false,
          error: 'Could not get address from coordinates.',
        });
      }
    };

    const errorHandler = (error: GeolocationPositionError) => {
      let errorMessage = 'Unknown error occurred';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location services.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, options);
  }, []);

  return state;
}

async function getAddressFromCoordinates(latitude: number, longitude: number): Promise<string> {
  try {
    // Use Google Maps Geocoding API if available
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      
      return new Promise((resolve, reject) => {
        geocoder.geocode(
          { location: { lat: latitude, lng: longitude } },
          (results, status) => {
            if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
              // Extract the most relevant part of the address
              const addressComponents = results[0].address_components;
              const locality = addressComponents.find(component => 
                component.types.includes('locality')
              );
              const sublocality = addressComponents.find(component => 
                component.types.includes('sublocality')
              );
              const administrativeArea = addressComponents.find(component => 
                component.types.includes('administrative_area_level_1')
              );
              
              let address = '';
              if (sublocality) {
                address = sublocality.long_name;
              } else if (locality) {
                address = locality.long_name;
              }
              
              if (administrativeArea) {
                address += `, ${administrativeArea.long_name}`;
              }
              
              resolve(address || results[0].formatted_address);
            } else {
              reject(new Error('Geocoding failed'));
            }
          }
        );
      });
    } else {
      // Fallback: return coordinates as string
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
} 