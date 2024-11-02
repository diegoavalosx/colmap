import { useAuth } from "./useAuth";
import logo from "../assets/oohyeah-logo-white.png";

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  return (
    <div className="w-64 h-screen bg-black text-white p-4">
      <img src={logo} alt="logo" className="mb-4" />
      <ul>
        <li className="mb-2 hover:bg-gray-700 p-2 rounded">Overview</li>
        <li className="mb-2 hover:bg-gray-700 p-2 rounded">Reports</li>
        <li className="mb-2 hover:bg-gray-700 p-2 rounded">Analytics</li>
        <li className="mb-2 hover:bg-gray-700 p-2 rounded">Settings</li>
      </ul>
      <button type="button" onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
