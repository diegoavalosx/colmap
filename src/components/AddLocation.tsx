import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, getDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "./useAuth";
import { toast, ToastContainer } from "react-toastify";
import { useParams } from "react-router-dom";

interface Campaign {
  id: string;
  name: string;
}

interface Location {
  name: string;
  description?: string;
  latitude: string;
  longitude: string;
  imageUrls: string[];
  createdAt: Date;
}

const AddLocation = () => {
  const { dataBase, storage } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [locationName, setLocationName] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { campaignId } = useParams<{ campaignId?: string }>();

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!dataBase) return;

      if (campaignId) {
        try {
          const docRef = doc(dataBase, "campaigns", campaignId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const campaignData = {
              id: docSnap.id,
              ...(docSnap.data() as { name: string }),
            };
            setSelectedCampaign(campaignData);
            setSearch(campaignData.name);
          } else {
            toast.error("Campaign not found.");
          }
        } catch (error) {
          toast.error("Failed to load campaign.");
          console.error(error);
        }
      } else {
        const snapshot = await getDocs(collection(dataBase, "campaigns"));
        const campaignsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as { name: string }),
        }));
        setCampaigns(campaignsData);
      }
    };

    fetchCampaigns();
  }, [campaignId, dataBase]);

  const handleUrlParse = (value: string) => {
    // Remove any whitespace and parentheses
    const cleanValue = value.replace(/[()\s]/g, "");

    // Split by comma and check if we have two numbers
    const parts = cleanValue.split(",");
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);

      if (!isNaN(lat) && !isNaN(lng)) {
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        return;
      }
    }

    // If we couldn't parse the coordinates, clear the fields
    setLatitude("");
    setLongitude("");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const selected = Array.from(files).slice(0, 5);
      setImages(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataBase || !storage || !selectedCampaign) return;

    setIsLoading(true);
    try {
      const imageUrls: string[] = [];

      for (const image of images) {
        const storageRef = ref(
          storage,
          `campaigns/${selectedCampaign.id}/locations/${Date.now()}_${
            image.name
          }`
        );
        await uploadBytes(storageRef, image);
        const downloadUrl = await getDownloadURL(storageRef);
        imageUrls.push(downloadUrl);
      }

      const locationData: Location = {
        name: locationName,
        latitude,
        longitude,
        imageUrls,
        createdAt: new Date(),
      };

      const locationRef = collection(
        dataBase,
        `campaigns/${selectedCampaign.id}/locations`
      );
      await addDoc(locationRef, locationData);

      toast.success("Location successfully added!");
      setLocationName("");
      setLatitude("");
      setLongitude("");
      setGoogleMapsUrl("");
      setSelectedCampaign(null);
      setImages([]);
    } catch (error) {
      toast.error("Failed to add location. Try again.");
      console.error("Upload error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCampaigns = campaigns
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 5);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4 text-center">Add New Location</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label htmlFor="search" className="block font-medium mb-1">
            Campaign
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search campaigns..."
            className="w-full p-2 border rounded"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            required
            autoComplete="off"
          />
          {dropdownOpen && (
            <div className="absolute w-full max-h-40 overflow-y-auto border rounded mt-1 bg-white shadow-lg z-50">
              {filteredCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${
                    selectedCampaign?.id === campaign.id
                      ? "bg-gray-200 font-semibold"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedCampaign(campaign);
                    setSearch(campaign.name);
                    setDropdownOpen(false);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      setSelectedCampaign(campaign);
                      setSearch(campaign.name);
                      setDropdownOpen(false);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  {campaign.name}
                </div>
              ))}
              {filteredCampaigns.length === 0 && (
                <div className="p-2 text-sm text-gray-500">
                  No campaigns found
                </div>
              )}
              {campaigns.filter((c) =>
                c.name.toLowerCase().includes(search.toLowerCase())
              ).length > 5 && (
                <div className="p-2 text-sm text-gray-500 border-t sticky bottom-0 bg-white">
                  Showing first 5 results. Type more to refine search.
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="name" className="block font-medium mb-1">
            Location Name
          </label>
          <input
            id="name"
            type="text"
            className="w-full p-2 border rounded"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="url" className="block font-medium mb-1">
            Coordinates
          </label>
          <input
            id="url"
            type="text"
            className="w-full p-2 border rounded"
            value={googleMapsUrl}
            onChange={(e) => {
              setGoogleMapsUrl(e.target.value);
              handleUrlParse(e.target.value);
            }}
            placeholder="(latitude, longitude) or latitude, longitude"
          />
        </div>
        <div>
          <label htmlFor="images" className="block font-medium mb-1">
            Upload Images (max 5)
          </label>
          <input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
          />
          {images.length > 0 && (
            <ul className="text-sm mt-2 list-disc list-inside">
              {images.map((img, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: it's okay in this case
                <li key={i}>{img.name}</li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          className={`w-full bg-ooh-yeah-pink text-white py-2 rounded font-bold transition-colors ${
            isLoading ||
            !selectedCampaign ||
            !locationName ||
            !latitude ||
            !longitude
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-ooh-yeah-pink-700"
          }`}
          disabled={
            isLoading ||
            !selectedCampaign ||
            !locationName ||
            !latitude ||
            !longitude
          }
        >
          {isLoading ? "UPLOADING..." : "Upload Location"}
        </button>
      </form>
    </div>
  );
};

export default AddLocation;
