import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "./useAuth";
import Loader from "./Loader";

interface UserType {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  role: string;
}

const UserDetail = () => {
  const { dataBase } = useAuth();
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!dataBase) return;
        const docRef = doc(dataBase, "users", userId as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUser({ id: docSnap.id, ...docSnap.data() } as unknown as UserType);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUser();
  }, [dataBase, userId]);

  if (loading) return <Loader />;

  if (!user) return <p>User not found</p>;

  return (
    <div className="flex flex-col">
      <button
        type="button"
        className="font-bold text-left pl-4"
        onClick={() => {
          navigate("/dashboard/users");
        }}
      >
        {"< BACK"}
      </button>
      <div className="flex justify-between mt-4">
        <h1 className="text-left text-2xl font-bold pl-4">Company Name</h1>
        <button
          className="px-4 py-2 text-white font-bold rounded-md bg-ooh-yeah-pink"
          type="button"
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
    </div>
  );
};

export default UserDetail;
