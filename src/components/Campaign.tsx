import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  type Timestamp,
} from "firebase/firestore";
import ReactModal from "react-modal";
import { useAuth } from "./useAuth";
import Loader from "./Loader";
import { toast, ToastContainer } from "react-toastify";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import InteractiveMap from "./InteractiveMap";
import Carousel from "./Carousel";

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
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  createdAt: Date | Timestamp;
  imageUrl?: string;
  imageUrls?: string[];
}

const CampaignDetail = () => {
  const { dataBase, storage } = useAuth();
  const { campaignId } = useParams<{ campaignId: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [locationName, setLocationName] = useState<string>("");
  const [locationDescription, setLocationDescription] = useState<string>("");
  const [locationLatitude, setLocationLatitude] = useState<string>("");
  const [locationLongitude, setLocationLongitude] = useState<string>("");
  const [locationImages, setLocationImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(
    null
  );
  const [imageModalOpen, setImageModalOpen] = useState<boolean>(false);
  const [activeImageUrls, setActiveImageUrls] = useState<string[]>([]);
  //const navigate = useNavigate();

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const selected = Array.from(files).slice(0, 5);
      setLocationImages(selected);
    }
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!dataBase || !storage || !campaignId) return;

    setIsLoading(true);
    try {
      const imageUrls: string[] = [];

      for (const image of locationImages) {
        const storageRef = ref(
          storage,
          `campaigns/${campaignId}/locations/${Date.now()}_${image.name}`
        );
        await uploadBytes(storageRef, image);
        const downloadUrl = await getDownloadURL(storageRef);
        imageUrls.push(downloadUrl);
      }

      const locationData: Location = {
        name: locationName,
        description: locationDescription,
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
      setIsModalOpen(false);
      setLocationName("");
      setLocationDescription("");
      setLocationLatitude("");
      setLocationLongitude("");
      setLocationImages([]);
      await fetchCampaignAndLocations();
    } catch (error) {
      toast.error("Failed to add location. Try again.");
      console.error("Upload error:", error);
    } finally {
      setIsLoading(false);
    }
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
        onRequestClose={() => setIsModalOpen(false)}
        overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
        className="w-full max-w-md p-0 bg-white rounded-lg shadow-lg"
        shouldCloseOnOverlayClick={true}
      >
        <div className="p-6 bg-white rounded-lg w-full">
          <h2 className="text-xl font-bold mb-4">Add location</h2>
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-opacity-50"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-opacity-50"
                value={locationDescription}
                onChange={(e) => setLocationDescription(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="latitude"
                className="block text-sm font-medium mb-1"
              >
                Latitude
              </label>
              <input
                type="text"
                id="latitude"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-opacity-50"
                value={locationLatitude}
                onChange={(e) => setLocationLatitude(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="longitude"
                className="block text-sm font-medium mb-1"
              >
                Longitude
              </label>
              <input
                type="text"
                id="longitude"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-opacity-50"
                value={locationLongitude}
                onChange={(e) => setLocationLongitude(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="images"
                className="block text-sm font-medium mb-1"
              >
                Upload Images (max 5)
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
                  {locationImages.map((img, i) => (
                    <li key={i}>{img.name}</li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="submit"
              className={`mt-4 px-4 py-2 font-bold text-white bg-ooh-yeah-pink rounded-md focus:outline-none focus:ring focus:ring-opacity-50 ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-ooh-yeah-pink-700"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Uploading..." : "Add Location"}
            </button>
          </form>
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
                  onMouseEnter={() => setHoveredLocationId(location.name)}
                  onMouseLeave={() => setHoveredLocationId(null)}
                >
                  <p className="text-center font-bold">{location.name}</p>
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
                  <button
                    type="button"
                    className="mt-2 text-ooh-yeah-pink hover:underline font-medium"
                    onClick={() => {
                      setActiveImageUrls(location.imageUrls ?? []);
                      setImageModalOpen(true);
                    }}
                  >
                    View Images
                  </button>
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
