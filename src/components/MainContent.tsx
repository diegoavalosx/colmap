import InteractiveMap from "./InteractiveMap";
import { useAuth } from "./useAuth";

const MainContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      {user && (
        <h1 className="text-3xl font-semibold text-center">
          {`Welcome to the Dashboard, ${user.displayName || user.email}!`}
        </h1>
      )}
      {/*<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 shadow rounded">Widget 1</div>
        <div className="bg-white p-4 shadow rounded">Widget 2</div>
        <div className="bg-white p-4 shadow rounded">Widget 3</div>
      </div>*/}
      <InteractiveMap />
    </>
  );
};

export default MainContent;
