import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  type Firestore,
  getDoc,
  getDocs,
  query,
  type Timestamp,
  where,
} from "firebase/firestore";
import ReactModal from "react-modal";
import { useAuth } from "./useAuth";
import Loader from "./Loader";
import { ToastContainer, toast } from "react-toastify";

interface UserType {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  role: string;
}

interface Campaign {
  name: string;
  description: string;
  status: string;
  createdAt: Date | Timestamp;
  id?: string;
}

async function createCampaign(
  userId: string,
  campaignData: Campaign,
  db: Firestore
) {
  try {
    const campaign = {
      ...campaignData,
      userId: userId,
      createdAt: new Date(),
    };

    const campaignRef = collection(db, "campaigns");
    const newCampaign = await addDoc(campaignRef, campaign);
    console.log("Campaign created with ID:", newCampaign.id);
    return newCampaign.id;
  } catch (error) {
    console.error("Error creating campaign:", error);
    throw error;
  }
}

const UserDetail = () => {
  const { dataBase } = useAuth();
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserType | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [campaignName, setCampaignName] = useState<string>("");
  const [campaignDescription, setCampaignDescription] = useState<string>("");
  const [campaignStatus, setCampaignStatus] = useState<string>("active");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndCampaigns = async () => {
      try {
        if (!dataBase) return;

        const userRef = doc(dataBase, "users", userId as string);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser({
            id: userSnap.id,
            ...userSnap.data(),
          } as unknown as UserType);
        } else {
          console.log("No such user!");
          setUser(null);
          setLoading(false);
          return;
        }

        const campaignRef = collection(dataBase, "campaigns");
        const q = query(campaignRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        const campaignsData: Campaign[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as unknown as Campaign[];

        setCampaigns(campaignsData);
      } catch (error) {
        console.error("Error fetching user or campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUserAndCampaigns();
  }, [dataBase, userId]);

  const handleCreateCampaignClick = () => {
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !dataBase) return;

    const campaignData: Campaign = {
      name: campaignName,
      description: campaignDescription,
      status: campaignStatus,
      createdAt: new Date(),
    };

    try {
      await createCampaign(user.id, campaignData, dataBase);
      setIsModalOpen(false);
      setCampaignName("");
      setCampaignDescription("");
      setCampaignStatus("active");
      toast.success("Campaign created successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      const campaignRef = collection(dataBase, "campaigns");
      const q = query(campaignRef, where("userId", "==", user.id));
      const querySnapshot = await getDocs(q);
      const updatedCampaigns = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as unknown as Campaign[];
      setCampaigns(updatedCampaigns);
    } catch (error) {
      toast.error("Failed to create campaign", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      console.error("Failed to create campaign:", error);
    }
  };

  if (loading) return <Loader />;

  if (!user) return <p>User not found</p>;

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
      <ToastContainer />
      <button
        type="button"
        className="font-bold text-left pl-4 w-min whitespace-nowrap"
        onClick={() => {
          navigate("/dashboard/users");
        }}
      >
        {"< BACK"}
      </button>
      <div className="flex justify-between mt-4">
        <h1 className="text-left text-2xl font-bold pl-4">User Detail</h1>
        <button
          className="px-4 py-2 text-white font-bold rounded-md bg-ooh-yeah-pink"
          type="button"
          onClick={handleCreateCampaignClick}
        >
          New Campaign
        </button>
      </div>
      <div className="p-6 w-full mx-auto bg-white shadow-md rounded-lg mt-4 text-left">
        <p>
          <strong>ID:</strong> {user.id}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email Verified:</strong> {user.emailVerified ? "Yes" : "No"}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
      </div>
      <div className="p-6 w-full mx-auto bg-white shadow-md rounded-lg mt-4 text-left">
        <h2 className="text-xl font-bold mb-4">Campaigns</h2>
        {campaigns.length > 0 ? (
          <ul className="space-y-2">
            {campaigns.map((campaign) => (
              <li key={campaign.id} className="border p-4 rounded-md">
                <p>
                  <strong>Name:</strong> {campaign.name}
                </p>
                <p>
                  <strong>Description:</strong> {campaign.description}
                </p>
                <p>
                  <strong>Status:</strong> {campaign.status}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {campaign.createdAt instanceof Date
                    ? campaign.createdAt.toLocaleString()
                    : campaign.createdAt.toDate().toLocaleString()}
                </p>
                <button
                  type="button"
                  className="font-bold text-left w-min whitespace-nowrap"
                  onClick={() => {
                    navigate(`/dashboard/campaign/${campaign.id}`);
                  }}
                >
                  Go to campagin details
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No campaigns linked to this user.</p>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
