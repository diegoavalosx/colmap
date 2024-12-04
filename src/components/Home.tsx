import { useNavigate } from "react-router-dom";
import logo from "../assets/oohyeah-logo-black.png";

interface HomeProps {
  scrollToSection?: (sectionId: string) => void;
  navigateToSection?: (sectionId: string) => void;
}

const Home: React.FC<HomeProps> = ({ scrollToSection, navigateToSection }) => {
  const navigate = useNavigate();

  const handleClick = (section: string) => {
    if (scrollToSection) {
      scrollToSection(section);
    }

    if (navigateToSection) {
      navigateToSection(section);
    }
  };

  return (
    <div className="h-screen flex-col flex w-full bg-deluxe-gray justify-center items-center space-y-10 animate-fadeIn">
      <img
        src={logo}
        alt="logo"
        className="h-24 object-contain transition-transform duration-300 hover:scale-110"
      />
      <ul className="font-bold space-y-8 w-full">
        {[
          { label: "DOMINATE THE STREETS", section: "whoWeAre" },
          { label: "ABOUT US", section: "whyUs" },
          { label: "GET IN TOUCH", section: "contact" },
          { label: "DASHBOARD", section: "dashboard" },
        ].map((item) => (
          <li
            key={item.section}
            className="w-full text-2xl hover:scale-110 hover:text-ooh-yeah-pink transition-colors duration-300"
          >
            <button
              type="button"
              className="w-full"
              onClick={() => {
                if (item.section === "dashboard") {
                  navigate("/login");
                }
                handleClick(item.section);
              }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
