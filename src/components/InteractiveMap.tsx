import {
  APIProvider,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { useState } from "react";

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const InteractiveMap = () => {
  const [openInfoWindowId, setOpenInfoWindowId] = useState<string | null>(null);
  const position = { lat: 19.256616017981763, lng: -103.71668343037342 };

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

  return (
    <APIProvider apiKey={googleMapsApiKey}>
      <div className="h-full p-12">
        <Map
          zoom={14}
          center={position}
          mapId="80b9549366c22aeb"
          gestureHandling={"greedy"}
          disableDefaultUI={true}
        >
          {markers.map((marker) => (
            <AdvancedMarker
              key={marker.id}
              position={marker.position}
              onClick={() => setOpenInfoWindowId(marker.id)}
            >
              <Pin background="white" />
              {openInfoWindowId === marker.id && (
                <InfoWindow
                  position={marker.position}
                  onCloseClick={() => setOpenInfoWindowId(null)}
                >
                  <p>Aquí está {marker.label}</p>
                </InfoWindow>
              )}
            </AdvancedMarker>
          ))}
        </Map>
      </div>
    </APIProvider>
  );
};

export default InteractiveMap;
