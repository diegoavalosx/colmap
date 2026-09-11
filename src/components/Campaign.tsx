import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  type Timestamp,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import ReactModal from "react-modal";
import { useAuth } from "./useAuth";
import Loader from "./Loader";

import { toast, ToastContainer } from "react-toastify";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import InteractiveMap from "./InteractiveMap";
import Carousel from "./Carousel";
import DrivePhotoImporter, {
  type DrivePhotoDraft,
} from "./DrivePhotoImporter";
import { optimizePhotoForWeb } from "../utils/googleDrive";

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: Date | Timestamp;
  userId: string;
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

const hasValidCoordinates = (photo: DrivePhotoDraft) => {
  const latitude = Number.parseFloat(photo.latitude);
  const longitude = Number.parseFloat(photo.longitude);
  return (
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  );
};

const safeStorageName = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120);

const CampaignDetail = () => {
  const { dataBase, storage } = useAuth();
  const { campaignId } = useParams<{ campaignId: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [coordinates, setCoordinates] = useState<string>("");
  const [locationLatitude, setLocationLatitude] = useState<string>("");
  const [locationLongitude, setLocationLongitude] = useState<string>("");
  const [locationImages, setLocationImages] = useState<File[]>([]);
  const [locationInputMode, setLocationInputMode] =
    useState<LocationInputMode>("device");
  const [drivePhotos, setDrivePhotos] = useState<DrivePhotoDraft[]>([]);
  const drivePhotosRef = useRef<DrivePhotoDraft[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

  useEffect(
    () => () => {
      drivePhotosRef.current.forEach((photo) =>
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

  const resetLocationForm = () => {
    drivePhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setCoordinates("");
    setLocationLatitude("");
    setLocationLongitude("");
    setLocationImages([]);
    setDrivePhotos([]);
    setLocationInputMode("device");
  };

  const closeLocationModal = () => {
    resetLocationForm();
    setIsModalOpen(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const selected = Array.from(files).slice(0, 10);
      setLocationImages(selected);
    }
  };

  const handleCoordinatesParse = (value: string) => {
    // Remove any whitespace and parentheses
    const cleanValue = value.replace(/[()\s]/g, "");

    // Split by comma and check if we have two numbers
    const parts = cleanValue.split(",");
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);

      if (!isNaN(lat) && !isNaN(lng)) {
        setLocationLatitude(lat.toString());
        setLocationLongitude(lng.toString());
        return;
      }
    }

    // If we couldn't parse the coordinates, clear the fields
    setLocationLatitude("");
    setLocationLongitude("");
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!dataBase || !storage || !campaignId) return;

    setIsLoading(true);
    try {
      if (locationInputMode === "drive") {
        if (drivePhotos.length === 0) {
          toast.error("Choose at least one photo from Google Drive.");
          return;
        }

        if (!drivePhotos.every(hasValidCoordinates)) {
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

        for (const photo of photosToImport) {
          const locationDocRef = doc(locationRef);
          const storageRef = ref(
            storage,
            `campaigns/${campaignId}/locations/${locationDocRef.id}/${photo.driveFileId}_${safeStorageName(photo.name)}`
          );
          await uploadBytes(storageRef, photo.blob, {
            contentType: photo.mimeType,
          });
          const imageUrl = await getDownloadURL(storageRef);

          await setDoc(locationDocRef, {
            latitude: Number.parseFloat(photo.latitude).toFixed(6),
            longitude: Number.parseFloat(photo.longitude).toFixed(6),
            imageUrls: [imageUrl],
            driveFileIds: [photo.driveFileId],
            source: "google-drive",
            createdAt: new Date(),
          });
        }

        const skippedCount = drivePhotos.length - photosToImport.length;
        toast.success(
          `${photosToImport.length} Drive photo${
            photosToImport.length === 1 ? "" : "s"
          } added as ${photosToImport.length} map pin${
            photosToImport.length === 1 ? "" : "s"
          }${skippedCount ? `; ${skippedCount} duplicate skipped` : ""}.`
        );
        closeLocationModal();
        await fetchCampaignAndLocations();
        return;
      }

      const imageUrls: string[] = [];

      for (const image of locationImages) {
        const optimizedImage = await optimizePhotoForWeb(
          image,
          image.name,
          image.type
        );
        const storageRef = ref(
          storage,
          `campaigns/${campaignId}/locations/${Date.now()}_${safeStorageName(optimizedImage.name)}`
        );
        await uploadBytes(storageRef, optimizedImage.blob, {
          contentType: optimizedImage.mimeType,
        });
        const downloadUrl = await getDownloadURL(storageRef);
        imageUrls.push(downloadUrl);
      }

      const locationData: Location = {
        latitude: locationLatitude,
        longitude: locationLongitude,
        imageUrls,
        createdAt: new Date(),
      };

      const locationRef = collection(
        dataBase,
        `campaigns/${campaignId}/locations`
      );
      await addDoc(locationRef, locationData);

      toast.success("Location successfully added!");
      closeLocationModal();
      await fetchCampaignAndLocations();
    } catch (error) {
      toast.error("Failed to add location. Try again.");
      console.error("Upload error:", error);
    } finally {
      setIsLoading(false);
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
    <div className="flex flex-col w-full max-h-full h-full mt-8">
      <ReactModal
        isOpen={imageModalOpen}
        onRequestClose={() => setImageModalOpen(false)}
        overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center"
        className="bg-white rounded-lg max-w-2xl w-full p-6 relative shadow-lg sm:ml-64 ml-0"
        shouldCloseOnOverlayClick={true}
      >
        <h2 className="text-xl font-semibold mb-4 text-center">
          Location Images
        </h2>
        {activeImageUrls.length > 0 ? (
          <Carousel images={activeImageUrls} />
        ) : (
          <p className="text-center">No images available for this location.</p>
        )}
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-xl"
          onClick={() => setImageModalOpen(false)}
        >
          &times;
        </button>
      </ReactModal>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{campaign.name}</h2>
        <button
          className="px-4 py-2 text-white font-bold rounded-md bg-ooh-yeah-pink hover:bg-ooh-yeah-pink-700 transition-colors"
          type="button"
          onClick={handleAddLocationClick}
        >
          Add Location
        </button>
      </div>
      <ReactModal
        isOpen={isModalOpen}
        onRequestClose={closeLocationModal}
        overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-white rounded-lg shadow-lg"
        shouldCloseOnOverlayClick={true}
      >
        <div className="p-6 bg-white rounded-lg w-full">
          <h2 className="text-xl font-bold mb-4">Add location</h2>
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
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

            {locationInputMode === "device" ? (
              <>
                <div>
                  <label
                    htmlFor="coordinates"
                    className="block text-sm font-medium mb-1"
                  >
                    Coordinates
                  </label>
                  <input
                    type="text"
                    id="coordinates"
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-opacity-50"
                    value={coordinates}
                    onChange={(e) => {
                      setCoordinates(e.target.value);
                      handleCoordinatesParse(e.target.value);
                    }}
                    placeholder="(latitude, longitude) or latitude, longitude"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="images"
                    className="block text-sm font-medium mb-1"
                  >
                    Upload Images (max 10)
                  </label>
                  <input
                    type="file"
                    id="images"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                  {locationImages.length > 0 && (
                    <ul className="text-sm mt-2 list-disc list-inside">
                      {locationImages.map((img) => (
                        <li key={`${img.name}-${img.lastModified}`}>{img.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : (
              <DrivePhotoImporter
                photos={drivePhotos}
                onChange={setDrivePhotos}
                disabled={isLoading}
              />
            )}
            <button
              type="submit"
              className={`mt-4 px-4 py-2 font-bold text-white bg-ooh-yeah-pink rounded-md focus:outline-none focus:ring focus:ring-opacity-50 ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-ooh-yeah-pink-700"
              }`}
              disabled={
                isLoading ||
                (locationInputMode === "drive" && drivePhotos.length === 0)
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
      <div className="flex flex-col md:flex-row gap-4 h-full">
        <div className="h-[50vh] md:h-full md:flex-1 w-full bg-white shadow-sm overflow-y-auto flex-shrink-0">
          <InteractiveMap
            campaignId={campaign.id}
            hoveredLocationId={hoveredLocationId}
            setActiveImageUrls={setActiveImageUrls}
            setImageModalOpen={setImageModalOpen}
          />
        </div>
        <div className="p-4 md:min-w-80 md:w-80 w-full bg-white shadow-sm overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">{campaign.name}</h3>
          {locations.length > 0 ? (
            <ul className="space-y-2">
              {locations.map((location) => (
                <li
                  key={location.id}
                  className="border p-4 rounded-md"
                  onMouseEnter={() =>
                    location.id && setHoveredLocationId(location.id)
                  }
                  onMouseLeave={() => setHoveredLocationId(null)}
                >
                  <p>
                    <strong>Latitude:</strong> {location.latitude}
                  </p>
                  <p>
                    <strong>Longitude:</strong> {location.longitude}
                  </p>
                  <p>
                    <strong>Created At:</strong>{" "}
                    {location.createdAt instanceof Date
                      ? location.createdAt.toLocaleString()
                      : location.createdAt.toDate().toLocaleString()}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <button
                      type="button"
                      className="text-ooh-yeah-pink hover:underline font-medium"
                      onClick={() => {
                        setActiveImageUrls(location.imageUrls ?? []);
                        setImageModalOpen(true);
                      }}
                    >
                      View Images
                    </button>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 font-medium"
                      onClick={() => {
                        setLocationToDelete(location);
                        setDeleteModalOpen(true);
                      }}
                    >
                      Delete Location
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No locations linked to this campaign.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
