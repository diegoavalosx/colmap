import { useAuth } from "./useAuth";
import logo from "../assets/oohyeah-logo-white.png";
import { Link } from "react-router-dom";

const Sidebar: React.FC = () => {
  const { logout, role } = useAuth();
  return (
    <div className="w-64 h-screen bg-black text-white p-4">
      <img src={logo} alt="logo" className="mb-4 px-7" />
      <nav>
        <ul>
          <li className="mb-2 hover:bg-gray-700 p-2 rounded">
            <Link to="/dashboard">Home</Link>
          </li>
          {role === "admin" && (
            <li className="mb-2 hover:bg-gray-700 p-2 rounded">
              <Link to="/dashboard/users">Users</Link>
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
  );
};

export default Sidebar;
