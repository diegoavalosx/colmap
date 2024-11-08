import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import Loader from "./Loader";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, dataBase } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user || !dataBase) {
        setIsAuthorized(false);
        return;
      }

      if (!requiredRole) {
        setIsAuthorized(true);
        return;
      }

      try {
        const userDoc = await getDoc(doc(dataBase, "users", user.uid));
        const userData = userDoc.data();

        if (userData?.role === requiredRole) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        setIsAuthorized(false);
      }
    };

    checkUserRole();
  }, [user, dataBase, requiredRole]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthorized === null) {
    return <Loader />;
  }

  return isAuthorized ? children : <Navigate to="/dashboard" replace />;
};

export default ProtectedRoute;
