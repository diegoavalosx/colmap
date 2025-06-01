import { useAuth } from "./useAuth";
import { Link } from "react-router-dom";
import { HiUsers, HiSpeakerphone, HiCog, HiHome } from "react-icons/hi";

const MainContent: React.FC = () => {
  const { role } = useAuth();

  const adminResources = [
    {
      title: "Users",
      path: "/dashboard/users",
      icon: HiUsers,
      description: "Manage user accounts and permissions",
    },
    {
      title: "Campaigns",
      path: "/dashboard/campaigns",
      icon: HiSpeakerphone,
      description: "Create and manage marketing campaigns",
    },
    {
      title: "Settings",
      path: "/dashboard/settings",
      icon: HiCog,
      description: "Configure system settings and preferences",
    },
  ];

  const userResources = [
    {
      title: "Homepage",
      path: "/",
      icon: HiHome,
      description: "View your personalized dashboard",
    },
    {
      title: "Campaigns",
      path: "/dashboard/campaigns",
      icon: HiSpeakerphone,
      description: "Access and manage your campaigns",
    },
  ];

  const resources = role === "admin" ? adminResources : userResources;

  if (!role) return null;

  return (
    <div className="h-full p-4 sm:p-8 md:p-12">
      <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-4 sm:mb-8 text-gray-900">
        Welcome to your Dashboard!
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {resources.map((resource) => (
          <Link
            key={resource.path}
            to={resource.path}
            className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
          >
            <div className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 sm:mb-6 rounded-full bg-gray-900 text-white group-hover:bg-black transition-colors duration-300">
                <resource.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
                {resource.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                {resource.description}
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MainContent;
