import InteractiveMap from "./InteractiveMap";
import { useAuth } from "./useAuth";

const MainContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
      {user && (
        <h1 className="text-3xl font-semibold mb-4">{`Welcome to the Dashboard, ${user.email}`}</h1>
      )}
      {/*<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 shadow rounded">Widget 1</div>
        <div className="bg-white p-4 shadow rounded">Widget 2</div>
        <div className="bg-white p-4 shadow rounded">Widget 3</div>
      </div>*/}
      <InteractiveMap />
    </div>
  );
};

export default MainContent;
