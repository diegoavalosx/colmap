import Loader from "../components/Loader";
import {
  APIProvider,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  type MapCameraProps,
  type MapCameraChangedEvent,
} from "@vis.gl/react-google-maps";
import {
  collection,
  getDocs,
  query,
  where,
  type Firestore,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

const INITIAL_CAMERA = {
  center: { lat: 40.7128, lng: -74.006 },
  zoom: 14,
};

interface Location {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
}

const fetchUserLocations = async (userId: string, db: Firestore) => {
  const locations: Location[] = [];
  try {
    const campaignsRef = collection(db, "campaigns");
    const campaignsQuery = query(campaignsRef, where("userId", "==", userId));
    const campaignsSnapshot = await getDocs(campaignsQuery);

    const campaignIds = campaignsSnapshot.docs.map((doc) => doc.id);

    for (const campaignId of campaignIds) {
      const locationsRef = collection(db, `campaigns/${campaignId}/locations`);
      const locationsSnapshot = await getDocs(locationsRef);

      for (const locationDoc of locationsSnapshot.docs) {
        const data = locationDoc.data();
        locations.push({
          id: locationDoc.id,
          name: data.name,
          description: data.description,
          latitude: Number.parseFloat(data.latitude),
          longitude: Number.parseFloat(data.longitude),
          imageUrl: data.imageUrl,
        });
      }
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
  }
  return locations;
};

const InteractiveMap = () => {
  const [cameraProps, setCameraProps] =
    useState<MapCameraProps>(INITIAL_CAMERA);
  const handleCameraChange = useCallback(
    (ev: MapCameraChangedEvent) => setCameraProps(ev.detail),
    []
  );
  const [openInfoWindowId, setOpenInfoWindowId] = useState<string | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const { user, dataBase } = useAuth();

  useEffect(() => {
    const getGoogleMapsApiKey = async () => {
      fetch(`${import.meta.env.VITE_API_URL}/app/api/google-maps-config`).then(
        async (res) => {
          const { apiKey } = await res.json();
          setGoogleMapsApiKey(apiKey);
        }
      );
    };

    const fetchLocations = async () => {
      if (user && dataBase) {
        const userLocations = await fetchUserLocations(user.uid, dataBase);
        setLocations(userLocations);
        calculateCenterAndZoom(userLocations);
      }
    };

    const calculateCenterAndZoom = (locations: Location[]) => {
      if (!locations.length) return;

      if (locations.length === 1) {
        setCameraProps({
          center: {
            lat: locations[0].latitude,
            lng: locations[0].longitude,
          },
          zoom: 14,
        });
      } else {
        const bounds = new window.google.maps.LatLngBounds();
        for (const location of locations) {
          bounds.extend({
            lat: location.latitude,
            lng: location.longitude,
          });
        }

        const MAX_ZOOM = 21;

        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        const latDiff = Math.abs(ne.lat() - sw.lat());
        const lngDiff = Math.abs(ne.lng() - sw.lng());
        const latZoom = Math.floor(Math.log2(360 / latDiff) + 1);
        const lngZoom = Math.floor(Math.log2(360 / lngDiff) + 1);
        const calculatedZoom = Math.min(latZoom, lngZoom, MAX_ZOOM);

        setCameraProps({
          center: bounds.getCenter().toJSON(),
          zoom: calculatedZoom,
        });
      }
    };

    getGoogleMapsApiKey();
    fetchLocations();
  }, [user, dataBase]);

  return (
    <>
      {googleMapsApiKey ? (
        <APIProvider apiKey={googleMapsApiKey}>
          <Map
            {...cameraProps}
            onCameraChanged={handleCameraChange}
            mapId="80b9549366c22aeb"
            gestureHandling="auto"
            disableDefaultUI={false}
            zoomControl={true}
          >
            {locations.map((location) => (
              <AdvancedMarker
                key={location.id}
                position={{
                  lat: location.latitude,
                  lng: location.longitude,
                }}
                onClick={() => setOpenInfoWindowId(location.id)}
              >
                <Pin background="white" />
                {openInfoWindowId === location.id && (
                  <InfoWindow
                    position={{
                      lat: location.latitude,
                      lng: location.longitude,
                    }}
                    onCloseClick={() => setOpenInfoWindowId(null)}
                  >
                    <div className="w-64 p-4 bg-white rounded-lg shadow-lg text-left flex flex-col gap-2">
                      <h3 className="text-xl font-semibold">{location.name}</h3>

                      <p className="text-gray-600">{location.description}</p>

                      {location.imageUrl && (
                        <img
                          src={location.imageUrl}
                          alt={location.name}
                          className="rounded-lg w-full h-auto object-cover"
                        />
                      )}
                    </div>
                  </InfoWindow>
                )}
              </AdvancedMarker>
            ))}
          </Map>
        </APIProvider>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default InteractiveMap;
