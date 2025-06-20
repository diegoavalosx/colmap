import { useAuth } from "./useAuth";
import logo from "../assets/oohyeah-logo-white.png";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react";

const Sidebar: React.FC = () => {
  const { logout, role } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  if (!role) return null;

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-black text-white w-48 p-4 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }
          transition-transform duration-300 lg:relative lg:translate-x-0`}
      >
        <div className="relative w-full">
          <button
            type="button"
            onClick={() => {
              navigate("/");
            }}
          >
            <img src={logo} alt="logo" className="mb-2" />
          </button>
          {role === "admin" && (
            <p className="absolute right-0 top-11 text-xs font-semibold font-sans text-center white">
              Admin
            </p>
          )}
        </div>
        <nav className="text-center font-semibold">
          <ul>
            <li className="mb-2 hover:bg-gray-700 p-2 rounded">
              <Link
                to="/dashboard"
                onClick={() => isSidebarOpen && setIsSidebarOpen(false)}
              >
                Home
              </Link>
            </li>
            {role === "admin" && (
              <li className="mb-2 hover:bg-gray-700 p-2 rounded">
                <Link
                  to="/dashboard/users"
                  onClick={() => isSidebarOpen && setIsSidebarOpen(false)}
                >
                  Users
                </Link>
              </li>
            )}
            <li className="mb-2 hover:bg-gray-700 p-2 rounded">
              <Link
                to="/dashboard/campaigns"
                onClick={() => isSidebarOpen && setIsSidebarOpen(false)}
              >
                Campaigns
              </Link>
            </li>
            {role === "admin" && (
              <li className="mb-2 hover:bg-gray-700 p-2 rounded">
                <Link
                  to="/dashboard/settings"
                  onClick={() => isSidebarOpen && setIsSidebarOpen(false)}
                >
                  Settings
                </Link>
              </li>
            )}
            <li className="mb-2 hover:bg-gray-700 p-2 rounded">
              <button type="button" onClick={() => logout()}>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <button
        type="button"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute z-50 p-2 text-white bg-black rounded-md top-4 left-4 lg:hidden"
      >
        {isSidebarOpen ? null : <Menu />}
      </button>
    </>
  );
};

export default Sidebar;
