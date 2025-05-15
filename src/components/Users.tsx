import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "./useAuth";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import {
  HiXCircle,
  HiPencilAlt,
  HiEye,
  HiFilter,
  HiPlus,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import ReactModal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./Loader";

type User = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  role: string;
};

type SignUpFormData = {
  name: string;
  email: string;
  password: string;
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { dataBase } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    email: "",
    name: "",
    role: "",
    emailVerified: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleOpenModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
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

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleEditUserSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dataBase) return;
    if (selectedUser) {
      try {
        const userDocRef = doc(dataBase, "users", selectedUser.id);
        await updateDoc(userDocRef, {
          name: selectedUser.name,
          role: selectedUser.role,
        });
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === selectedUser.id ? selectedUser : user
          )
        );
        toast.success("User successfully updated!", {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const functions = getFunctions();
      const createUser = httpsCallable(functions, "createUser");

      const result = await createUser({
        email: formData.email,
        password: formData.password,
        displayName: formData.name,
      });

      toast.success("User created successfullly!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

      console.log("User created successfully:", result.data);
      await fetchUsers();
      setIsCreateModalOpen(false);
      setFormData({ name: "", email: "", password: "" });
      setIsLoading(false);
    } catch (error) {
      toast.error("Failed to create user. Try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      console.error("Failed to create user:", error);
      setIsLoading(false);
    }
  };

  const isSaveDisabled = () => {
    if (!selectedUser || !selectedUser.name.trim()) return true;
    const hasNameChanged = selectedUser.name !== originalUser?.name;
    const hasRoleChanged = selectedUser.role !== originalUser?.role;
    return !(hasNameChanged || hasRoleChanged);
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

  const fetchUsers = useCallback(async () => {
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
  }, [dataBase]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredUsers = users.filter((user) => {
    return (
      user.email.toLowerCase().includes(filters.email.toLowerCase()) &&
      user.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      (filters.role === "" || user.role === filters.role) &&
      (filters.emailVerified === "" ||
        (filters.emailVerified === "yes" && user.emailVerified) ||
        (filters.emailVerified === "no" && !user.emailVerified))
    );
  });

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
          Are you sure you want to delete this user?
        </h1>
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
        {selectedUser && (
          <div className="p-4 bg-white rounded-lg w-full">
            <form
              onSubmit={handleEditUserSubmit}
              className="flex flex-col gap-4"
            >
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
                  value={selectedUser.name}
                  onChange={(e) =>
                    setSelectedUser((prev) =>
                      prev ? { ...prev, name: e.target.value } : prev
                    )
                  }
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="selectRole"
                  className="block text-sm font-semibold mb-1"
                >
                  Role
                </label>
                <select
                  name="selectRole"
                  value={selectedUser.role}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-opacity-50"
                  onChange={(e) =>
                    setSelectedUser((prev) =>
                      prev ? { ...prev, role: e.target.value } : prev
                    )
                  }
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
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
        onRequestClose={() => setIsCreateModalOpen(false)}
        overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4"
        className="relative bg-white rounded-lg shadow-lg p-4 md:p-6 w-11/12 max-w-md mx-auto"
        shouldCloseOnOverlayClick={true}
      >
        {isLoading ? (
          <Loader fullScreen={false} />
        ) : (
          <form onSubmit={handleSubmit} className="text-left">
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
              placeholder="Jane Doe"
              required
            />

            <label
              htmlFor="email"
              className="block text-sm mb-2 font-bold text-gray-700"
            >
              Email:
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 mb-4 text-black placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent"
              placeholder="you@example.com"
              required
            />

            <label
              htmlFor="password"
              className="block text-sm mb-2 font-bold text-gray-700"
            >
              Password:
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 mb-4 text-black placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent"
              placeholder="••••••••"
              required
            />

            <div className="flex justify-center space-x-4">
              <button
                type="submit"
                className="w-full py-2 mt-4 font-semibold text-white bg-ooh-yeah-pink rounded-lg hover:bg-pink-600 transition-colors"
              >
                Create User
              </button>
              <button
                type="submit"
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
        <h1 className="lg:text-left text-2xl font-bold">Users</h1>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 text-white font-bold rounded-md bg-gray-600 hover:bg-gray-700 transition-colors flex items-center gap-2"
            type="button"
            onClick={() => setShowFilters(!showFilters)}
          >
            <HiFilter size={20} />
          </button>
          <button
            className="px-4 py-2 text-white font-bold rounded-md bg-ooh-yeah-pink hover:bg-ooh-yeah-pink-700 transition-colors"
            type="button"
            onClick={handleOpenCreateModal}
          >
            <HiPlus size={20} />
          </button>
        </div>
      </div>

      {/* Collapsible filter panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="filter-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="text"
                id="filter-email"
                name="email"
                value={filters.email}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-opacity-50"
                placeholder="Search by email..."
              />
            </div>
            <div>
              <label
                htmlFor="filter-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="filter-name"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-opacity-50"
                placeholder="Search by name..."
              />
            </div>
            <div>
              <label
                htmlFor="filter-role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Role
              </label>
              <select
                id="filter-role"
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-opacity-50"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="filter-emailVerified"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Verified
              </label>
              <select
                id="filter-emailVerified"
                name="emailVerified"
                value={filters.emailVerified}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-opacity-50"
              >
                <option value="">All</option>
                <option value="yes">Verified</option>
                <option value="no">Not Verified</option>
              </select>
            </div>
          </div>
          {/* Active filters display */}
          {(filters.email ||
            filters.name ||
            filters.role ||
            filters.emailVerified) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {filters.email && (
                <span className="px-2 py-1 bg-gray-200 rounded-full text-sm flex items-center gap-1">
                  Email: {filters.email}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, email: "" }))
                    }
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <HiXCircle size={16} />
                  </button>
                </span>
              )}
              {filters.name && (
                <span className="px-2 py-1 bg-gray-200 rounded-full text-sm flex items-center gap-1">
                  Name: {filters.name}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, name: "" }))
                    }
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <HiXCircle size={16} />
                  </button>
                </span>
              )}
              {filters.role && (
                <span className="px-2 py-1 bg-gray-200 rounded-full text-sm flex items-center gap-1">
                  Role: {filters.role}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, role: "" }))
                    }
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <HiXCircle size={16} />
                  </button>
                </span>
              )}
              {filters.emailVerified && (
                <span className="px-2 py-1 bg-gray-200 rounded-full text-sm flex items-center gap-1">
                  Email:{" "}
                  {filters.emailVerified === "yes"
                    ? "Verified"
                    : "Not Verified"}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, emailVerified: "" }))
                    }
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <HiXCircle size={16} />
                  </button>
                </span>
              )}
              <button
                onClick={() =>
                  setFilters({
                    email: "",
                    name: "",
                    role: "",
                    emailVerified: "",
                  })
                }
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex mt-0 overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-gray-600 font-bold text-sm border-b border-gray-200 w-1/3">
                Email
              </th>
              <th className="px-6 py-3 text-left text-gray-600 font-bold text-sm border-b border-gray-200 w-1/6">
                Actions
              </th>
              <th className="px-6 py-3 text-left text-gray-600 font-bold text-sm border-b border-gray-200 w-1/4">
                Name
              </th>
              <th className="px-6 py-3 text-left text-gray-600 font-bold text-sm border-b border-gray-200 w-1/6">
                Email verified
              </th>
              <th className="px-6 py-3 text-left text-gray-600 font-bold text-sm border-b border-gray-200 w-1/6">
                Role
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="even:bg-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-left text-gray-800 border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/user/${user.id}`)}
                    className="text-ooh-yeah-pink hover:underline truncate block w-full text-left"
                  >
                    {user.email}
                  </button>
                </td>
                <td className="px-6 py-4 text-left text-gray-800 border-b border-gray-200">
                  <div className="flex items-center justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(user)}
                    >
                      <HiPencilAlt size={25} />
                    </button>
                    <button type="button" onClick={() => handleOpenModal(user)}>
                      <HiXCircle size={25} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/dashboard/user/${user.id}`);
                      }}
                    >
                      <HiEye size={25} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-left text-gray-800 border-b border-gray-200 truncate">
                  {user.name}
                </td>
                <td className="px-6 py-4 text-left text-gray-800 border-b border-gray-200">
                  {user.emailVerified ? "Yes" : "No"}
                </td>
                <td className="px-6 py-4 text-left text-gray-800 border-b border-gray-200">
                  {user.role}
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
