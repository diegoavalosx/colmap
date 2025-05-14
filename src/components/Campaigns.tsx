import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "./useAuth";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { HiXCircle, HiPencilAlt, HiEye } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import ReactModal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import Loader from "./Loader";

interface Campaign {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
  userId: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface CreateCampaignFormData {
  name: string;
  status: string;
  userId: string;
}

const Campaigns = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [userEmails, setUserEmails] = useState<{ [userId: string]: string }>(
    {}
  );
  const { dataBase } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [originalCampaign, setOriginalCampaign] = useState<Campaign | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<CreateCampaignFormData>({
    name: "",
    status: "active",
    userId: "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleOpenModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCampaign(null);
  };

  const handleOpenEditModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setOriginalCampaign({ ...campaign });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCampaign(null);
  };

  const handleEditCampaignSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dataBase) return;
    if (selectedCampaign) {
      try {
        const campaignDocRef = doc(dataBase, "campaigns", selectedCampaign.id);
        await updateDoc(campaignDocRef, {
          name: selectedCampaign.name,
          status: selectedCampaign.status,
        });
        setCampaigns((prevCampaigns) =>
          prevCampaigns.map((campaign) =>
            campaign.id === selectedCampaign.id ? selectedCampaign : campaign
          )
        );
        toast.success("Campaign updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        setIsEditModalOpen(false);
      } catch (error) {
        toast.error("Failed to update. Try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        console.log("Error:", error);
      }
    }
  };

  const isSaveDisabled = () => {
    return (
      !selectedCampaign ||
      !selectedCampaign.name.trim() ||
      (selectedCampaign.name === originalCampaign?.name &&
        selectedCampaign.status === originalCampaign?.status)
    );
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    console.log("Deleting Campaign");
    if (!dataBase) return;

    try {
      const locationsRef = collection(
        dataBase,
        `campaigns/${campaignId}/locations`
      );
      const locationDocs = await getDocs(locationsRef);

      const deleteLocationsPromises = locationDocs.docs.map((locationDoc) =>
        deleteDoc(
          doc(dataBase, `campaigns/${campaignId}/locations/${locationDoc.id}`)
        )
      );
      await Promise.all(deleteLocationsPromises);

      await deleteDoc(doc(dataBase, `campaigns/${campaignId}`));

      toast.success("Campaigns and locations successfully deleted", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      setCampaigns((prevCampaign) =>
        prevCampaign.filter((campaign) => campaign.id !== campaignId)
      );
      setIsModalOpen(false);
      console.log(`Campaign ${campaignId} and all locations deleted`);
    } catch (error) {
      console.error("Error deleting campaign and locations:", error);
      toast.error("Failed to delete campaigns and locations. Try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
    setUserSearch("");
    setSelectedUser(null);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormData({
      name: "",
      status: "active",
      userId: "",
    });
    setUserSearch("");
    setSelectedUser(null);
    setUserDropdownOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCreateCampaignSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dataBase) return;
    setIsLoading(true);

    try {
      const campaignData = {
        ...formData,
        createdAt: new Date(),
      };

      const campaignRef = collection(dataBase, "campaigns");
      await addDoc(campaignRef, campaignData);

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

      const campaignSnapshot = await getDocs(collection(dataBase, "campaigns"));
      const campaignList = campaignSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Campaign[];
      setCampaigns(campaignList);

      setIsCreateModalOpen(false);
      setFormData({
        name: "",
        status: "active",
        userId: "",
      });
    } catch (error) {
      toast.error("Failed to create campaign. Try again.", {
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCampaignsAndUsers = async () => {
      if (!dataBase) return;
      try {
        const campaignSnapshot = await getDocs(
          collection(dataBase, "campaigns")
        );
        const campaignList = campaignSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Campaign[];
        setCampaigns(campaignList);

        const userSnapshot = await getDocs(collection(dataBase, "users"));
        const userList = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        setUsers(userList);

        const userMap: { [userId: string]: string } = {};
        for (const user of userList) {
          userMap[user.id] = user.email;
        }
        setUserEmails(userMap);
      } catch (error) {
        console.error("Error fetching campaigns or users: ", error);
      }
    };

    fetchCampaignsAndUsers();
  }, [dataBase]);

  const filteredUsers = users
    .filter((user) =>
      `${user.name} (${user.email})`
        .toLowerCase()
        .includes(userSearch.toLowerCase())
    )
    .slice(0, 5);

  return (
    <>
      <ToastContainer />
      <ReactModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4"
        className="relative bg-white rounded-lg shadow-lg p-4 md:p-6 w-11/12 max-w-md mx-auto"
        shouldCloseOnOverlayClick={true}
      >
        <h1 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-center">
          Are you sure you want to delete this campaign?
        </h1>
        <p className="mb-5 md:mb-6 text-center">This action cannot be undone</p>
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            className="bg-ooh-yeah-pink text-white px-3 py-2 md:px-4 rounded-md hover:bg-ooh-yeah-pink-700 transition"
            onClick={() =>
              selectedCampaign
                ? handleDeleteCampaign(selectedCampaign.id)
                : console.error("No user selected")
            }
          >
            Yes, delete
          </button>
          <button
            type="button"
            className="bg-gray-200 text-black px-3 py-2 md:px-4 rounded-md hover:bg-gray-300 transition"
            onClick={closeModal}
          >
            No, cancel
          </button>
        </div>
      </ReactModal>
      <ReactModal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4"
        className="relative bg-white rounded-lg shadow-lg p-4 md:p-6 w-11/12 max-w-md mx-auto"
        shouldCloseOnOverlayClick={true}
      >
        <h1 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-center">
          Updating campaign
        </h1>
        {selectedCampaign && (
          <div className="p-4 bg-white rounded-lg w-full">
            <form
              onSubmit={handleEditCampaignSubmit}
              className="flex flex-col gap-4"
            >
              <div>
                <label
                  htmlFor="ID"
                  className="block text-sm font-semibold mb-1"
                >
                  ID
                </label>
                <input
                  type="text"
                  id="id"
                  className="w-full p-2 border rounded-md bg-gray-100 text-gray-500 focus:outline-none focus:ring focus:ring-opacity-50"
                  value={selectedCampaign.id}
                  disabled
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-opacity-50"
                  value={selectedCampaign.name}
                  onChange={(e) =>
                    setSelectedCampaign((prev) =>
                      prev ? { ...prev, name: e.target.value } : prev
                    )
                  }
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-semibold mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-opacity-50"
                  value={selectedCampaign.status}
                  onChange={(e) =>
                    setSelectedCampaign((prev) =>
                      prev ? { ...prev, status: e.target.value } : prev
                    )
                  }
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  type="submit"
                  disabled={isSaveDisabled()}
                  className={`mt-4 px-4 py-2 font-bold text-white rounded-md focus:outline-none focus:ring focus:ring-opacity-50 
                    ${
                      isSaveDisabled()
                        ? "bg-ooh-yeah-pink cursor-not-allowed opacity-40"
                        : "bg-ooh-yeah-pink hover:bg-ooh-yeah-pink-700"
                    }`}
                >
                  Save
                </button>
                <button
                  type="submit"
                  className="mt-4 bg-gray-200 text-black px-4 py-2 md:px-4 rounded-md hover:bg-gray-300 transition"
                  onClick={handleCloseEditModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </ReactModal>
      <ReactModal
        isOpen={isCreateModalOpen}
        onRequestClose={handleCloseCreateModal}
        overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4"
        className="relative bg-white rounded-lg shadow-lg p-4 md:p-6 w-11/12 max-w-md mx-auto"
        shouldCloseOnOverlayClick={true}
      >
        {isLoading ? (
          <Loader fullScreen={false} />
        ) : (
          <form onSubmit={handleCreateCampaignSubmit} className="text-left">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Campaign</h2>
              <button
                type="button"
                onClick={handleCloseCreateModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <HiXCircle size={24} />
              </button>
            </div>

            <div className="mb-4 relative">
              <label
                htmlFor="userSearch"
                className="block text-sm mb-2 font-bold text-gray-700"
              >
                User:
              </label>
              <input
                id="userSearch"
                type="text"
                placeholder="Search users..."
                className="w-full px-3 py-2 text-black placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent"
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserDropdownOpen(true);
                }}
                onFocus={() => setUserDropdownOpen(true)}
                required
                autoComplete="off"
              />
              {userDropdownOpen && (
                <div className="absolute w-full max-h-40 overflow-y-auto border rounded mt-1 bg-white shadow-lg z-50">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-2 cursor-pointer hover:bg-gray-100 ${
                        selectedUser?.id === user.id
                          ? "bg-gray-200 font-semibold"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedUser(user);
                        setUserSearch(`${user.name} (${user.email})`);
                        setFormData((prev) => ({ ...prev, userId: user.id }));
                        setUserDropdownOpen(false);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          setSelectedUser(user);
                          setUserSearch(`${user.name} (${user.email})`);
                          setFormData((prev) => ({ ...prev, userId: user.id }));
                          setUserDropdownOpen(false);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      {user.name} ({user.email})
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="p-2 text-sm text-gray-500">
                      No users found
                    </div>
                  )}
                  {users.filter((user) =>
                    `${user.name} (${user.email})`
                      .toLowerCase()
                      .includes(userSearch.toLowerCase())
                  ).length > 5 && (
                    <div className="p-2 text-sm text-gray-500 border-t sticky bottom-0 bg-white">
                      Showing first 5 results. Type more to refine search.
                    </div>
                  )}
                </div>
              )}
            </div>

            <label
              htmlFor="name"
              className="block text-sm mb-2 font-bold text-gray-700"
            >
              Name:
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 mb-4 text-black placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent"
              placeholder="Campaign Name"
              required
            />

            <label
              htmlFor="status"
              className="block text-sm mb-2 font-bold text-gray-700"
            >
              Status:
            </label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 mb-4 text-black placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="flex justify-center space-x-4">
              <button
                type="submit"
                disabled={!selectedUser || !formData.name}
                className={`w-full py-2 mt-4 font-semibold text-white rounded-lg transition-colors ${
                  !selectedUser || !formData.name
                    ? "bg-ooh-yeah-pink opacity-50 cursor-not-allowed"
                    : "bg-ooh-yeah-pink hover:bg-pink-600"
                }`}
              >
                Create Campaign
              </button>
              <button
                type="button"
                className="mt-4 bg-gray-200 text-black px-4 py-2 md:px-4 rounded-md hover:bg-gray-300 transition"
                onClick={handleCloseCreateModal}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </ReactModal>
      <div className="flex justify-between items-center my-5 md:my-5">
        <h1 className="text-center lg:text-left text-2xl font-bold">
          Campaigns
        </h1>
        <button
          className="px-4 py-2 text-white font-bold rounded-md bg-ooh-yeah-pink hover:bg-ooh-yeah-pink-700 transition-colors"
          type="button"
          onClick={handleOpenCreateModal}
        >
          New Campaign
        </button>
      </div>
      <div className="flex mt-0 overflow-scroll">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-gray-600 font-bold text-sm border-b border-gray-200">
                Name
              </th>
              <th className="px-6 py-3 text-left text-gray-600 font-bold text-sm border-b border-gray-200">
                Actions
              </th>
              <th className="px-6 py-3 text-left text-gray-600 font-bold text-sm border-b border-gray-200">
                Status
              </th>
              <th className="px-6 py-3 text-left text-gray-600 font-bold text-sm border-b border-gray-200">
                Owner
              </th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr
                key={campaign.id}
                className="even:bg-gray-100 hover:bg-gray-50"
              >
                <td className="px-6 py-4 md:text-left text-center text-gray-800 border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/dashboard/campaign/${campaign.id}`)
                    }
                    className="text-ooh-yeah-pink hover:underline"
                  >
                    {campaign.name}
                  </button>
                </td>
                <td className="px-6 py-4 md:text-left text-center text-gray-800 border-b border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(campaign)}
                      className="hover:text-ooh-yeah-pink transition-colors"
                    >
                      <HiPencilAlt size={25} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenModal(campaign);
                      }}
                      className="hover:text-red-500 transition-colors"
                    >
                      <HiXCircle size={25} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/dashboard/campaign/${campaign.id}`);
                      }}
                      className="hover:text-ooh-yeah-pink transition-colors"
                    >
                      <HiEye size={25} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 md:text-left text-center text-gray-800 border-b border-gray-200">
                  {campaign.status}
                </td>
                <td className="px-6 py-4 md:text-left text-center text-gray-800 border-b border-gray-200">
                  {userEmails[campaign.userId] || "No email available"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Campaigns;
