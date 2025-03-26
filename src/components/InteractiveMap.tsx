import Loader from "../components/Loader";
import {
  APIProvider,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
  Map,
  AdvancedMarker,
  Pin,
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
  imageUrls: string[];
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
          imageUrls: data.imageUrls,
        });
      }
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
  }
  return locations;
};

const fetchCampaignLocations = async (campaignId: string, db: Firestore) => {
  try {
    const locationsRef = collection(db, `campaigns/${campaignId}/locations`);
    const locationsSnapshot = await getDocs(locationsRef);
    const locationsData: Location[] = locationsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        latitude: Number.parseFloat(data.latitude),
        longitude: Number.parseFloat(data.longitude),
        imageUrls: data.imageUrls,
      };
    });
    return locationsData;
  } catch (error) {
    console.error("Error fetching campaign locations:", error);
    return [];
  }
};

interface InteractiveMapProps {
  campaignId?: string;
  hoveredLocationId?: string | null;
  setActiveImageUrls?: React.Dispatch<React.SetStateAction<string[]>>;
  setImageModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  campaignId,
  hoveredLocationId,
  setActiveImageUrls,
  setImageModalOpen,
}) => {
  const [cameraProps, setCameraProps] =
    useState<MapCameraProps>(INITIAL_CAMERA);
  const handleCameraChange = useCallback(
    (ev: MapCameraChangedEvent) => setCameraProps(ev.detail),
    []
  );
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
        let locations: Location[];

        if (campaignId) {
          locations = await fetchCampaignLocations(campaignId, dataBase);
        } else {
          locations = await fetchUserLocations(user.uid, dataBase);
        }

        setLocations(locations);
        calculateCenterAndZoom(locations);
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
        console.log(calculatedZoom);

        setCameraProps({
          center: bounds.getCenter().toJSON(),
          zoom: 15,
        });
      }
    };

    getGoogleMapsApiKey();
    fetchLocations();
  }, [user, dataBase, campaignId]);

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
                onClick={() => {
                  if (location.imageUrls?.length) {
                    setActiveImageUrls?.(location.imageUrls);
                    setImageModalOpen?.(true);
                  } else {
                    console.log("No images for this location.");
                  }
                }}
              >
                <Pin
                  background={
                    hoveredLocationId === location.name
                      ? "ooh-yeah-pink"
                      : "white"
                  }
                  borderColor={
                    hoveredLocationId === location.name ? "blue" : "black"
                  }
                  glyphColor={
                    hoveredLocationId === location.name ? "white" : "black"
                  }
                />
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
