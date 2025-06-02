import { Suspense, lazy } from "react";
import Sidebar from "./Sidebar";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Loader from "./Loader";

const MainContent = lazy(() => import("./MainContent"));
const Users = lazy(() => import("./Users"));
const User = lazy(() => import("./User"));
const Campaigns = lazy(() => import("./Campaigns"));
const Campaign = lazy(() => import("./Campaign"));
const Settings = lazy(() => import("./Settings"));

const Dashboard = () => {
  return (
    <div className="flex w-full max-h-full">
      <Sidebar />
      <div className="flex-1 px-4 pt-10 pb-4 md:p-6 bg-gray-100 overflow-scroll">
        <Suspense fallback={<Loader />}>
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
            <Route path="campaigns" element={<Campaigns />} />
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
        </Suspense>
      </div>
    </div>
  );
};

export default Dashboard;
