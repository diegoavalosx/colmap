import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  type Timestamp,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import ReactModal from "react-modal";
import { useAuth } from "./useAuth";
import Loader from "./Loader";

import { toast, ToastContainer } from "react-toastify";
import { ref, deleteObject } from "firebase/storage";
import InteractiveMap from "./InteractiveMap";
import Carousel from "./Carousel";
import DrivePhotoImporter, {
  type DrivePhotoDraft,
} from "./DrivePhotoImporter";
import DevicePhotoImporter, {
  type DevicePhotoDraft,
} from "./DevicePhotoImporter";
import { optimizePhotoForWeb } from "../utils/googleDrive";
import { hasValidPhotoCoordinates } from "../utils/locationGrouping";
import { saveGroupedPhotoLocations } from "../utils/locationUploads";

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: Date | Timestamp;
  userId: string;
  isPublic?: boolean;
}

interface Location {
  id?: string;
  description?: string;
  latitude: string;
  longitude: string;
  createdAt: Date | Timestamp;
  imageUrl?: string;
  imageUrls?: string[];
  driveFileIds?: string[];
}

type LocationInputMode = "device" | "drive";
type MobileCampaignView = "map" | "list";

const CampaignDetail = () => {
  const { dataBase, storage } = useAuth();
  const { campaignId } = useParams<{ campaignId: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [devicePhotos, setDevicePhotos] = useState<DevicePhotoDraft[]>([]);
  const [locationInputMode, setLocationInputMode] =
    useState<LocationInputMode>("device");
  const [mobileView, setMobileView] = useState<MobileCampaignView>("map");
  const [drivePhotos, setDrivePhotos] = useState<DrivePhotoDraft[]>([]);
  const drivePhotosRef = useRef<DrivePhotoDraft[]>([]);
  const devicePhotosRef = useRef<DevicePhotoDraft[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUpdatingShare, setIsUpdatingShare] = useState(false);
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(
    null
  );
  const [imageModalOpen, setImageModalOpen] = useState<boolean>(false);
  const [activeImageUrls, setActiveImageUrls] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(
    null
  );
  //const navigate = useNavigate();

  useEffect(() => {
    drivePhotosRef.current = drivePhotos;
  }, [drivePhotos]);

  useEffect(() => {
    devicePhotosRef.current = devicePhotos;
  }, [devicePhotos]);

  useEffect(
    () => () => {
      drivePhotosRef.current.forEach((photo) =>
        URL.revokeObjectURL(photo.previewUrl)
      );
      devicePhotosRef.current.forEach((photo) =>
        URL.revokeObjectURL(photo.previewUrl)
      );
    },
    []
  );

  const fetchCampaignAndLocations = useCallback(async () => {
    try {
      if (!dataBase || !campaignId) return;

      const campaignRef = doc(dataBase, "campaigns", campaignId);
      const campaignSnap = await getDoc(campaignRef);
      if (campaignSnap.exists()) {
        setCampaign({
          id: campaignSnap.id,
          ...campaignSnap.data(),
        } as Campaign);
      } else {
        console.error("Campaign not found");
        setCampaign(null);
        setLoading(false);
        return;
      }

      const locationsRef = collection(
        dataBase,
        `campaigns/${campaignId}/locations`
      );
      const locationsSnapshot = await getDocs(locationsRef);
      const locationsData: Location[] = locationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Location[];
      setLocations(locationsData);
    } catch (error) {
      console.error("Error fetching campaign or locations:", error);
    } finally {
      setLoading(false);
    }
  }, [dataBase, campaignId]);

  useEffect(() => {
    fetchCampaignAndLocations();
  }, [fetchCampaignAndLocations]);

  const handleAddLocationClick = () => {
    setIsModalOpen(true);
  };

  const getPublicCampaignUrl = () =>
    `${window.location.origin}/public/campaign/${campaignId}`;

  const copyPublicCampaignUrl = async () => {
    try {
      await navigator.clipboard.writeText(getPublicCampaignUrl());
      toast.success("Public campaign link copied.");
    } catch (error) {
      console.error("Unable to copy public campaign link:", error);
      toast.error("Unable to copy the link. Try again.");
    }
  };

  const enablePublicCampaign = async () => {
    if (!dataBase || !campaignId || campaign?.status !== "active") return;

    setIsUpdatingShare(true);
    try {
      await updateDoc(doc(dataBase, "campaigns", campaignId), {
        isPublic: true,
      });
      setCampaign((current) =>
        current ? { ...current, isPublic: true } : current
      );
      toast.success("Public campaign link enabled.");
    } catch (error) {
      console.error("Unable to enable public campaign:", error);
      toast.error("Unable to enable the public link. Try again.");
    } finally {
      setIsUpdatingShare(false);
    }
  };

  const disablePublicCampaign = async () => {
    if (!dataBase || !campaignId) return;

    setIsUpdatingShare(true);
    try {
      await updateDoc(doc(dataBase, "campaigns", campaignId), {
        isPublic: false,
      });
      setCampaign((current) =>
        current ? { ...current, isPublic: false } : current
      );
      toast.success("Public campaign link disabled.");
    } catch (error) {
      console.error("Unable to disable public campaign:", error);
      toast.error("Unable to disable the public link. Try again.");
    } finally {
      setIsUpdatingShare(false);
    }
  };

  const resetLocationForm = () => {
    drivePhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    devicePhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setDevicePhotos([]);
    setDrivePhotos([]);
    setLocationInputMode("device");
    setUploadStatus("");
  };

  const closeLocationModal = () => {
    resetLocationForm();
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!dataBase || !storage || !campaignId) return;

    setIsLoading(true);
    setUploadStatus("");
    try {
      if (locationInputMode === "drive") {
        if (drivePhotos.length === 0) {
          toast.error("Choose at least one photo from Google Drive.");
          return;
        }

        if (!drivePhotos.every(hasValidPhotoCoordinates)) {
          toast.error("Add a valid location for every Drive photo.");
          return;
        }

        const locationRef = collection(
          dataBase,
          `campaigns/${campaignId}/locations`
        );
        const existingLocations = await getDocs(locationRef);
        const existingDriveFileIds = new Set(
          existingLocations.docs.flatMap((locationDoc) => {
            const ids = locationDoc.data().driveFileIds;
            return Array.isArray(ids)
              ? ids.filter((id): id is string => typeof id === "string")
              : [];
          })
        );
        const photosToImport = drivePhotos.filter(
          (photo) => !existingDriveFileIds.has(photo.driveFileId)
        );

        if (photosToImport.length === 0) {
          toast.info("Those Drive photos are already in this campaign.");
          return;
        }

        const result = await saveGroupedPhotoLocations({
          dataBase,
          storage,
          campaignId,
          photos: photosToImport.map((photo) => ({
            ...photo,
            id: photo.driveFileId,
          })),
          source: "google-drive",
          preparePhoto: async (photo) => ({
            blob: photo.blob,
            name: photo.name,
            mimeType: photo.mimeType,
          }),
          onProgress: setUploadStatus,
        });

        const skippedCount = drivePhotos.length - photosToImport.length;
        toast.success(
          `${photosToImport.length} Drive photo${
            photosToImport.length === 1 ? "" : "s"
          } added as ${result.locationCount} map pin${
            result.locationCount === 1 ? "" : "s"
          }${skippedCount ? `; ${skippedCount} duplicate skipped` : ""}.`
        );
        closeLocationModal();
        await fetchCampaignAndLocations();
        return;
      }

      if (devicePhotos.length === 0) {
        toast.error("Choose at least one device photo.");
        return;
      }
      if (!devicePhotos.every(hasValidPhotoCoordinates)) {
        toast.error("Add a valid location for every device photo.");
        return;
      }

      const result = await saveGroupedPhotoLocations({
        dataBase,
        storage,
        campaignId,
        photos: devicePhotos,
        source: "device",
        preparePhoto: async (photo) =>
          optimizePhotoForWeb(photo.file, photo.name, photo.file.type),
        onProgress: setUploadStatus,
      });
      toast.success(
        `${result.photoCount} photo${result.photoCount === 1 ? "" : "s"} added as ${result.locationCount} location${result.locationCount === 1 ? "" : "s"}.`
      );

      closeLocationModal();
      await fetchCampaignAndLocations();
    } catch (error) {
      toast.error("Failed to add location. Try again.");
      console.error("Upload error:", error);
    } finally {
      setIsLoading(false);
      setUploadStatus("");
    }
  };

  const handleDeleteLocation = async (location: Location) => {
    if (!dataBase || !storage || !campaignId || !location.id) return;

    try {
      // Delete images from storage if they exist
      if (location.imageUrls && location.imageUrls.length > 0) {
        const deleteImagePromises = location.imageUrls.map(async (imageUrl) => {
          try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          } catch (error) {
            console.error("Error deleting image:", error);
          }
        });
        await Promise.all(deleteImagePromises);
      }

      // Delete the location document
      await deleteDoc(
        doc(dataBase, `campaigns/${campaignId}/locations/${location.id}`)
      );
      toast.success("Location and associated images successfully deleted!");
      await fetchCampaignAndLocations();
    } catch (error) {
      toast.error("Failed to delete location. Try again.");
      console.error("Error deleting location:", error);
    }
    setDeleteModalOpen(false);
    setLocationToDelete(null);
  };

  if (loading) return <Loader />;
  if (!campaign) return <p>Campaign not found</p>;

  return (
    <div className="mt-8 flex h-full max-h-full w-full flex-col lg:mt-0">
      <ReactModal
        isOpen={imageModalOpen}
        onRequestClose={() => setImageModalOpen(false)}
        overlayClassName="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-95 md:bg-opacity-60 md:p-4"
        className="relative w-full bg-transparent p-0 outline-none md:ml-64 md:max-w-2xl md:rounded-lg md:bg-white md:p-6 md:shadow-lg"
        shouldCloseOnOverlayClick={true}
      >
        <h2 className="mb-4 hidden text-center text-xl font-semibold md:block">
          Location Images
        </h2>
        {activeImageUrls.length > 0 ? (
          <Carousel images={activeImageUrls} />
        ) : (
          <p className="text-center">No images available for this location.</p>
        )}
        <button
          type="button"
          className="absolute right-4 top-4 hidden text-xl text-gray-600 hover:text-gray-900 md:block"
          onClick={() => setImageModalOpen(false)}
        >
          &times;
        </button>
      </ReactModal>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold">{campaign.name}</h2>
          <p className="text-sm text-gray-600">
            {locations.length}{" "}
            {locations.length === 1 ? "location" : "locations"}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {campaign.isPublic ? (
            <>
              <button
                className="rounded-md bg-gray-800 px-4 py-2 font-bold text-white transition-colors hover:bg-black"
                type="button"
                onClick={copyPublicCampaignUrl}
              >
                Copy Public Link
              </button>
              <button
                className="rounded-md bg-gray-200 px-4 py-2 font-bold text-gray-800 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                disabled={isUpdatingShare}
                onClick={disablePublicCampaign}
              >
                Disable Link
              </button>
            </>
          ) : (
            <button
              className="rounded-md bg-gray-800 px-4 py-2 font-bold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={isUpdatingShare || campaign.status !== "active"}
              title={
                campaign.status !== "active"
                  ? "Activate the campaign before sharing it"
                  : "Create a read-only public link"
              }
              onClick={enablePublicCampaign}
            >
              Enable Public Link
            </button>
          )}
          <button
            className="rounded-md bg-ooh-yeah-pink px-4 py-2 font-bold text-white transition-colors hover:bg-ooh-yeah-pink-700"
            type="button"
            onClick={handleAddLocationClick}
          >
            Add Location
          </button>
        </div>
      </div>
      <ReactModal
        isOpen={isModalOpen}
        onRequestClose={closeLocationModal}
        overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-white rounded-lg shadow-lg"
        shouldCloseOnOverlayClick={true}
      >
        <div className="flex min-h-[22rem] w-full flex-col rounded-lg bg-white p-6">
          <h2 className="text-xl font-bold mb-4">Add location</h2>
          <form
            onSubmit={handleFormSubmit}
            className="flex flex-1 flex-col gap-4"
          >
            <div className="grid grid-cols-2 rounded-md bg-gray-100 p-1">
              <button
                type="button"
                className={`rounded px-3 py-2 text-sm font-semibold ${
                  locationInputMode === "device"
                    ? "bg-white shadow-sm"
                    : "text-gray-600"
                }`}
                onClick={() => setLocationInputMode("device")}
              >
                Device upload
              </button>
              <button
                type="button"
                className={`rounded px-3 py-2 text-sm font-semibold ${
                  locationInputMode === "drive"
                    ? "bg-white shadow-sm"
                    : "text-gray-600"
                }`}
                onClick={() => setLocationInputMode("drive")}
              >
                Google Drive
              </button>
            </div>

            <div className="flex-1">
              {locationInputMode === "device" ? (
                <DevicePhotoImporter
                  photos={devicePhotos}
                  onChange={setDevicePhotos}
                  disabled={isLoading}
                />
              ) : (
                <DrivePhotoImporter
                  photos={drivePhotos}
                  onChange={setDrivePhotos}
                  disabled={isLoading}
                />
              )}
            </div>
            {uploadStatus && (
              <p className="text-center text-sm text-gray-600" aria-live="polite">
                {uploadStatus}
              </p>
            )}
            <button
              type="submit"
              className="mt-4 rounded-md bg-ooh-yeah-pink px-4 py-2 font-bold text-white hover:bg-ooh-yeah-pink-700 focus:outline-none focus:ring focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-ooh-yeah-pink"
              disabled={
                isLoading ||
                (locationInputMode === "drive"
                  ? drivePhotos.length === 0 ||
                    !drivePhotos.every(hasValidPhotoCoordinates)
                  : devicePhotos.length === 0 ||
                    !devicePhotos.every(hasValidPhotoCoordinates))
              }
            >
              {isLoading
                ? "Uploading..."
                : locationInputMode === "drive"
                  ? "Import Photos"
                  : "Add Location"}
            </button>
          </form>
        </div>
      </ReactModal>
      <ReactModal
        isOpen={deleteModalOpen}
        onRequestClose={() => {
          setDeleteModalOpen(false);
          setLocationToDelete(null);
        }}
        overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4"
        className="relative bg-white rounded-lg shadow-lg p-4 md:p-6 w-11/12 max-w-md mx-auto"
        shouldCloseOnOverlayClick={true}
      >
        <h1 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-center">
          Are you sure you want to delete this location?
        </h1>
        <p className="mb-5 md:mb-6 text-center">This action cannot be undone</p>
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            className="bg-ooh-yeah-pink text-white px-3 py-2 md:px-4 rounded-md hover:bg-ooh-yeah-pink-700 transition"
            onClick={() =>
              locationToDelete && handleDeleteLocation(locationToDelete)
            }
          >
            Yes, delete
          </button>
          <button
            type="button"
            className="bg-gray-200 text-black px-3 py-2 md:px-4 rounded-md hover:bg-gray-300 transition"
            onClick={() => {
              setDeleteModalOpen(false);
              setLocationToDelete(null);
            }}
          >
            No, cancel
          </button>
        </div>
      </ReactModal>
      <ToastContainer />
      <div
        className="mb-4 grid grid-cols-2 rounded-md bg-gray-200 p-1 md:hidden"
        role="tablist"
        aria-label="Campaign view"
      >
        <button
          id="campaign-map-tab"
          type="button"
          role="tab"
          aria-selected={mobileView === "map"}
          aria-controls="campaign-map-panel"
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
          id="campaign-list-tab"
          type="button"
          role="tab"
          aria-selected={mobileView === "list"}
          aria-controls="campaign-list-panel"
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
      <div className="flex flex-col md:flex-row gap-4 h-full">
        <div
          id="campaign-map-panel"
          role="tabpanel"
          aria-labelledby="campaign-map-tab"
          className={`${
            mobileView === "map" ? "block" : "hidden"
          } h-[50vh] w-full flex-shrink-0 overflow-y-auto bg-white shadow-sm md:block md:h-full md:flex-1`}
        >
          <InteractiveMap
            campaignId={campaign.id}
            hoveredLocationId={hoveredLocationId}
            setActiveImageUrls={setActiveImageUrls}
            setImageModalOpen={setImageModalOpen}
          />
        </div>
        <div
          id="campaign-list-panel"
          role="tabpanel"
          aria-labelledby="campaign-list-tab"
          className={`${
            mobileView === "list" ? "block" : "hidden"
          } w-full overflow-y-auto bg-transparent md:block md:min-w-80 md:w-80`}
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
                    onMouseEnter={() =>
                      location.id && setHoveredLocationId(location.id)
                    }
                    onMouseLeave={() => setHoveredLocationId(null)}
                  >
                    <div className="flex gap-3">
                      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100 text-center text-xs text-gray-500">
                        {photoUrls[0] ? (
                          <img
                            src={photoUrls[0]}
                            alt="Location photo"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>No photo</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-600">
                          {photoUrls.length}{" "}
                          {photoUrls.length === 1 ? "photo" : "photos"}
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
                      </div>
                      <details className="group relative self-start text-sm">
                        <summary
                          className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full text-sm font-bold tracking-normal text-gray-500 hover:bg-gray-100 hover:text-gray-900 [&::-webkit-details-marker]:hidden"
                          aria-label="More options for this location"
                          title="More options"
                        >
                          •••
                        </summary>
                        <div className="absolute right-0 top-10 z-20 w-56 rounded-md bg-white p-3 text-xs text-gray-500 shadow-lg ring-1 ring-black/5">
                          <p className="mb-1 font-semibold text-gray-700">
                            Coordinates
                          </p>
                          <p className="break-words">
                            {location.latitude}, {location.longitude}
                          </p>
                          <button
                            type="button"
                            className="mt-2 font-medium text-red-600 hover:text-red-700 hover:underline"
                            onClick={() => {
                              setLocationToDelete(location);
                              setDeleteModalOpen(true);
                            }}
                          >
                            Delete Location
                          </button>
                        </div>
                      </details>
                    </div>
                    <div className="mt-3">
                      <button
                        type="button"
                        className="w-full rounded-md bg-ooh-yeah-pink px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-ooh-yeah-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={photoUrls.length === 0}
                        onClick={() => {
                          setActiveImageUrls(photoUrls);
                          setImageModalOpen(true);
                        }}
                      >
                        View Photos
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-right">No locations linked to this campaign.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
