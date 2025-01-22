import { Menu, X } from "lucide-react";
import logo from "../assets/oohyeah-logo-black.png";
import { useState } from "react";

interface NavbarProps {
  scrollToSection: (sectionId: string) => void;
  activeSection: string;
}

const NavBar: React.FC<NavbarProps> = ({ scrollToSection, activeSection }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleSectionClick = (sectionId: string) => {
    scrollToSection(sectionId);
    setIsOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full z-10 h-20">
      <div className="md:flex justify-between items-center text-black py-4 px-8 md:px-10 bg-deluxe-gray h-full">
        <img
          src={logo}
          alt="Logo"
          className="w-52 hover:scale-105 transition-all ms-10 relative z-10"
        />
        <button
          onClick={toggleMenu}
          className="w-7 h-7 absolute right-8 top-6 cursor-pointer md:hidden"
          type="button"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
        <ul
          className={`md:flex md:items-center font-semibold text-base md:pb-0 md:static md:z-auto z-1 w-full md:w-auto absolute bg-deluxe-gray ${
            isOpen ? "block" : "hidden"
          } md:block flex top-full left-0 right-0 items-center justify-center`}
        >
          {["home", "whoWeAre", "whyUs", "contact"].map((sectionId) => (
            <li key={sectionId}>
              <button
                type="button"
                className={`p-3 font-bold rounded-md duration-300 hover:scale-105 transition-all cursor-pointer ${
                  activeSection === sectionId
                    ? "text-ooh-yeah-pink"
                    : "hover:text-ooh-yeah-pink"
                }`}
                onClick={() => handleSectionClick(sectionId)}
              >
                {sectionId === "home"
                  ? "Home"
                  : sectionId === "whoWeAre"
                  ? "About Us"
                  : sectionId === "contact"
                  ? "Contact Us"
                  : "Why Us"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NavBar;
