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

  const handleUrlParse = () => {
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = googleMapsUrl.match(regex);
    if (match) {
      setLatitude(match[1]);
      setLongitude(match[2]);
    } else {
      toast.error("Could not extract coordinates from URL");
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const selected = Array.from(files).slice(0, 5); // Limit to 5
      setImages(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataBase || !storage || !selectedCampaign) return;

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
    }
  };

  const filteredCampaigns = campaigns.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-xl mx-auto p-6 bg-white">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4 text-center">Add New Location</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="search" className="block font-medium mb-1">
            Select Campaign
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search campaigns..."
            className="w-full p-2 border rounded mb-2"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
          />
          {dropdownOpen && (
            <div className="max-h-40 overflow-y-auto border rounded">
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
                >
                  {campaign.name}
                </div>
              ))}
              {filteredCampaigns.length === 0 && (
                <div className="p-2 text-sm text-gray-500">
                  No campaigns found
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
            Google Maps URL
          </label>
          <input
            id="url"
            type="url"
            className="w-full p-2 border rounded"
            value={googleMapsUrl}
            onChange={(e) => setGoogleMapsUrl(e.target.value)}
            placeholder="https://www.google.com/maps/..."
          />
          <button
            type="button"
            className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleUrlParse}
          >
            Extract Coordinates
          </button>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="latitue" className="block font-medium mb-1">
              Latitude
            </label>
            <input
              id="latitue"
              type="text"
              className="w-full p-2 border rounded"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
            <label htmlFor="longitude" className="block font-medium mb-1">
              Longitude
            </label>
            <input
              id="longitude"
              type="text"
              className="w-full p-2 border rounded"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              required
            />
          </div>
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
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <li key={i}>{img.name}</li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-ooh-yeah-pink text-white py-2 rounded font-bold hover:bg-ooh-yeah-pink-700"
          disabled={
            !selectedCampaign || !locationName || !latitude || !longitude
          }
        >
          Upload Location
        </button>
      </form>
    </div>
  );
};

export default AddLocation;
