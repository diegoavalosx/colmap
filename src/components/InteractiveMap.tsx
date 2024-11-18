import Loader from "../components/Loader";
import {
  APIProvider,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import {
  collection,
  getDocs,
  query,
  where,
  type Firestore,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

interface Location {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
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
        });
      }
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
  }
  return locations;
};

const InteractiveMap = () => {
  const [openInfoWindowId, setOpenInfoWindowId] = useState<string | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const position = { lat: 19.256616017981763, lng: -103.71668343037342 };
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
      }
    };

    getGoogleMapsApiKey();
    fetchLocations();
  }, [user, dataBase]);

  const markers = [
    {
      id: "daisushiVilla",
      position: { lat: 19.26557965830582, lng: -103.73563838204402 },
      label: "Daisushii Villa de Álvarez",
    },
    {
      id: "daisushiPino",
      position: { lat: 19.253197611245835, lng: -103.73058652759573 },
      label: "Daisushii Pinosuarez",
    },
    {
      id: "daisushiSendera",
      position: { lat: 19.276378120037304, lng: -103.71827244297553 },
      label: "Daisushii Sendera",
    },
    {
      id: "daisushiConsti",
      position: { lat: 19.26257150759906, lng: -103.71212367537348 },
      label: "Daisushii Constitución",
    },
    {
      id: "elpechugon",
      position: { lat: 19.2487024491823, lng: -103.75667438373682 },
      label: "El pechugón",
    },
  ];

  console.log(markers);

  return (
    <>
      {googleMapsApiKey ? (
        <APIProvider apiKey={googleMapsApiKey}>
          <div className="h-full p-12">
            <Map
              zoom={14}
              center={position}
              mapId="80b9549366c22aeb"
              gestureHandling={"greedy"}
              disableDefaultUI={true}
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
                      {location.description}
                    </InfoWindow>
                  )}
                </AdvancedMarker>
              ))}
            </Map>
          </div>
        </APIProvider>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default InteractiveMap;
