import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "./useAuth";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { HiXCircle, HiPencilAlt } from "react-icons/hi";
import { Link } from "react-router-dom";
import ReactModal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type User = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  role: string;
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { dataBase } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [originalUser, setOriginalUser] = useState<User | null>(null);

  const handleOpenModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    console.log("Cancelado");
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setOriginalUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleEditUserSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dataBase) return;
    if (selectedUser) {
      try {
        const userDocRef = doc(dataBase, "users", selectedUser.id);
        await updateDoc(userDocRef, {
          name: selectedUser.name,
        });
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === selectedUser.id ? selectedUser : user
          )
        );
        toast.success("¡User successfully updated!", {
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
        toast.error("Failed to update user. Try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        console.error("Failed to update user:", error);
      }
    }
  };

  const isSaveDisabled = () => {
    return (
      !selectedUser ||
      !selectedUser.name.trim() ||
      selectedUser.name === originalUser?.name
    );
  };

  const handleDeleteUsers = async (id: string) => {
    console.log("Deleting user, their campaigns, and locations...", id);
    if (!dataBase) return;

    try {
      const campaignsRef = collection(dataBase, "campaigns");
      const campaignsQuery = query(campaignsRef, where("userId", "==", id));
      const campaignsSnapshot = await getDocs(campaignsQuery);

      const deleteCampaignsAndLocationsPromises = campaignsSnapshot.docs.map(
        async (campaignDoc) => {
          const campaignId = campaignDoc.id;

          const locationsRef = collection(
            dataBase,
            `campaigns/${campaignId}/locations`
          );
          const locationsSnapshot = await getDocs(locationsRef);

          const deleteLocationsPromises = locationsSnapshot.docs.map(
            (locationDoc) =>
              deleteDoc(
                doc(
                  dataBase,
                  `campaigns/${campaignId}/locations/${locationDoc.id}`
                )
              )
          );
          await Promise.all(deleteLocationsPromises);

          console.log(
            `Deleted ${locationsSnapshot.size} locations for campaign ID: ${campaignId}`
          );

          await deleteDoc(doc(dataBase, "campaigns", campaignId));
        }
      );

      await Promise.all(deleteCampaignsAndLocationsPromises);

      console.log(
        `Deleted ${campaignsSnapshot.size} campaigns and their locations for user ID: ${id}`
      );

      await deleteDoc(doc(dataBase, "users", id));

      toast.success(
        "User, their campaigns, and locations successfully deleted",
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
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting user, campaigns, and locations:", error);
      toast.error(
        "Failed to delete user, campaigns, and locations. Try again.",
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
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!dataBase) return;
      try {
        const querySnapshot = await getDocs(collection(dataBase, "users"));
        const userList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
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
        <h1 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-center">{`Are you sure you want to delete ${selectedUser?.name}?`}</h1>
        <p className="mb-5 md:mb-6 text-center">
          All campaigns and locations linked to this user will be deleted. This
          action cannot be undone
        </p>
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            className="bg-ooh-yeah-pink text-white px-3 py-2 md:px-4 rounded-md hover:bg-ooh-yeah-pink-700 transition"
            onClick={() =>
              selectedUser
                ? handleDeleteUsers(selectedUser.id)
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
        <h1 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-center">{`Updating ${originalUser?.name}`}</h1>
        <p className="mb-5 md:mb-6 text-center">This action cannot be undone</p>
        {selectedUser && (
          <div className="p-4 bg-white rounded-lg w-full">
            <form
              onSubmit={handleEditUserSubmit}
              className="flex flex-col gap-4"
            >
              <div>
                <label htmlFor="ID" className="block text-sm font-medium mb-1">
                  ID
                </label>
                <input
                  type="text"
                  id="id"
                  className="w-full p-2 border rounded-md bg-gray-100 text-gray-500 focus:outline-none focus:ring focus:ring-opacity-50"
                  value={selectedUser.id}
                  disabled
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-opacity-50"
                  value={selectedUser.name}
                  onChange={(e) =>
                    setSelectedUser((prev) =>
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
        Users
      </h1>
      <div className="flex mt-6 overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-gray-600 font-bold text-sm border-b border-gray-200">
                ID
              </th>
              <th className="px-6 py-3 text-left text-gray-600 font-bold text-sm border-b border-gray-200">
                Email
              </th>
              <th className="px-6 py-3 text-left text-gray-600 font-bold text-sm border-b border-gray-200">
                Name
              </th>
              <th className="px-6 py-3 text-left text-gray-600 font-bold text-sm border-b border-gray-200">
                Email verified
              </th>
              <th className="px-6 py-3 text-left text-gray-600 font-bold text-sm border-b border-gray-200">
                Role
              </th>
              <th className="px-6 py-3 text-left text-gray-600 font-bold text-sm border-b border-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="even:bg-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-left text-gray-800 border-b border-gray-200">
                  <Link
                    to={`/dashboard/user/${user.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {user.id}
                  </Link>
                </td>
                <td className="px-6 py-4 text-left text-gray-800 border-b border-gray-200">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-left text-gray-800 border-b border-gray-200">
                  {user.name}
                </td>
                <td className="px-6 py-4 text-left text-gray-800 border-b border-gray-200">
                  {user.emailVerified ? "Yes" : "No"}
                </td>
                <td className="px-6 py-4 text-left text-gray-800 border-b border-gray-200">
                  {user.role}
                </td>
                <td className="px-6 py-4 text-left text-gray-800 border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(user)}
                  >
                    <HiPencilAlt size={25} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      // deleteUsers(user.id);
                      handleOpenModal(user)
                    }
                  >
                    <HiXCircle size={25} />
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
