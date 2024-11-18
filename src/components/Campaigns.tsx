import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { HiXCircle, HiPencilAlt } from "react-icons/hi";
import { Link } from "react-router-dom";

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

const Users = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [userEmails, setUserEmails] = useState<{ [userId: string]: string }>(
    {}
  );
  const { dataBase } = useAuth();

  const deleteUsers = async (id: string) => {
    if (!dataBase) return;
    await deleteDoc(doc(dataBase, "campaigns", id));
  };

  useEffect(() => {
    const fetchCampaignsAndUsers = async () => {
      if (!dataBase) return;
      try {
        // Fetch campaigns
        const campaignSnapshot = await getDocs(
          collection(dataBase, "campaigns")
        );
        const campaignList = campaignSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Campaign[];
        setCampaigns(campaignList);

        // Fetch users
        const userSnapshot = await getDocs(collection(dataBase, "users"));
        const userMap: { [userId: string]: string } = {};
        for (const userDoc of userSnapshot.docs) {
          const userData = userDoc.data() as User;
          userMap[userDoc.id] = userData.email; // Map userId to email
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
                      deleteUsers(campaign.id);
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

export default Users;
