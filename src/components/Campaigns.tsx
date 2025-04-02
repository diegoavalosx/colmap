import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "./useAuth";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { HiXCircle, HiPencilAlt, HiEye } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import ReactModal from "react-modal";
import { ToastContainer, toast } from "react-toastify";

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: Date;
  userId: string;
}

interface User {
  id: string;
  email: string;
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
      selectedCampaign.name === originalCampaign?.name
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
        const userMap: { [userId: string]: string } = {};
        for (const userDoc of userSnapshot.docs) {
          const userData = userDoc.data() as User;
          userMap[userDoc.id] = userData.email;
        }
        setUserEmails(userMap);
      } catch (error) {
        console.error("Error fetching campaigns or users: ", error);
      }
    };

    fetchCampaignsAndUsers();
  }, [dataBase]);

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
        <h1 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-center">{`Updating ${originalCampaign?.name}`}</h1>
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
      <h1 className="text-center lg:text-left text-2xl font-bold pl-4">
        Campaigns
      </h1>
      <div className="flex mt-6 overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-gray-600 font-bold text-sm border-b border-gray-200">
                Name
              </th>
              <th className="px-6 py-3 text-left text-gray-600 font-bold text-sm border-b border-gray-200">
                Status
              </th>
              <th className="px-6 py-3 text-left text-gray-600 font-bold text-sm border-b border-gray-200">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-gray-600 font-bold text-sm border-b border-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr
                key={campaign.id}
                className="even:bg-gray-100 hover:bg-gray-50"
              >
                <td className="px-6 py-4 text-left text-gray-800 border-b border-gray-200">
                  {campaign.name}
                </td>
                <td className="px-6 py-4 text-left text-gray-800 border-b border-gray-200">
                  {campaign.status}
                </td>
                <td className="px-6 py-4 text-left text-gray-800 border-b border-gray-200">
                  {userEmails[campaign.userId] || "No email available"}
                </td>
                <td className="px-6 py-4 text-left text-gray-800 border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(campaign)}
                  >
                    <HiPencilAlt size={25} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenModal(campaign);
                    }}
                  >
                    <HiXCircle size={25} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/dashboard/campaign/${campaign.id}`);
                    }}
                  >
                    <HiEye size={25} />
                  </button>
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
