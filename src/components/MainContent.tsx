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
      <div className="h-full p-12">
        <InteractiveMap />
      </div>
    </>
  );
};

export default MainContent;
