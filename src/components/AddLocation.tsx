import { useEffect, useState, useRef } from "react";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { useAuth } from "./useAuth";
import { toast, ToastContainer } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import DevicePhotoImporter, {
  type DevicePhotoDraft,
} from "./DevicePhotoImporter";
import { hasValidPhotoCoordinates } from "../utils/locationGrouping";
import { saveGroupedPhotoLocations } from "../utils/locationUploads";
import { optimizePhotoForWeb } from "../utils/googleDrive";

interface Campaign {
  id: string;
  name: string;
}

const AddLocation = () => {
  const { dataBase, storage } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [photos, setPhotos] = useState<DevicePhotoDraft[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const photosRef = useRef<DevicePhotoDraft[]>([]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(
    () => () => {
      photosRef.current.forEach((photo) =>
        URL.revokeObjectURL(photo.previewUrl)
      );
    },
    []
  );

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!dataBase) return;

      // Always fetch all campaigns
      const snapshot = await getDocs(collection(dataBase, "campaigns"));
      const campaignsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as { name: string }),
      }));
      setCampaigns(campaignsData);

      // If campaignId is present, set it as selected
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
            setDropdownOpen(false);
          } else {
            toast.error("Campaign not found.");
          }
        } catch (error) {
          toast.error("Failed to load campaign.");
          console.error(error);
        }
      }
    };

    fetchCampaigns();
  }, [campaignId, dataBase]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataBase || !storage || !selectedCampaign) return;

    setIsLoading(true);
    setUploadStatus("");
    try {
      if (photos.length === 0) {
        toast.error("Choose at least one photo.");
        return;
      }
      if (!photos.every(hasValidPhotoCoordinates)) {
        toast.error("Add a valid location for every photo.");
        return;
      }

      const result = await saveGroupedPhotoLocations({
        dataBase,
        storage,
        campaignId: selectedCampaign.id,
        photos,
        source: "device",
        preparePhoto: async (photo) =>
          optimizePhotoForWeb(photo.file, photo.name, photo.file.type),
        onProgress: setUploadStatus,
      });
      toast.success(
        `${result.photoCount} photo${result.photoCount === 1 ? "" : "s"} added as ${result.locationCount} location${result.locationCount === 1 ? "" : "s"}.`
      );

      setSelectedCampaign(null);
      photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      setPhotos([]);
    } catch (error) {
      toast.error("Failed to add location. Try again.");
      console.error("Upload error:", error);
    } finally {
      setIsLoading(false);
      setUploadStatus("");
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
        <div className="relative" ref={dropdownRef}>
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
        <DevicePhotoImporter
          photos={photos}
          onChange={setPhotos}
          disabled={isLoading}
        />
        {uploadStatus && (
          <p className="text-center text-sm text-gray-600" aria-live="polite">
            {uploadStatus}
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded bg-ooh-yeah-pink py-2 font-bold text-white transition-colors hover:bg-ooh-yeah-pink-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-ooh-yeah-pink"
          disabled={
            isLoading ||
            !selectedCampaign ||
            photos.length === 0 ||
            !photos.every(hasValidPhotoCoordinates)
          }
        >
          {isLoading ? "UPLOADING..." : "Upload Location"}
        </button>
      </form>
    </div>
  );
};

export default AddLocation;
