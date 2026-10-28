import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, getDocs, Timestamp } from "firebase/firestore";
import { useParams } from "react-router-dom";
import ReactModal from "react-modal";
import logo from "../assets/oohyeah-logo-black.png";
import Carousel from "./Carousel";
import InteractiveMap, { type MapLocation } from "./InteractiveMap";
import Loader from "./Loader";
import { useAuth } from "./useAuth";

interface PublicCampaignData {
  id: string;
  name: string;
  description?: string;
  status: string;
  isPublic?: boolean;
}

interface PublicLocation {
  id: string;
  latitude: string;
  longitude: string;
  createdAt: Date | Timestamp;
  imageUrl?: string;
  imageUrls?: string[];
}

type MobileCampaignView = "map" | "list";

const PublicCampaign = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { dataBase } = useAuth();
  const [campaign, setCampaign] = useState<PublicCampaignData | null>(null);
  const [locations, setLocations] = useState<PublicLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [mobileView, setMobileView] = useState<MobileCampaignView>("map");
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(
    null
  );
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [activeImageUrls, setActiveImageUrls] = useState<string[]>([]);

  const fetchCampaign = useCallback(async () => {
    if (!dataBase || !campaignId) return;

    setLoading(true);
    setUnavailable(false);
    try {
      const campaignSnapshot = await getDoc(
        doc(dataBase, "campaigns", campaignId)
      );

      if (!campaignSnapshot.exists()) {
        setUnavailable(true);
        return;
      }

      const campaignData = {
        id: campaignSnapshot.id,
        ...campaignSnapshot.data(),
      } as PublicCampaignData;

      if (campaignData.isPublic !== true || campaignData.status !== "active") {
        setUnavailable(true);
        return;
      }

      const locationsSnapshot = await getDocs(
        collection(dataBase, `campaigns/${campaignId}/locations`)
      );
      const publicLocations = locationsSnapshot.docs.map((locationDocument) => ({
        id: locationDocument.id,
        ...locationDocument.data(),
      })) as PublicLocation[];

      setCampaign(campaignData);
      setLocations(publicLocations);
    } catch (error) {
      console.error("Unable to load public campaign:", error);
      setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }, [campaignId, dataBase]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const mapLocations = useMemo<MapLocation[]>(
    () =>
      locations.map((location) => ({
        id: location.id,
        latitude: Number.parseFloat(location.latitude),
        longitude: Number.parseFloat(location.longitude),
        imageUrls:
          location.imageUrls?.length && location.imageUrls.length > 0
            ? location.imageUrls
            : location.imageUrl
              ? [location.imageUrl]
              : [],
      })),
    [locations]
  );

  if (loading) return <Loader />;

  if (unavailable || !campaign) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6 text-gray-900">
        <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">Campaign unavailable</h1>
          <p className="mt-3 text-gray-600">
            This public link is invalid, inactive, or no longer shared.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 sm:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col sm:min-h-[calc(100vh-3rem)]">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-4 rounded-xl bg-white p-4 shadow-sm sm:p-5">
          <div className="min-w-0">
            <a href="/" aria-label="Oohyeah home" className="mb-4 block w-36">
              <img src={logo} alt="Oohyeah" className="h-auto w-full" />
            </a>
            <h1 className="text-2xl font-bold sm:text-3xl">{campaign.name}</h1>
            {campaign.description && (
              <p className="mt-2 max-w-3xl text-sm text-gray-600 sm:text-base">
                {campaign.description}
              </p>
            )}
          </div>
          <p className="text-sm font-medium text-gray-600">
            {locations.length} {locations.length === 1 ? "location" : "locations"}
          </p>
        </header>

        <ReactModal
          isOpen={imageModalOpen}
          onRequestClose={() => setImageModalOpen(false)}
          overlayClassName="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-95 md:bg-opacity-60 md:p-4"
          className="relative w-full bg-transparent p-0 outline-none md:max-w-2xl md:rounded-lg md:bg-white md:p-6 md:shadow-lg"
          shouldCloseOnOverlayClick={true}
        >
          <h2 className="mb-4 hidden text-center text-xl font-semibold md:block">
            Location Photos
          </h2>
          {activeImageUrls.length > 0 && <Carousel images={activeImageUrls} />}
          <button
            type="button"
            className="absolute right-4 top-4 hidden text-xl text-gray-600 hover:text-gray-900 md:block"
            onClick={() => setImageModalOpen(false)}
            aria-label="Close photos"
          >
            &times;
          </button>
        </ReactModal>

        <div
          className="mb-4 grid grid-cols-2 rounded-md bg-gray-200 p-1 md:hidden"
          role="tablist"
          aria-label="Campaign view"
        >
          <button
            id="public-campaign-map-tab"
            type="button"
            role="tab"
            aria-selected={mobileView === "map"}
            aria-controls="public-campaign-map-panel"
            className={`min-h-11 rounded px-4 py-2 text-sm font-semibold transition-colors ${
              mobileView === "map"
                ? "bg-white text-black shadow-sm"
                : "text-gray-600"
            }`}
            onClick={() => setMobileView("map")}
          >
            Map
          </button>
          <button
            id="public-campaign-list-tab"
            type="button"
            role="tab"
            aria-selected={mobileView === "list"}
            aria-controls="public-campaign-list-panel"
            className={`min-h-11 rounded px-4 py-2 text-sm font-semibold transition-colors ${
              mobileView === "list"
                ? "bg-white text-black shadow-sm"
                : "text-gray-600"
            }`}
            onClick={() => setMobileView("list")}
          >
            List
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row">
          <section
            id="public-campaign-map-panel"
            role="tabpanel"
            aria-labelledby="public-campaign-map-tab"
            className={`${mobileView === "map" ? "block" : "hidden"} h-[55vh] w-full overflow-hidden rounded-xl bg-white shadow-sm md:block md:h-auto md:flex-1`}
          >
            <InteractiveMap
              campaignId={campaign.id}
              providedLocations={mapLocations}
              hoveredLocationId={hoveredLocationId}
              setActiveImageUrls={setActiveImageUrls}
              setImageModalOpen={setImageModalOpen}
            />
          </section>

          <section
            id="public-campaign-list-panel"
            role="tabpanel"
            aria-labelledby="public-campaign-list-tab"
            className={`${mobileView === "list" ? "block" : "hidden"} w-full overflow-y-auto md:block md:w-80 md:min-w-80`}
          >
            {locations.length > 0 ? (
              <ul className="space-y-3">
                {locations.map((location) => {
                  const photoUrls =
                    location.imageUrls?.length && location.imageUrls.length > 0
                      ? location.imageUrls
                      : location.imageUrl
                        ? [location.imageUrl]
                        : [];
                  const createdAt =
                    location.createdAt instanceof Date
                      ? location.createdAt
                      : location.createdAt.toDate();

                  return (
                    <li
                      key={location.id}
                      className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                      onMouseEnter={() => setHoveredLocationId(location.id)}
                      onMouseLeave={() => setHoveredLocationId(null)}
                    >
                      <div className="flex gap-3">
                        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100 text-center text-xs text-gray-500">
                          {photoUrls[0] ? (
                            <img
                              src={photoUrls[0]}
                              alt="Location"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>No photo</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-600">
                            {photoUrls.length} {photoUrls.length === 1 ? "photo" : "photos"}
                          </p>
                          <time
                            className="mt-1 block text-sm text-gray-500"
                            dateTime={createdAt.toISOString()}
                          >
                            {createdAt.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </time>
                          <p className="mt-1 break-words text-xs text-gray-500">
                            {location.latitude}, {location.longitude}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="mt-3 w-full rounded-md bg-ooh-yeah-pink px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-ooh-yeah-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={photoUrls.length === 0}
                        onClick={() => {
                          setActiveImageUrls(photoUrls);
                          setImageModalOpen(true);
                        }}
                      >
                        View Photos
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="rounded-xl bg-white p-4 text-right text-gray-600 shadow-sm">
                No locations linked to this campaign.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default PublicCampaign;
