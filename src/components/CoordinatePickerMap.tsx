import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

type Coordinates = { lat: number; lng: number };

interface CoordinatePickerMapProps {
  position: Coordinates | null;
  onPick: (coordinates: Coordinates) => void;
}

const DEFAULT_CENTER = { lat: 40.7128, lng: -74.006 };

const CoordinatePickerMap = ({ position, onPick }: CoordinatePickerMapProps) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${import.meta.env.VITE_API_URL}/app/api/google-maps-config`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Map configuration unavailable");
        return response.json() as Promise<{ apiKey: string }>;
      })
      .then(({ apiKey: fetchedApiKey }) => setApiKey(fetchedApiKey))
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }
        setError(true);
      });

    return () => controller.abort();
  }, []);

  const handleClick = (event: MapMouseEvent) => {
    if (event.detail.latLng) onPick(event.detail.latLng);
  };

  if (error) {
    return (
      <p className="rounded-md bg-gray-100 p-3 text-sm text-gray-600">
        The map could not load. Enter the coordinates in the fields above.
      </p>
    );
  }

  if (!apiKey) {
    return <div className="h-52 animate-pulse rounded-md bg-gray-100" />;
  }

  return (
    <div className="h-52 overflow-hidden rounded-md border border-gray-200">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={position ?? DEFAULT_CENTER}
          defaultZoom={position ? 17 : 11}
          mapId="80b9549366c22aeb"
          gestureHandling="greedy"
          disableDefaultUI={false}
          onClick={handleClick}
        >
          {position && (
            <AdvancedMarker position={position}>
              <Pin
                background="#E91E63"
                borderColor="#E91E63"
                glyphColor="white"
              />
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>
    </div>
  );
};

export default CoordinatePickerMap;
