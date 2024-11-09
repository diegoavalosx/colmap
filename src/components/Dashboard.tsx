import Sidebar from "./Sidebard";
import MainContent from "./MainContent";
import { Route, Routes } from "react-router-dom";
import Users from "./Users";
import ProtectedRoute from "./ProtectedRoute";
import User from "./User";

const Dashboard = () => {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route
            path="users"
            element={
              <ProtectedRoute requiredRole="admin">
                <Users />
              </ProtectedRoute>
            }
          />
          <Route path="/user/:userId" element={<User />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
