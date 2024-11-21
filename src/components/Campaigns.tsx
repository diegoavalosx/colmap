import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { HiXCircle, HiPencilAlt } from "react-icons/hi";
import { Link } from "react-router-dom";
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
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [userEmails, setUserEmails] = useState<{ [userId: string]: string }>(
    {}
  );
  const { dataBase } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  const handleOpenModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    console.log("Deleting Campaign")
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

      toast.success(
        "Campaigns and locations successfully deleted",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        }
      );
      setCampaigns((prevCampaign) => prevCampaign.filter((campaign) => campaign.id !== campaignId))
      setIsModalOpen(false);
      console.log(`Campaign ${campaignId} and all locations deleted`);
    } catch (error) {
      console.error("Error deleting campaign and locations:", error);
      toast.error(
        "Failed to delete campaigns and locations. Try again.",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        }
      );
    }
  }

  const closeModal = () => {
    console.log("Cancelado");
    setIsModalOpen(false);
    setSelectedCampaign(null);
  }

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
    <ReactModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4"
        className="relative bg-white rounded-lg shadow-lg p-4 md:p-6 w-11/12 max-w-md mx-auto"
        shouldCloseOnOverlayClick={true}
      >
        <h1 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-center">{`Are you sure you want to delete ${selectedCampaign?.name}?`}</h1>
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
      <ToastContainer />
      <h1 className="text-center lg:text-left text-2xl font-bold pl-4">Campaigns</h1>
      <div className="flex mt-6 overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-gray-600 font-bold text-sm border-b border-gray-200">
                ID
              </th>
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
                  <Link
                    to={`/dashboard/campaign/${campaign.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {campaign.id}
                  </Link>
                </td>
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
                  <button type="button">
                    <HiPencilAlt size={30} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // deleteCampaign(campaign.id);
                      handleOpenModal(campaign)
                    }}
                  >
                    <HiXCircle size={30} />
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
