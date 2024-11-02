import Sidebar from "./Sidebard";
import MainContent from "./MainContent";

const Dashboard = () => {
  return (
    <div className="flex h-full">
      <Sidebar />
      <MainContent />
    </div>
  );
};

export default Dashboard;
