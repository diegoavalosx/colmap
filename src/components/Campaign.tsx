import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import ReactModal from "react-modal";
import { useAuth } from "./useAuth";
import Loader from "./Loader";

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: Date;
  userId: string;
}

const CampaignDetail = () => {
  const { dataBase } = useAuth();
  const { campaignId } = useParams<{ campaignId: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [campaignName, setCampaignName] = useState<string>("");
  const [campaignDescription, setCampaignDescription] = useState<string>("");
  const [campaignStatus, setCampaignStatus] = useState<string>("active");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        if (!dataBase) return;
        const docRef = doc(dataBase, "campaigns", campaignId as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCampaign({
            id: docSnap.id,
            ...docSnap.data(),
          } as unknown as Campaign);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching campaign:", error);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) fetchCampaign();
  }, [dataBase, campaignId]);

  const handleCreateCampaignClick = () => {};

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  };

  if (loading) return <Loader />;

  if (!campaign) return <p>Campaign not found</p>;

  return (
    <div className="flex flex-col">
      <ReactModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
        className="w-full max-w-md p-0 bg-white rounded-lg shadow-lg"
        shouldCloseOnOverlayClick={true}
      >
        <div className="p-6 bg-white rounded-lg w-full">
          <h2 className="text-xl font-bold mb-4">Create New Campaign</h2>
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-opacity-50"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
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
                value={campaignDescription}
                onChange={(e) => setCampaignDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium mb-1"
              >
                Status
              </label>
              <select
                id="status"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-opacity-50"
                value={campaignStatus}
                onChange={(e) => setCampaignStatus(e.target.value)}
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button
              type="submit"
              className="mt-4 px-4 py-2 font-bold text-white bg-blue-500 rounded-md focus:outline-none focus:ring focus:ring-opacity-50"
            >
              Create Campaign
            </button>
          </form>
        </div>
      </ReactModal>
      <button
        type="button"
        className="font-bold text-left pl-4 w-min whitespace-nowrap"
        onClick={() => {
          navigate("/dashboard/campaigns");
        }}
      >
        {"< BACK"}
      </button>
      <div className="flex justify-between mt-4">
        <h1 className="text-left text-2xl font-bold pl-4">Campaign</h1>
        <button
          className="px-4 py-2 text-white font-bold rounded-md bg-ooh-yeah-pink"
          type="button"
          onClick={handleCreateCampaignClick}
        >
          New Location
        </button>
      </div>
      <div className="p-6 w-full mx-auto bg-white shadow-md rounded-lg mt-4 text-left">
        <p>
          <strong>ID:</strong> {campaign.id}
        </p>
        <p>
          <strong>Email:</strong> {campaign.name}
        </p>
        <p>
          <strong>Name:</strong> {campaign.name}
        </p>
        <p>
          <strong>Email Verified:</strong> {campaign.status}
        </p>
        <p>
          <strong>Owner:</strong> {campaign.userId}
        </p>
      </div>
    </div>
  );
};

export default CampaignDetail;
