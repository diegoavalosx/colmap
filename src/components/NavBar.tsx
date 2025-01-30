import { forwardRef } from "react";
import logo from "../assets/oohyeah-logo-black.png";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  scrollToSection: (sectionId: string) => void;
  activeSection: string;
}

const NavBar = forwardRef<HTMLDivElement, NavbarProps>(
  ({ scrollToSection, activeSection }, ref) => {
    const navigate = useNavigate();

    const handleSectionClick = (sectionId: string) => {
      scrollToSection(sectionId);
      if (sectionId === "dashboard") {
        navigate("/login");
      }
    };

    return (
      <div className="fixed top-0 left-0 w-full z-10 h-30 md:h-20" ref={ref}>
        <div className="flex flex-col md:flex-row justify-between md:items-center text-black py-2 px-0 md:px-10 md:py-4 bg-deluxe-gray h-full">
          <div className="flex h-14 align-center justify-center">
            <img
              src={logo}
              alt="Logo"
              className="w-52 hover:scale-105 transition-all md:ms-10 relative z-10 self-center"
            />
          </div>
          <ul className="md:items-center font-semibold text-base md:pb-0 md:static md:z-auto z-1 w-full md:w-auto bg-deluxe-gray flex top-full left-0 right-0 items-center justify-around h-14 md:h-20">
            {["home", "whoWeAre", "contact", "dashboard"].map((sectionId) => (
              <li key={sectionId} className="text-center">
                <button
                  type="button"
                  className={`p-0 md:p-3 font-bold rounded-md duration-300 hover:scale-105 transition-all cursor-pointer ${
                    activeSection === sectionId ? "text-ooh-yeah-pink" : ""
                  }`}
                  onClick={() => handleSectionClick(sectionId)}
                >
                  {sectionId === "home"
                    ? "Home"
                    : sectionId === "whoWeAre"
                    ? "About Us"
                    : sectionId === "contact"
                    ? "Contact Us"
                    : sectionId === "dashboard"
                    ? "Client Portal"
                    : ""}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
);

export default NavBar;
