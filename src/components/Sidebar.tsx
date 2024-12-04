import { useAuth } from "./useAuth";
import logo from "../assets/oohyeah-logo-white.png";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Sidebar: React.FC = () => {
  const { logout, role } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <div
        className={`fixed inset-y-0 felt-0 z-50 bg-black text-white w-64 p-4 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }
          transition-transform duration-300 lg:relative lg:translate-x-0`}
      >
        <div className="relative w-full">
          <img src={logo} alt="logo" className="mb-2 px-7" />
          {role === "admin" && (
            <p className="absolute right-0 top-9 text-xs font-semibold font-sans text-center white">
              Admin
            </p>
          )}
        </div>
        <nav className="text-center font-semibold">
          <ul>
            <li className="mb-2 hover:bg-gray-700 p-2 rounded">
              <Link to="/dashboard">Home</Link>
            </li>
            {role === "admin" && (
              <li className="mb-2 hover:bg-gray-700 p-2 rounded">
                <Link to="/dashboard/users">Users</Link>
              </li>
            )}
            {role === "admin" && (
              <li className="mb-2 hover:bg-gray-700 p-2 rounded">
                <Link to="/dashboard/campaigns">Campaigns</Link>
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
        className="absolute z-50 p-2 text-white bg-black rounded-md top-4 left-2 lg:hidden"
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>
    </>
  );
};

export default Sidebar;
