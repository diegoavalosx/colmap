import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { HiXCircle, HiPencilAlt } from "react-icons/hi";
import { Link } from "react-router-dom";

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

  const deleteUsers = async (id: string) => {
    if (!dataBase) return;
    await deleteDoc(doc(dataBase, "users", id));
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
      <h1 className="text-left text-2xl font-bold pl-4">Users</h1>
      <div className="flex justify-center mt-6">
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
                  <button type="button">
                    <HiPencilAlt size={30} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteUsers(user.id);
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
