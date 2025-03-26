import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import Carousel from "react-multi-carousel";

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
  const [locationImageFile, setLocationImageFile] = useState<File | null>(null);
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(
    null
  );
  const [imageModalOpen, setImageModalOpen] = useState<boolean>(false);
  const [activeImageUrls, setActiveImageUrls] = useState<string[]>([]);
  const navigate = useNavigate();

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

  /*const handleAddLocationClick = () => {
    setIsModalOpen(true);
  };*/

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!dataBase) return;

    const locationData: Location = {
      name: locationName,
      description: locationDescription,
      latitude: locationLatitude,
      longitude: locationLongitude,
      createdAt: new Date(),
    };

    let imageUrl = "";
    if (locationImageFile) {
      try {
        const storageRef = ref(
          storage,
          `campaigns/${campaignId}/locations/${locationImageFile.name}`
        );
        await uploadBytes(storageRef, locationImageFile);
        imageUrl = await getDownloadURL(storageRef);
        console.log("File uploaded successfully:", imageUrl);
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Failed to upload image. Try again.");
        return;
      }
    }

    try {
      const locationRef = collection(
        dataBase,
        `campaigns/${campaignId}/locations`
      );
      await addDoc(locationRef, {
        ...locationData,
        imageUrl,
        createdAt: new Date(),
      });
      toast.success("Location added successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      setIsModalOpen(false);

      await fetchCampaignAndLocations();
    } catch (error) {
      toast.error("Failed to add Location. Try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      console.error("Error adding location:", error);
    }
  };

  if (loading) return <Loader />;
  if (!campaign) return <p>Campaign not found</p>;

  return (
    <div className="flex flex-col w-full h-auto">
      <ReactModal
        isOpen={imageModalOpen}
        onRequestClose={() => setImageModalOpen(false)}
        overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center"
        className="bg-white rounded-lg max-w-2xl w-full p-6 relative shadow-lg ml-64"
        shouldCloseOnOverlayClick={true}
      >
        <h2 className="text-xl font-semibold mb-4 text-center">
          Location Images
        </h2>
        {activeImageUrls.length > 0 ? (
          <Carousel
            additionalTransfrom={0}
            arrows
            autoPlay={false}
            autoPlaySpeed={3000}
            centerMode={false}
            className=""
            containerClass="carousel-container"
            dotListClass=""
            draggable
            focusOnSelect={false}
            infinite
            itemClass="px-2"
            keyBoardControl
            minimumTouchDrag={80}
            renderButtonGroupOutside={false}
            renderDotsOutside={false}
            responsive={{
              desktop: {
                breakpoint: { max: 3000, min: 1024 },
                items: 1,
              },
              tablet: {
                breakpoint: { max: 1024, min: 464 },
                items: 1,
              },
              mobile: {
                breakpoint: { max: 464, min: 0 },
                items: 1,
              },
            }}
            showDots
            sliderClass=""
            slidesToSlide={1}
            swipeable
          >
            {activeImageUrls.map((url, idx) => (
              <img
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={idx}
                src={url}
                alt={`Location ${idx + 1}`}
                className="w-full h-96 object-contain rounded-md"
                loading="lazy"
              />
            ))}
          </Carousel>
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

      <ReactModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
        className="w-full max-w-md p-0 bg-white rounded-lg shadow-lg"
        shouldCloseOnOverlayClick={true}
      >
        <div className="p-6 bg-white rounded-lg w-full">
          <h2 className="text-xl font-bold mb-4">Add new location</h2>
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
                required
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
                htmlFor="locationImage"
                className="block text-sm font-medium mb-1"
              >
                Image
              </label>
              <input
                type="file"
                id="locationImage"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setLocationImageFile(e.target.files[0]);
                  }
                }}
              />
            </div>
            <button
              type="submit"
              className="mt-4 px-4 py-2 font-bold text-white bg-ooh-yeah-pink rounded-md focus:outline-none focus:ring focus:ring-opacity-50"
            >
              Add location
            </button>
          </form>
        </div>
      </ReactModal>
      <ToastContainer />
      <button
        type="button"
        className="font-bold text-left pl-4 w-min whitespace-nowrap"
        onClick={() => navigate("/dashboard/campaigns")}
      >
        {"< BACK"}
      </button>
      {/*<div className="flex justify-between mt-4">
        <h1 className="text-left text-2xl font-bold pl-4">Campaign</h1>
        <button
          className="px-4 py-2 text-white font-bold rounded-md bg-ooh-yeah-pink"
          type="button"
          onClick={handleAddLocationClick}
        >
          New Location
        </button>
      </div>*/}
      <div className="p-6 w-full mx-auto bg-white shadow-md rounded-lg mt-4 text-left">
        <p>
          <strong>ID:</strong> {campaign.id}
        </p>
        <p>
          <strong>Name:</strong> {campaign.name}
        </p>
        <p>
          <strong>Description:</strong> {campaign.description}
        </p>
        <p>
          <strong>Owner:</strong> {campaign.userId}
        </p>
      </div>
      <div className="h-96 my-6 w-full">
        <InteractiveMap
          campaignId={campaign.id}
          hoveredLocationId={hoveredLocationId}
          setActiveImageUrls={setActiveImageUrls}
          setImageModalOpen={setImageModalOpen}
        />
      </div>
      <div className="p-6 w-full mx-auto bg-white shadow-md rounded-lg mt-4">
        <h2 className="text-xl font-bold mb-4">Locations</h2>
        {locations.length > 0 ? (
          <ul className="space-y-2">
            {locations.map((location) => (
              <li
                key={location.id}
                className="border p-4 rounded-md"
                onMouseEnter={() => setHoveredLocationId(location.name)}
                onMouseLeave={() => setHoveredLocationId(null)}
              >
                <p>
                  <strong>Name:</strong> {location.name}
                </p>
                <p>
                  <strong>Latitude:</strong> {location.latitude}
                </p>
                <p>
                  <strong>Longitude:</strong> {location.longitude}
                </p>
                <p>
                  <strong>Description:</strong> {location.description}
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
  );
};

export default CampaignDetail;
