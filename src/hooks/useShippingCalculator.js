import { useState } from "react";

// Ho Chi Minh City coordinates
const HCM_COORDS = { lat: 10.762622, lon: 106.660172 };

// Function to calculate Haversine distance (bird's-eye distance)
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const toRad = (angle) => (angle * Math.PI) / 180; // Convert degrees to radians

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in km
};

const useShippingCalculator = () => {
  const [distance, setDistance] = useState(null);
  const [shippingFee, setShippingFee] = useState(null);
  const [error, setError] = useState(null);

  const getCoordinates = async (provinceName) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(provinceName + ", Vietnam")}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      } else {
        throw new Error("Location not found");
      }
    } catch (err) {
      console.error("Error fetching coordinates:", err);
      return null;
    }
  };

  const calculateShipping = async (provinceName) => {
    setError(null);
    const destinationCoords = await getCoordinates(provinceName);

    if (!destinationCoords) {
      setError("Could not find coordinates for this province.");
      return;
    }

    const distInKm = haversineDistance(
      HCM_COORDS.lat,
      HCM_COORDS.lon,
      destinationCoords.lat,
      destinationCoords.lon
    );

    const fee = distInKm * 0.1;

    setDistance(distInKm);
    setShippingFee(fee);
  };

  return { distance, shippingFee, error, calculateShipping };
};

export default useShippingCalculator;
