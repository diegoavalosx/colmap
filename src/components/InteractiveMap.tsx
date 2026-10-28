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
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

const INITIAL_CAMERA = {
  center: { lat: 40.7128, lng: -74.006 },
  zoom: 12,
};

export interface MapLocation {
  id: string;
  name?: string;
  description?: string;
  latitude: number;
  longitude: number;
  imageUrls: string[];
}

interface InteractiveMapProps {
  campaignId?: string;
  hoveredLocationId?: string | null;
  setActiveImageUrls?: React.Dispatch<React.SetStateAction<string[]>>;
  setImageModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  providedLocations?: MapLocation[];
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  campaignId,
  hoveredLocationId,
  setActiveImageUrls,
  setImageModalOpen,
  providedLocations,
}) => {
  const [cameraProps, setCameraProps] =
    useState<MapCameraProps>(INITIAL_CAMERA);
  const handleCameraChange = useCallback(
    (ev: MapCameraChangedEvent) => setCameraProps(ev.detail),
    []
  );
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | null>(null);
  const [locations, setLocations] = useState<MapLocation[]>([]);
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

    getGoogleMapsApiKey();
  }, []);

  useEffect(() => {
    if (providedLocations) {
      setLocations(providedLocations);
      return;
    }

    if (!user || !dataBase) return;

    let unsubscribeLocations: (() => void) | undefined;

    if (campaignId) {
      // Listen to locations in a specific campaign
      const locationsRef = collection(
        dataBase,
        `campaigns/${campaignId}/locations`
      );
      unsubscribeLocations = onSnapshot(locationsRef, (snapshot) => {
        const locationsData: MapLocation[] = snapshot.docs.map((doc) => {
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
        setLocations(locationsData);
      });
    } else {
      // Listen to all campaigns for the user
      const campaignsRef = collection(dataBase, "campaigns");
      const campaignsQuery = query(
        campaignsRef,
        where("userId", "==", user.uid)
      );

      const unsubscribeCampaigns = onSnapshot(
        campaignsQuery,
        async (campaignsSnapshot) => {
          const campaignIds = campaignsSnapshot.docs.map((doc) => doc.id);

          // For each campaign, listen to its locations
          const locationUnsubscribers = campaignIds.map((campaignId) => {
            const locationsRef = collection(
              dataBase,
              `campaigns/${campaignId}/locations`
            );
            return onSnapshot(locationsRef, (locationsSnapshot) => {
              const campaignLocations = locationsSnapshot.docs.map((doc) => {
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

              // Update all locations by replacing the locations for this campaign
              setLocations((prevLocations) => {
                const otherLocations = prevLocations.filter(
                  (loc) => !loc.id.startsWith(campaignId)
                );
                return [...otherLocations, ...campaignLocations];
              });
            });
          });

          // Return a function to unsubscribe from all listeners
          unsubscribeLocations = () => {
            locationUnsubscribers.forEach((unsubscribe) => unsubscribe());
            unsubscribeCampaigns();
          };
        }
      );
    }

    // Cleanup function
    return () => {
      if (unsubscribeLocations) {
        unsubscribeLocations();
      }
    };
  }, [user, dataBase, campaignId, providedLocations]);

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
                  background="#E91E63"
                  borderColor="#E91E63"
                  glyphColor="white"
                  scale={hoveredLocationId === location.id ? 1.2 : 1}
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
