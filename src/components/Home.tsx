import logo from "../assets/oohyeah-logo-black.png";

interface HomeProps {
  scrollToSection?: (sectionId: string) => void;
  navigateToSection?: (sectionId: string) => void;
}

const Home: React.FC<HomeProps> = ({ scrollToSection, navigateToSection }) => {
  const handleClick = (section: string) => {
    if (scrollToSection) {
      scrollToSection(section);
    }

    if (navigateToSection) {
      navigateToSection(section);
    }
  };

  return (
    <div className="h-screen flex w-full bg-deluxe-gray rounded-br-custom-br justify-center items-center">
      <div className="flex flex-col items-center space-y-6 animate-fadeIn">
        <img
          src={logo}
          alt="logo"
          className="h-20 object-contain transition-transform duration-300 hover:scale-110"
        />
        <ul className="font-bold space-y-4 w-full">
          {[
            { label: "DOMINATE THE STREETS", section: "whoWeAre" },
            { label: "ABOUT US", section: "whyUs" },
            { label: "GET IN TOUCH", section: "contact" },
          ].map((item) => (
            <li
              key={item.section}
              className="w-full text-2xl hover:scale-110 hover:text-ooh-yeah-pink transition-colors duration-300"
            >
              <button
                type="button"
                className="w-full"
                onClick={() => handleClick(item.section)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;
