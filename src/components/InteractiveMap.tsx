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
  const [open, setOpen] = useState(false);
  const position = { lat: 19.2488939, lng: -103.7521401 };
  const daisushiPosition = { lat: 19.2654075, lng: -103.7391145 };
  const daisushiPinoPosition = { lat: 19.2529951, lng: -103.7331614 };

  return (
    <APIProvider apiKey={googleMapsApiKey}>
      <div className="h-full bg-slate-700 p-12">
        <Map
          zoom={14}
          center={position}
          mapId="80b9549366c22aeb"
          gestureHandling={"greedy"}
          disableDefaultUI={true}
        >
          <AdvancedMarker
            position={daisushiPosition}
            onClick={() => setOpen(true)}
          >
            <Pin background="white" />
          </AdvancedMarker>
          <AdvancedMarker
            position={daisushiPinoPosition}
            onClick={() => setOpen(true)}
          >
            <Pin background="white" />
          </AdvancedMarker>
        </Map>
        {open ? (
          <InfoWindow
            position={daisushiPosition}
            onCloseClick={() => setOpen(false)}
          >
            <p>Aquí está Daisushii</p>
          </InfoWindow>
        ) : null}
      </div>
    </APIProvider>
  );
};

export default InteractiveMap;
