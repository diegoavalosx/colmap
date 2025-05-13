import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import { Route, Routes } from "react-router-dom";
import Users from "./Users";
import ProtectedRoute from "./ProtectedRoute";
import User from "./User";
import Campaigns from "./Campaigns";
import Campaign from "./Campaign";
import Settings from "./Settings";

const Dashboard = () => {
  return (
    <div className="flex w-full max-h-full">
      <Sidebar />
      <div className="flex-1 px-4 pt-10 pb-4 md:p-6 bg-gray-100 overflow-scroll">
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
          <Route
            path="campaigns"
            element={
              <ProtectedRoute requiredRole="admin">
                <Campaigns />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/user/:userId" element={<User />} />
          <Route path="/campaign/:campaignId" element={<Campaign />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
